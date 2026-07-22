# Roadmap — Ascent

Built in **phases**. Each phase ends in something that **runs and is understandable** before we add the next. We do not add a technology or service until a phase genuinely needs it.

This roadmap sequences the **cohort-based LMS**: we build a working content-and-cohort platform first, then layer on assessments, real-time, and production concerns.

> **Note on CMS:** there is no separate "CMS." Content authoring (instructor/admin creating courses, lessons, problems) is the *write side* of the **Content service**; content delivery (learners viewing) is the *read side*. Same service, two audiences.

---

## Phase 0 — Project setup  (done; Docker daemon check pending)
**Goal:** a clean monorepo skeleton and tooling.
- [x] Folder structure (`services/`, `gateway/`, `web/`, `libs/`, `docs/`)
- [x] Git initialized (branch `main`), `.gitignore`
- [x] Package manager decided: **npm workspaces** (root `package.json` declares `services/*`, `libs/*`, `web`)
- [x] Empty `docker-compose.yml` we'll grow (`services: {}`)
- [ ] Confirm Docker Desktop runs locally. **Daemon not currently running; start Docker Desktop before Phase 1.**

**Done when:** the repo is organized and version-controlled.

---

## Phase 1 — Auth + Content (CMS + delivery) + gateway  (done; released as v0.1.0)
**Goal:** the LMS backbone — accounts and course content — end to end, REST only, no Kafka yet.
- [x] **Auth** service (NestJS): register, login, JWT, roles (learner / instructor / admin)
- [x] **Content** service (NestJS):
  - *CMS (write):* instructor creates programs → courses → modules → lessons
  - *Delivery (read):* learners list/view published courses & lessons
- [x] Each service its own **Postgres**
- [x] **Nginx** gateway routing `/api/auth/*` and `/api/content/*`
- [x] `docker-compose up` runs it all
- [x] Minimal **Angular** shell: log in; instructor creates a course; learner sees the course list

**Done when:** an instructor can create a course through the app and a learner can see it — all traffic flowing through Nginx to two independent services.

**Concepts:** NestJS modules/DI, JWT + role-based auth, per-service DB, reverse-proxy routing, docker-compose, role-based UI in Angular.

---

## Phase 2 — Cohorts + concurrency-safe enrollment  (done; released as v0.2.0)
**Goal:** the heart of the product — scheduled batches with limited seats.
- [x] **Cohort** service (NestJS): admin opens a cohort of a program (start date, schedule, **seat limit**, mentors)
- [x] Learner **enrolls** in a cohort — concurrency-safe so seats never oversell (atomic conditional update / row lock)
- [x] Angular: browse open cohorts, enroll, see "X seats left"

**Done when:** hammering the enroll endpoint concurrently never exceeds the seat limit, and a learner is tied to a cohort.

**Concepts:** transactions, row locks, atomic updates, load-testing a race condition — the "no overselling" pattern applied to seats.

---

## Phase 3 — Kafka event backbone + Progress  (done; released as v0.3.0)
**Goal:** introduce async, event-driven communication (the microservices spine).
- [x] Learn Kafka concepts first (brokers, topics, partitions, offsets, consumer groups)
- [x] Add **Kafka** to compose; build the first producer/consumer **raw with `kafkajs`** to understand it, then adopt NestJS's Kafka transport
- [x] `LearnerEnrolled` event (Cohort), published via the **Transactional Outbox**
- [x] `LessonCompleted` event (Content), published via the outbox; Progress tracks completed lessons
- [x] **Progress** service consumes both events (idempotent consumer)
- [x] Introduce `libs/contracts` for shared event types

**Done when:** completing a lesson in one service updates progress in another via Kafka, with no direct call between them.

**Concepts:** Kafka fundamentals, producers/consumers, NestJS Kafka transport, event contracts, decoupling, Transactional Outbox, idempotent consumers.

---

## Payments — Stripe cohort purchase  ← schedulable next (needs Phases 2 + 3)
**Goal:** paid cohorts, gated on payment via an event (not a synchronous call).
- [ ] **Payment** service (own Postgres): create a **Stripe Checkout Session**, record payments
- [ ] Stripe **webhook** endpoint; verify the signature; idempotent by Stripe event id
- [ ] Emit `PaymentCompleted`; Cohort consumes it and enrolls (paid cohorts). Free cohorts skip
- [ ] Cohorts gain `price` / `currency`; Angular "buy seat" flow
- [ ] Stripe **test mode** only; secrets server-side

