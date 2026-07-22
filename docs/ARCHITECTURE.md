# Architecture — Ascent

How the system is put together: the services, how they talk, where data lives, and the key technical decisions.

---

## 1. High-level picture

```
                       ┌─────────────┐
   Angular SPA  ─────► │    Nginx    │  reverse proxy + load balancer + API gateway
   (browser)          └──────┬──────┘
                             │ routes /api/<service>/*  (REST, sync)
        ┌────────────┬───────┼────────────┬──────────────┐
        ▼            ▼       ▼            ▼              ▼
     ┌──────┐   ┌────────┐ ┌────────┐ ┌──────────┐ ┌────────────┐
     │ Auth │   │Content │ │ Cohort │ │  Judge   │ │Gamification│  … more
     └──┬───┘   └───┬────┘ └───┬────┘ └────┬─────┘ └─────┬──────┘
        │           │          │           │             │
        ▼           ▼          ▼           ▼             ▼
     Postgres    Postgres   Postgres    Postgres    Redis + Postgres   (one DB per service)

        └─────────────── async events ──────────────┘
                            ▼
                       ┌─────────┐
                       │  Kafka  │   event backbone (the spine)
                       └─────────┘
```

- **Synchronous** requests (browser → service) go through **Nginx** over REST.
- **Asynchronous** communication between services goes through **Kafka** events.
- Each service owns its **own database** — services never share a DB or reach into each other's tables. They talk only via the gateway (sync) or Kafka (async).

## 2. Services (bounded contexts)

| Service | Owns | Talks via |
| --- | --- | --- |
| **Auth** | users, passwords, JWT, roles (learner / instructor / admin) | REST; emits `UserRegistered` |
| **Content** | **programs → courses → modules → lessons**, quizzes, coding problems + test cases. **Write side = CMS (instructor authoring); read side = delivery (learner viewing)** | REST |
| **Cohort** | cohorts (scheduled batches of a program): start date, **schedule**, **seat limit**, mentors, and learner **enrollments** (concurrency-safe) | REST; emits `LearnerEnrolled` |
| **Judge** | code submissions, sandboxed execution, verdicts | consumes `SubmissionCreated`; emits `SubmissionJudged` |
| **Progress** | per-learner completion vs the cohort curriculum | consumes `SubmissionJudged`, `LessonCompleted` |
| **Gamification** | XP, streaks, **cohort leaderboard** (Redis sorted sets) | consumes `SubmissionJudged` |
| **Notification** | announcements, deadline reminders, results (email / in-app) | consumes many events |
| **Realtime** | WebSocket gateway; pushes verdicts & leaderboard updates to the browser | consumes `SubmissionJudged` |

> **CMS is not a separate service** — it's the instructor/admin *write* side of the **Content** service; learner *delivery* is the read side. Same data, two audiences.
>
> We won't build all of these at once — see the roadmap. Phase 1 is just **Auth + Content** behind the gateway; the **Cohort** service arrives in Phase 2.

## 3. The key event flow (why Kafka is the spine, not decoration)

```
Learner submits code
   → Judge: create submission  ──emit──►  "SubmissionCreated"
   → Judge worker runs it in a sandbox against test cases
   → Judge  ──emit──►  "SubmissionJudged" { verdict, passed, total }
        ├─► Progress    marks the problem solved
        ├─► Gamification awards XP, updates streak + leaderboard
        ├─► Notification "Nice! Accepted."
        └─► Realtime     pushes the verdict to the learner's browser (WebSocket)
```

One event, many independent consumers — that's genuine event-driven architecture. Other flows work the same way: `LearnerEnrolled` (Cohort) and `LessonCompleted` (Content) feed Progress, Notification, and Gamification without any direct service-to-service call.

## 4. Communication rules

- **Browser → service:** REST through Nginx (`/api/auth/*`, `/api/content/*`, `/api/cohort/*`, …).
- **Service → service (async):** Kafka events (fire-and-forget, decoupled). We use NestJS's built-in Kafka transport (`@EventPattern`).
- **Service → service (sync, if unavoidable):** REST, but we prefer async events to keep services decoupled.

## 5. Data

