# web

The Ascent frontend: standalone Angular (signals, lazy features). Talks to the API
through the Nginx gateway; the dev server proxies `/api/*` to it.

```bash
npm start -w web     # http://localhost:4200 (proxies /api -> gateway :8080)
npm run build -w web
```

Structure and rules: `docs/CONVENTIONS.md` section 14. In short: API calls live in
`core/services`, endpoints in `core/config/api.ts`, models in `shared/models`,
guards/interceptors in `core/`, features lazy-loaded under `features/`.
