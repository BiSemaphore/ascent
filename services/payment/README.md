# payment service

Cohort purchase via **Stripe Checkout** (test mode). Creates a Checkout Session,
records the payment, and on the signature-verified webhook emits `payment.completed`
(via the Transactional Outbox), which Cohort consumes to enroll the buyer.

- Port `3005`, Postgres `payment-db` (5437)
- Routes: `POST /checkout` (learner), `POST /webhook` (Stripe), `GET /health`
- Gateway: `/api/payments/*`; Swagger at `/docs`
- Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (test mode), `COHORT_URL`

```bash
npm run start:dev  -w services/payment
npm run db:generate -w services/payment
npm run db:migrate  -w services/payment
```

To test the real flow: put Stripe **test** keys in the root `.env`, then run
`stripe listen --forward-to localhost:8080/api/payments/webhook` for the webhook
secret. Built to `docs/CONVENTIONS.md`.
