# Changelog

All notable changes to Ascent are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project ships one release per completed roadmap phase (see
[docs/ROADMAP.md](docs/ROADMAP.md)); the first tagged release is `v0.1.0` when
Phase 1 is complete.

## [Unreleased]

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

[Unreleased]: https://github.com/BiSemaphore/ascent/commits/main
