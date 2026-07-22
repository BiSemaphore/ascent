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

export const learnerLessons = pgTable(
  'learner_lessons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    lessonId: uuid('lesson_id').notNull(),
    programId: uuid('program_id').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique('learner_lesson_unique').on(t.userId, t.lessonId)],
);

export type LearnerCohort = typeof learnerCohorts.$inferSelect;
export type LearnerLesson = typeof learnerLessons.$inferSelect;
