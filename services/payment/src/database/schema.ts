import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const paymentStatus = pgEnum('payment_status', [
  'pending',
  'paid',
  'failed',
]);

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  cohortId: uuid('cohort_id').notNull(),
  userId: uuid('user_id').notNull(),
  stripeSessionId: text('stripe_session_id').notNull().unique(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull(),
  status: paymentStatus('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const processedEvents = pgTable('processed_events', {
  eventId: text('event_id').primaryKey(),
  processedAt: timestamp('processed_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const outbox = pgTable('outbox', {
  id: uuid('id').primaryKey().defaultRandom(),
  topic: text('topic').notNull(),
  key: text('key'),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
});

export type Payment = typeof payments.$inferSelect;