**Done when:** a learner buys a paid cohort through Stripe test checkout and is enrolled by the resulting event.

**Concepts:** Stripe Checkout + webhooks, webhook signature verification, event-gated workflows, no card data on our servers.

---

## Phase 4 — Assessments + the Judge
**Goal:** hands-on, auto-graded learning — the flagship engineering piece.
- [ ] **Assessment** support in Content: quizzes (auto-graded) and coding problems (with hidden test cases)
- [ ] **Judge** service: accept a code submission, store it, emit `SubmissionCreated`
- [ ] A **worker** runs code in a **Docker sandbox** (time/memory limits) against test cases, emits `SubmissionJudged` with the verdict
- [ ] Angular: in-browser **Monaco** editor + submit button; deadlines on assignments

**Done when:** a learner submits code from the UI and gets a real verdict against hidden test cases.

**Concepts:** job queues, sandboxing untrusted code, worker pools, resource limits.

---

## Phase 5 — Fan-out: gamification, cohort leaderboard, notifications, real-time
**Goal:** show event fan-out and real-time UX within a cohort.
- [ ] **Gamification**: XP, streaks, **cohort leaderboard** (Redis sorted sets) — consumes `SubmissionJudged`
- [ ] **Notification**: announcements, deadline reminders, results (consumes many events)
- [ ] **Realtime** WebSocket gateway: verdicts and leaderboard updates stream to the browser live (Angular Signals)
- [ ] Discussions / doubts within a cohort (basic)

**Done when:** one submission updates progress, XP, the cohort leaderboard, a notification, and the live UI — all from a single event.

**Concepts:** event fan-out, Redis sorted sets, WebSockets, Signals-driven real-time UI.

---

## Phase 6 — Live classes + scheduled unlock
**Goal:** the cohort's time dimension.
- [ ] Cohort **schedule**: content/modules unlock over time
- [ ] **Live class** sessions per cohort (embed/link video — no streaming pipeline)
- [ ] Reminders via Notification; calendar view in Angular
- [ ] **Certificate** issued on cohort completion

**Done when:** a cohort follows a schedule, content unlocks on time, and completion yields a certificate.

**Concepts:** scheduled/time-based events, cron/queues, cohort lifecycle.

---

## Phase 7 — Production polish
**Goal:** make it look and behave like a real system.
- [ ] **Nginx load balancing** across ≥2 replicas of a service
- [ ] **Observability**: structured logs, correlation IDs, health checks, Prometheus + Grafana
- [ ] Angular modern-feature pass: `@defer`, SSR for public program pages, zoneless (optional)
- [ ] Instructor & admin **dashboards / analytics**
- [ ] **Architecture diagram** + polished README + **resume bullets**

**Done when:** the project is demoable, observable, and documented well enough to present in an interview.

---

## Guiding principles
- **Each phase runs.** No half-built phases.
- **Understand before you extend.** We explain each piece as we build; learn the raw layer before framework abstractions (especially Kafka).
- **Simplicity first.** Add a service/tech only when a phase needs it.
- **Depth over breadth.** A few hard problems done well beats many shallow features.
- **Design the whole, build in slices.** The PRD is the full product; each phase is a working milestone.

---

## Releases
One release per completed phase. When a phase's "Done when" is met, we tag it and
cut a GitHub Release with notes.

| Phase | Version |
| --- | --- |
| Phase 1 (Auth + Content + gateway) | `v0.1.0` |
| Phase 2 (Cohorts + enrollment) | `v0.2.0` |
| Phase 3 (Kafka + Progress) | `v0.3.0` |
| Phase 4 (Assessments + Judge) | `v0.4.0` |
| Phase 5 (Fan-out + real-time) | `v0.5.0` |
| Phase 6 (Live classes + unlock) | `v0.6.0` |
| Phase 7 (Production polish) | `v0.7.0` |
| Full product | `v1.0.0` |

Steps at the end of a phase:
```
# 1. move CHANGELOG.md [Unreleased] entries under a new [vX.Y.0] heading
git tag vX.Y.0
git push origin vX.Y.0
gh release create vX.Y.0 --title "Phase N: <name>" --notes "<what shipped>"
```
Phase 0 (this scaffold) is pre-release, no tag. The first release is `v0.1.0`.
</content>
