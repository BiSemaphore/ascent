# Ascent — project context for Claude

Read this first, then read `docs/PRD.md`.

## Writing style (required)
Do NOT use emojis or em-dashes (—) anywhere: not in chat replies, not in docs,
not in code or commit messages. Use plain punctuation instead (commas, colons,
parentheses, or split into two sentences).

## Git commits (required)
Never add Claude/Anthropic attribution to commits. Do NOT append
`Co-Authored-By: Claude <noreply@anthropic.com>` (or any Claude mention) to commit
messages or PR bodies. Commits are authored solely by the user.

## What this is
**Ascent** is a full **EdTech platform — a cohort-based LMS** (think **Scaler**):
instructors build program curricula, admins open scheduled **cohorts** with limited
seats, and learners enroll in a cohort and progress together through content,
assessments (including **auto-graded coding problems**), live classes, and a
completion path. It is a complete LMS product — hands-on coding practice is a
standout *feature*, not the whole thing.

Built as a **microservices system** — a learning + portfolio project for a ~3 YOE
full-stack engineer moving toward an SDE role. Goal: depth on a few genuinely hard
problems (event-driven architecture with Kafka, safe code execution, cohort-seat
concurrency, real-time), designed as the whole product but **built in slices**.

## Current phase
**Documentation & discovery.** We are defining the business and requirements first.
- Do **not** scaffold code, install packages, run `nest`/`ng`/`npm`, init git, or
  publish anything unless explicitly asked.
- We move phase by phase (see `docs/ROADMAP.md`); nothing is built ahead of its phase.

## How to work with this user
- They are **learning** and want to understand *why*, not just receive code. Explain
  concepts in plain language; define jargon.
- They drive the pace. Confirm before creating or changing things. Small steps.
- Business logic and requirements come **before** technology choices.

## Tech direction (decided, but not yet built)
- Services: **NestJS** + TypeScript, one per bounded context.
- Async backbone: **Kafka**. Sync entry: **Nginx** gateway/LB. DB: **Postgres** per
  service. Cache/leaderboards: **Redis**. Frontend: **Angular** (modern: standalone,
  Signals, new control flow). Local run: **Docker Compose**.
- Monorepo layout: everything lives under `ascent/` — `services/`, `web/` (Angular),
  `gateway/`, `libs/`, `docs/`.

## Docs
- `docs/PRD.md` — what we're building and why (business).
- `docs/ARCHITECTURE.md` — services, communication, data, decisions (tech; revisit later).
- `docs/ROADMAP.md` — the phased build plan.
- `docs/CONVENTIONS.md` — the service blueprint every service follows (the *how*).
  Build to this doc; deviations must be explicit, not silent.

## Session commands (slash commands in `.claude/commands/`)
- **`/pickup`** — start of session: reads the docs + git state, reports the current
  phase and the next step. Run this first in a new session.
- **`/handoff`** — end of session: updates the docs (roadmap checkboxes, architecture,
  this file's "next step") so the next session continues without drift. Run before stopping.

## Environment (verified)
Node v26, npm 11, Docker + `docker-compose` (v2 plugin absent; use `docker-compose`),
git. NestJS/Angular CLIs installed per-project when the time comes.

## Learning approach (important — this user cares about it)
The user does NOT want to use frameworks as black boxes. When introducing anything
with heavy abstraction (especially **Kafka**), teach the raw layer FIRST:
1. Explain the concept plainly (e.g. Kafka: brokers, topics, partitions, offsets,
   consumer groups, delivery guarantees) — no framework.
2. Build the first integration RAW (e.g. with `kafkajs` directly) so they feel the
   mechanics.
3. THEN show how NestJS wraps that same thing (`@EventPattern` etc.), so the
   abstraction is a choice made from understanding, not faith.
Always explain *why*, define jargon, and go one small step at a time.

## Where we are / next step
- **Phase 1 done, released as `v0.1.0`.** Shipped: Auth + Content services (own
  Postgres each, Drizzle), shared `@ascent/auth` lib, MongoDB activity logging in
  Auth, Nginx gateway (`/api/*` + edge rate limiting), full `docker-compose` stack,
  and a minimal Angular shell in `web/`. All on `main` at `BiSemaphore/ascent`.
- **Read `docs/CONVENTIONS.md`** — the service blueprint every new service follows.
- Planned but not built (documented in ARCHITECTURE/ROADMAP): `@ascent/cron`
  (scheduled jobs), Elasticsearch Search service (event-fed, post-Kafka).
- **Suggested next:** start **Phase 2** from `docs/ROADMAP.md` — the **Cohort**
  service and concurrency-safe enrollment (seat limits, no overselling). Build it to
  the conventions doc. Confirm scope with the user first.
- To run locally: `docker-compose up` (stack), and `npm start -w web` for the SPA.
</content>
