# auth service

Accounts and identity. Owns users, passwords, roles, and issues JWTs. Also records
auth activity (register, login, failed login) to MongoDB.

- Port `3001`, Postgres `auth-db` (5433), Mongo `auth-mongo` (27018)
- Routes: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `GET /health`
- Gateway: `/api/auth/*`; Swagger at `/docs`

```bash
npm run start:dev -w services/auth   # dev
npm run db:generate -w services/auth # after a schema change
npm run db:migrate  -w services/auth
npm run seed        -w services/auth # default admin
```

Built to `docs/CONVENTIONS.md`.
