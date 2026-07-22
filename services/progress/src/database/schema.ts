import { pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

export const processedEvents = pgTable('processed_events', {
  eventId: uuid('event_id').primaryKey(),
  processedAt: timestamp('processed_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const learnerCohorts = pgTable(
  'learner_cohorts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    cohortId: uuid('cohort_id').notNull(),
    programId: uuid('program_id').notNull(),
    enrolledAt: timestamp('enrolled_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique('learner_cohort_unique').on(t.userId, t.cohortId)],
);

export type LearnerCohort = typeof learnerCohorts.$inferSelect;
