# cohort service

Scheduled batches of a program with limited seats, and concurrency-safe enrollment.
Enrollment uses an atomic conditional `UPDATE ... WHERE seats_taken < seat_limit` in
a transaction (plus a unique constraint) so seats never oversell.

- Port `3003`, Postgres `cohort-db` (5435)
- Routes: `GET/POST /`, `GET /:id`, `POST /:id/enroll`, `GET /health`
- Gateway: `/api/cohorts`; Swagger at `/docs`
- RBAC: staff open cohorts, learners enroll

```bash
npm run start:dev  -w services/cohort
npm run db:generate -w services/cohort
npm run db:migrate  -w services/cohort
```

Built to `docs/CONVENTIONS.md`.
