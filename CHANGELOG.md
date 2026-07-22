# Changelog

All notable changes to Ascent are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project ships one release per completed roadmap phase (see
[docs/ROADMAP.md](docs/ROADMAP.md)); the first tagged release is `v0.1.0` when
Phase 1 is complete.

## [Unreleased]

### Added

- Kafka event backbone (single-node KRaft) in the stack.
- `@ascent/contracts` shared lib: the event envelope and `LearnerEnrolled` type.
- Cohort publishes `learner.enrolled` via the **Transactional Outbox**: the event
  is written in the enroll transaction, a relay (`FOR UPDATE SKIP LOCKED`) publishes
  it to Kafka and stamps it published (at-least-once, no dual-write).
- Progress service (NestJS, own Postgres): consumes `learner.enrolled` and
  projects per-learner enrollments; idempotent consumer (`processed_events`
  dedup); `GET /api/progress` returns a learner's cohorts, built from events.
- `experiments/kafka-raw`: raw kafkajs producer/consumer demo.

## [0.2.0] - 2026-07-22

Phase 2: Cohorts and concurrency-safe enrollment, plus an enterprise Angular
frontend architecture. REST only, no Kafka yet.

### Added

- Cohort service (NestJS, own Postgres): admin opens a cohort of a program (start
  date, seat limit); learners enroll; anyone browses cohorts with seats-left.
- Concurrency-safe enrollment: atomic conditional `UPDATE ... WHERE seats_taken <
  seat_limit` in a transaction plus a unique constraint. Load-tested: 20 concurrent
  enrollments on a 5-seat cohort yield exactly 5 enrolled, no overselling.
- Gateway routes `/api/cohorts`; cohort service containerized in the compose stack.
- Cohort enrollment UI: browse cohorts with a seat meter, enroll, staff open
  cohorts (Angular).
- Frontend architecture (enterprise Angular): Component -> Facade -> Repository ->
  HttpClient layering, feature-first structure with per-feature lazy routes,
  centralized endpoints + environment config, auth + error interceptors
  (401 -> logout), Reactive Forms, OnPush, an `*appHasRole` permission directive,
  typed models/envelopes, and a minimal design system (tokens, Space Grotesk /
  IBM Plex, light + dark). Documented in `docs/CONVENTIONS.md` section 14.

## [0.1.0] - 2026-07-22

Phase 1: Auth + Content behind an Nginx gateway with a minimal Angular shell,
REST only, no Kafka.

### Added

- Monorepo skeleton with npm workspaces (`services/*`, `libs/*`, `web`).
- `docker-compose` stack with the Auth service's Postgres and MongoDB.
- Auth service (NestJS):
  - `POST /auth/register` and `POST /auth/login` with bcrypt password hashing
    and JWT issuance.
  - `GET /auth/me` protected by a JWT guard; `RolesGuard` and `@Roles()` for
    role-based access.
  - Request validation via class-validator DTOs and a global `ValidationPipe`.
  - Validated environment config that fails fast on missing or invalid vars.
  - Graceful shutdown that closes the Postgres pool and Mongo client.
  - Swagger API docs at `/docs`; `/health` pings Postgres and MongoDB.
- Postgres data layer via Drizzle with `drizzle-kit` migrations (`users` table).
- MongoDB activity logging via the native driver (`user.registered`,
  `user.logged_in`, `login.failed`).
- Drizzle seeder with a default admin user (`npm run seed`).
- Shared `@ascent/auth` library (JWT strategy, `JwtAuthGuard`, `RolesGuard`,
  `@Roles`, `@CurrentUser`, `Role`); Auth refactored to consume it.
- Content service (NestJS): `programs → courses → modules → lessons`, CMS write
  for instructors/admins and role-filtered delivery reads for learners, RBAC via
  `@ascent/auth`, own Postgres via Drizzle.
- `docs/CONVENTIONS.md` service blueprint; ARCHITECTURE cross-cutting concerns
  (gateway responsibilities, rate limiting, load balancing, scheduled jobs).
- Nginx gateway routing `/api/auth/*` and `/api/content/*` with per-IP edge rate
  limiting (`limit_req`), single entry point on port 8080.
- Full containerization: multi-stage Dockerfiles for Auth and Content, startup
  migrations, compose runs the whole stack (`docker-compose up`).
- Minimal Angular shell (`web/`): login/register, role-gated program+course
  creation for instructors, program list for learners; dev server proxies
  `/api/*` to the gateway.

[Unreleased]: https://github.com/BiSemaphore/ascent/compare/v0.2.0...main
[0.2.0]: https://github.com/BiSemaphore/ascent/releases/tag/v0.2.0
[0.1.0]: https://github.com/BiSemaphore/ascent/releases/tag/v0.1.0
