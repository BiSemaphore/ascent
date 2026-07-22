import {
  integer,
  pgTable,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { text } from 'drizzle-orm/pg-core';

export const cohorts = pgTable('cohorts', {
  id: uuid('id').primaryKey().defaultRandom(),
  programId: uuid('program_id').notNull(),
  title: text('title').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  seatLimit: integer('seat_limit').notNull(),
  seatsTaken: integer('seats_taken').notNull().default(0),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const enrollments = pgTable(
  'enrollments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cohortId: uuid('cohort_id')
      .notNull()
      .references(() => cohorts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull(),
    enrolledAt: timestamp('enrolled_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique('enrollments_cohort_user_unique').on(t.cohortId, t.userId)],
);

export type Cohort = typeof cohorts.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
