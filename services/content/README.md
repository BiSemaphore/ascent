# content service

Curriculum: programs, courses, modules, lessons. Write side is the CMS (instructors
author and publish); read side is delivery (learners see published content).

- Port `3002`, Postgres `content-db` (5434)
- Routes: `GET/POST /programs`, `GET /programs/:id`, nested course/module/lesson
  creation, publish toggles, `GET /health`
- Gateway: `/api/content/*`; Swagger at `/docs`

```bash
npm run start:dev  -w services/content
npm run db:generate -w services/content
npm run db:migrate  -w services/content
```

Built to `docs/CONVENTIONS.md`.
