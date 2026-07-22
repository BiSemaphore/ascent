# Engineering Conventions — Ascent

This is the **service blueprint**. Every service is an instance of the patterns
below, not a fresh improvisation. If a service needs to deviate, the deviation is
explicit and reviewable against this document.

Read alongside `ARCHITECTURE.md` (the *what*: services, data, communication) and
`ROADMAP.md` (the *when*). This doc is the *how*.

---

## 1. Monorepo layout

```
ascent/
  services/<name>/   one NestJS service per bounded context
  libs/<name>/       shared workspace packages (@ascent/<name>)
  gateway/           Nginx config
  web/               Angular app
  docs/              PRD, ARCHITECTURE, ROADMAP, CONVENTIONS
  docker-compose.yml
  package.json       npm workspaces root
```

- Package manager: **npm workspaces**. Dependencies hoist to the root
  `node_modules`; one root `package-lock.json`.
- A service is added by scaffolding into `services/<name>` and applying this doc.

## 2. Service anatomy

Every service follows the same internal layout:

```
services/<name>/
  src/
    main.ts                 bootstrap (section 6)
    app.module.ts           root wiring
    app.controller.ts       GET /health only
    app.service.ts          health check
    config/env.validation.ts
    database/
      schema.ts             Drizzle tables
      database.module.ts    DB connection (section 5)
    <feature>/
      <feature>.module.ts
      <feature>.controller.ts
      <feature>.service.ts
      dto/*.dto.ts
    seed/                   only if the service seeds data (section 9)
  drizzle.config.ts
  drizzle/                  generated migrations (committed)
  .env                      local values (gitignored)
  .env.example              documented template (committed)
```

- **Controllers stay thin** (routing, guards, validation). **Services hold the
  logic.** Data access goes through the injected Drizzle instance.

## 3. Naming

- Files: kebab-case with a role suffix (`auth.service.ts`, `create-course.dto.ts`).
- Classes: PascalCase (`AuthService`, `CreateCourseDto`).
- DI tokens for non-class providers: module-scoped `Symbol` (`export const DB =
  Symbol('DB')`).
- Env vars: `UPPER_SNAKE_CASE`.
- DB tables: plural snake_case; columns snake_case.

## 4. Configuration and environment

- Use `@nestjs/config`; register it once, global, with validation:
  `ConfigModule.forRoot({ isGlobal: true, validate: validateEnv })`.
- `config/env.validation.ts` exports `validateEnv`, a class-validator schema that
  **throws on a missing or malformed variable** so the service refuses to boot.
- Read config through `ConfigService` (`getOrThrow` for required values). Do not
  scatter `process.env` reads through the code.
- Every service keeps a committed `.env.example` and a gitignored `.env`, in sync.
  When a new variable is introduced, add it to both in the same change.

## 5. Data layer (Postgres + Drizzle)

- **One Postgres per service.** Services never read another service's tables.
- ORM: **Drizzle**, migrations via **drizzle-kit**.
- `database/database.module.ts` is `@Global()` and provides two Symbol tokens:
  `PG_POOL` (the `pg` Pool) and `DB` (the Drizzle instance). It implements
  `OnModuleDestroy` to `pool.end()` on shutdown.
- Schema conventions (`database/schema.ts`):
  - `uuid('id').primaryKey().defaultRandom()`
  - `timestamp('created_at', { withTimezone: true }).notNull().defaultNow()`
  - enums via `pgEnum`; foreign keys via `.references(() => x.id, { onDelete: 'cascade' })`
  - export inferred types: `export type Program = typeof programs.$inferSelect;`
- `drizzle.config.ts` reads `DATABASE_URL` (via `dotenv/config`); output to
  `./drizzle`. Migrations are **generated, committed, and applied**, never
  hand-run against the DB.
- Scripts in every service `package.json`:
  `db:generate`, `db:migrate`, `db:studio`.

## 6. Bootstrap (`main.ts`) — identical across services

```ts
const app = await NestFactory.create(AppModule);
app.enableShutdownHooks();
app.useGlobalPipes(new ValidationPipe({
  whitelist: true, forbidNonWhitelisted: true, transform: true,
}));
// Swagger at /docs via DocumentBuilder().addBearerAuth()
const port = app.get(ConfigService).get<number>('PORT') ?? <default>;
await app.listen(port);
```

- Every service exposes **`GET /health`** returning `{ status: 'ok', db: 'up', ... }`
  and **Swagger at `/docs`**.

## 7. HTTP and API

- REST, JSON. Browser talks to services only through the Nginx gateway
  (`/api/<service>/*`); services talk to each other via Kafka (async) once it
  exists.
- Request bodies are DTO classes with class-validator decorators and
  `@ApiProperty` for Swagger. The global `ValidationPipe` enforces them.
- Validate path ids with `ParseUUIDPipe`.
- Use standard Nest exceptions: `NotFoundException`, `ConflictException`,
  `UnauthorizedException`, `ForbiddenException`. Do not invent ad-hoc error shapes.
- Rate limiting has two tiers (see `ARCHITECTURE.md` section 9): global per-IP
  limits live at the Nginx edge; per-user/business limits live in the service via
  `@nestjs/throttler` backed by Redis. Do not put per-IP limiting in services.

## 8. Auth and RBAC

- All JWT verification and role checks come from the shared **`@ascent/auth`**
  library. Services never reimplement them.
