# Ascent

A **cohort-based EdTech platform (LMS)** — think **Scaler** — built as a **microservices system** to learn and demonstrate real distributed-systems engineering.

Instructors author program curricula (courses → modules → lessons + assessments); admins open scheduled **cohorts** with limited seats; learners enroll in a cohort and progress together through content, **auto-graded coding problems** (an online judge), live classes, XP/leaderboards, and a completion path. Content authoring is the CMS side of the platform; delivery is the learner side — same product, two audiences.

> This repo is a learning + portfolio project. It is a full LMS product, built **in slices** (see the roadmap), with deliberate depth on a few hard problems: event-driven architecture (Kafka), safe code execution, cohort-seat concurrency, and real-time.

## Tech stack

| Layer | Choice |
| --- | --- |
| Services | **NestJS** + TypeScript (one service per bounded context) |
| Async messaging | **Apache Kafka** (event-driven backbone) |
| Sync entry | **Nginx** reverse proxy + load balancer / API gateway |
| Databases | **PostgreSQL** (one per service) |
| Cache / leaderboards | **Redis** |
| Frontend | **Angular** (standalone components, Signals, modern control flow) |
| Local orchestration | **Docker** + docker-compose |

## Documentation

- [`docs/PRD.md`](docs/PRD.md) — what we're building and why (product requirements)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — services, communication, data, tech decisions
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — the phased build plan

## Status

**Phase 0 — project setup.** See the roadmap for what's next.
</content>