- **PostgreSQL per service** — the system of record for relational data (users, content, cohorts, enrollments). Independent schemas, migrations, and lifecycles. Accessed via **Drizzle** (`drizzle-kit` migrations).
- **MongoDB** — activity feed, audit trail, security events, and structured app logs. Append-heavy, schema-flexible, rarely joined, so a document store fits better than Postgres. Accessed via the official `mongodb` native driver.
- **Redis** — leaderboards (sorted sets), caching, and later the judge's job coordination.
- **Kafka** — the event log; durable, replayable.

### Activity logging (MongoDB) — how it evolves
The end-state is a dedicated **Activity service** that owns MongoDB and, from Phase 3 on, consumes Kafka events (`UserRegistered`, `LearnerEnrolled`, `SubmissionJudged`, ...) and writes activity documents. An activity log is a natural Kafka fan-out consumer.

We build it in slices: **for now it starts inside the Auth service** (an activity-logging module records register, login, and failed-login events to MongoDB). It is extracted into its own service and switched to Kafka consumption in Phase 3.

## 6. Concurrency-critical spots (the hard problems)

- **Cohort enrollment:** limited seats + many concurrent learners → atomic conditional update / row lock so seats never go negative (the "no overselling" pattern).
- **Judge:** untrusted code runs in an isolated **Docker sandbox** with CPU/memory/time limits; a queue of workers processes submissions.

## 7. Tech decisions (and why)

| Decision | Why |
| --- | --- |
| **NestJS** for all services | First-class Kafka microservice transport, consistent DI/module structure across services, TypeScript throughout |
| **Kafka** (not just REST) | The project's core learning goal is event-driven architecture; the judge→fan-out flow needs it authentically |
| **Postgres per service** | True service independence; each context owns its data |
| **Drizzle ORM** (data layer) | SQL-first and thin: schema and queries stay close to raw SQL and fully type-safe, so the DB layer is understood, not a black box. Migrations via `drizzle-kit`. Same choice across all services |
| **Nginx** gateway/LB | Single entry point, routing, load balancing, TLS termination |
| **Angular** (modern) | Showcase Signals, standalone components, new control flow, `@defer`, real-time via WebSocket |
| **Docker Compose** | One command to run the whole system locally |

## 8. Repository structure (target)

```
ascent/
├── docs/                 # PRD, architecture, roadmap
├── gateway/              # Nginx config
├── services/
│   ├── auth/             # NestJS service
│   ├── content/          # NestJS service (CMS authoring + delivery)
│   ├── cohort/           # NestJS service (added Phase 2)
│   └── …                 # more services added per phase
├── web/                  # Angular app
├── libs/                 # shared TS (event contracts, DTOs) — added when needed
└── docker-compose.yml    # ties it all together
```

We start simple (each service standalone) and add shared libraries and services only when a phase needs them.

## 9. Cross-cutting concerns

Concerns that are not owned by one service. They live at the **edge** (Nginx) when
they are infrastructure-level, and drop into a **service** only when they need
identity or business context. They are never copied per service; reusable pieces
go in `libs/`.

### Rate limiting (two tiers)
- **Edge (Nginx), global / per-IP:** `limit_req` at the gateway, before requests
  reach any service. Coarse abuse and DoS protection; the gateway only knows IPs
  and paths.
- **Service (NestJS), per-user / per-endpoint:** business-aware limits that need
  the JWT identity (e.g. login-attempt throttle, submission throttle), via
  `@nestjs/throttler`, with **Redis** as the shared counter store so a limit holds
  across replicas.

### Load balancing
- Only at **Nginx** (`upstream` across 2+ replicas of a service). Services stay
  stateless so any replica can serve any request. Introduced in Phase 7.
- Kafka consumer groups spread *async* work across consumers; that is a separate
  axis from HTTP load balancing, not a substitute.

### Scheduled jobs (cron)
- A shared **`libs/cron` (`@ascent/cron`)** wrapping `@nestjs/schedule`, imported
  by the service that owns a scheduled task. Expected uses: deadline reminders
  (Notification, Phase 5), cohort content unlocks and certificate issuance
  (Phase 6), retention/cleanup jobs. Built when the first real job appears, not
  before.

### The gateway's job (Nginx)
Single entry point for all browser traffic: routing (`/api/<service>/*`), TLS
termination, per-IP rate limiting, request-size caps, and load balancing across
replicas. It holds no business logic.
</content>