- A service that needs auth: import `PassportModule`, provide `JwtStrategy` from
  `@ascent/auth`, and set `JWT_SECRET` (must match the Auth service's secret).
- Protect routes with `@UseGuards(JwtAuthGuard, RolesGuard)` and gate writes with
  `@Roles('instructor', 'admin')`. Read the caller via `@CurrentUser()`.
- `Role` is defined once in `@ascent/auth`. Do not redeclare it.
- Current signing is HS256 with a shared secret (simple, symmetric). Hardening to
  RS256 (Auth signs with a private key, others verify with the public key) is a
  Phase 7 task.

## 9. Seeding

- Seeds are declarative and **idempotent** (a seed checks before it inserts).
- `seed/seed.interface.ts` defines `Seed { name; run(db) }`; `seeder.service.ts`
  runs the list; `seed/seed.ts` is the entrypoint via
  `NestFactory.createApplicationContext`. Exposed as `npm run seed`.

## 10. Shared libraries (`libs/`)

- Cross-cutting code lives in `libs/` **from the start**, as `@ascent/<name>`
  workspace packages. Do not copy shared code between services.
- A lib has: `package.json` (`main: dist/index.js`, `types: dist/index.d.ts`,
  nest packages as `peerDependencies`), a `tsconfig.json` (commonjs, ES2021,
  `declaration: true`, decorators on), and `src/index.ts` as the barrel export.
- A lib compiles to `dist/` and is consumed via the workspace symlink
  (`"@ascent/<name>": "*"`). **Build the lib before the services that import it.**
- Current and planned libs: `@ascent/auth` (JWT, guards, RBAC, `Role`) exists;
  `@ascent/cron` (scheduled jobs, wraps `@nestjs/schedule`) and `@ascent/contracts`
  (shared Kafka event types) are added when their first consumer appears.

## 11. MongoDB (where used)

- Native `mongodb` driver (no ODM). `mongo/mongo.module.ts` is `@Global()` and
  provides `MONGO_CLIENT` and `MONGO` (the `Db`) as Symbol tokens; implements
  `OnModuleDestroy` to close the client.
- Current use: the Auth service's activity log (`user.registered`,
  `user.logged_in`, `login.failed`). Extracted to an Activity service in Phase 3.

## 12. Ports, containers, volumes

Fixed, non-overlapping allocations. New services take the next free number.

| Service | HTTP port | Postgres (host) | Other |
| --- | --- | --- | --- |
| auth | 3001 | 5433 (`ascent-auth-db`) | Mongo 27018 (`ascent-auth-mongo`) |
| content | 3002 | 5434 (`ascent-content-db`) | |
| cohort | 3003 | 5435 | (future) |
| _next_ | 300N | 543N | |

- Container names: `ascent-<service>-<db>`. Named volumes:
  `<service>-<db>-data`. Every datastore has a `healthcheck`.

## 13. Comments, style, commits

- **Minimal comments.** Write self-explanatory code; comment only a non-obvious
  *why*, a gotcha, or a cross-service dependency. No comments that restate code.
- No emojis and no em-dashes anywhere (chat, docs, code, commits).
- Prettier + ESLint come from the Nest scaffold; keep them.
- **Conventional commits** (`feat:`, `fix:`, `chore:`, `docs:`), scoped where
  useful (`feat(auth): ...`). No Claude/Anthropic attribution in commits or PRs.
- Update `CHANGELOG.md` `[Unreleased]` as features land. One tag + GitHub Release
  per completed phase (see `ROADMAP.md`).

## 14. Frontend (Angular)

Modern, standalone Angular built to enterprise conventions. The Angular app lives
in `web/`.

- **Standalone components** (no NgModules), **signals** for state, new control flow
  (`@if` / `@for`), and lazy-loaded routes (`loadComponent`).
- **Feature-first folders:**
  ```
  web/src/
    environments/            environment.ts (+ .development.ts, fileReplacements)
    app/
      core/
        config/api.ts        one map of every endpoint URL
        services/            one service per domain (AuthService, ContentService, ...)
        guards/              route guards
        interceptors/        auth + error (functional interceptors)
      shared/
        models/              typed DTOs
        ui/                  reusable presentational components
      features/<feature>/    lazy-loaded pages
  ```
- **API calls live in services, never in components.** Components inject a domain
  service and consume it. Reads use `httpResource` exposed as a service field;
  mutations are service methods returning typed observables. No `HttpClient` in
  components.
- **One service per domain.** No god `ApiService`. Injectable services use the
  `Service` suffix consistently (`auth.service.ts` -> `AuthService`); components use
  no suffix (`Login`, `Cohorts`); guards and interceptors are camelCase functions
  (`authGuard`, `errorInterceptor`).
- **URLs in one place:** `core/config/api.ts`, built from `environment.apiBase`.
  Never hardcode a URL string in a service or component.
- **Typed DTOs in `shared/models`.** No `any`.
- **Functional interceptors:** `auth` attaches the JWT; `error` centralises failure
  handling (401 -> logout -> `/login`). Do not attach tokens or handle 401s ad hoc.
- **RxJS orchestration lives in services** (`switchMap` etc.), not components; never
  nest `subscribe`. Components subscribe once (or use `httpResource`/`async`).
- **State:** signals-first via services. No NgRx unless complexity demands it.
- **Design system:** tokens in `styles.scss` (color, type, spacing; light + dark,
  theme-aware). Type: Space Grotesk (display), IBM Plex Sans (body), IBM Plex Mono
  (data/labels). Base components are class-based; keep the look minimal and precise.
