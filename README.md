# Ascent

A **cohort-based EdTech platform (LMS)**, think **Scaler**, built as a
**microservices system** to learn and demonstrate real distributed-systems
engineering.

Instructors author program curricula (courses, modules, lessons + assessments);
admins open scheduled **cohorts** with limited seats; learners enroll in a cohort
and progress together through content, auto-graded coding problems, live classes,
and a completion path. Content authoring is the CMS side; delivery is the learner
side, one product, two audiences.

> Learning and portfolio project, built **in slices** (see the roadmap) with
> deliberate depth on a few hard problems: event-driven architecture (Kafka), safe
> code execution, cohort-seat concurrency, and real-time.

## Stack

| Layer | Choice |
| --- | --- |
| Services | **NestJS** + TypeScript, one per bounded context |
| Data layer | **Drizzle** over **PostgreSQL** (one DB per service) |
| Documents / logs | **MongoDB** (activity + audit) |
| Async backbone | **Kafka** (from Phase 3) |
| Search (planned) | **Elasticsearch** (event-fed, from Phase 3) |
| Cache / leaderboards | **Redis** (later) |
| Gateway | **Nginx** reverse proxy + rate limiting + load balancing |
| Frontend | **Angular** (standalone, signals, lazy features) |
| Local run | **Docker Compose** |

## Run it

```bash
docker-compose up            # auth, content, cohort, gateway, and datastores
npm install                  # once, at the repo root (npm workspaces)
npm start -w web             # the Angular app on http://localhost:4200
```

The gateway serves the API at `http://localhost:8080/api/*`. A default admin is
seeded: `admin@ascent.local`.

## Layout

```
services/    one NestJS service per bounded context (auth, content, cohort, ...)
libs/        shared workspace packages (@ascent/auth, ...)
gateway/     Nginx config
web/         Angular app
docs/        PRD, ARCHITECTURE, ROADMAP, CONVENTIONS
```

## Docs

- [`docs/PRD.md`](docs/PRD.md) — what we are building and why
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — services, data, communication, decisions
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — the phased build plan
- [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) — the service and frontend blueprint every part follows
- [`CHANGELOG.md`](CHANGELOG.md) — release history

## Status

**Phase 1 shipped (`v0.1.0`).** Auth + Content behind the gateway, with a minimal
Angular shell. **Phase 2 in progress:** the Cohort service and concurrency-safe
enrollment. See the roadmap.
