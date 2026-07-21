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

[Unreleased]: https://github.com/BiSemaphore/ascent/commits/main
