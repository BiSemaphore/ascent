import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB } from '../database/database.module';
import {
  learnerCohorts,
  learnerLessons,
  processedEvents,
} from '../database/schema';
import type { Database } from '../database/database.module';
import type {
  EventEnvelope,
  LearnerEnrolled,
  LessonCompleted,
} from '@ascent/contracts';

/**
 * Builds per-learner progress by projecting domain events. Owns no source data;
 * every row is derived from a consumed event, and every handler is idempotent.
 */
@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(@Inject(DB) private readonly db: Database) {}

  /** Project a `LearnerEnrolled` event into the learner's cohort list. */
  async applyLearnerEnrolled(event: EventEnvelope<LearnerEnrolled>) {
    await this.db.transaction(async (tx) => {
      if (!(await this.markProcessed(tx, event.eventId))) {
        return;
      }
      const p = event.payload;
      await tx
        .insert(learnerCohorts)
        .values({
          userId: p.userId,
          cohortId: p.cohortId,
          programId: p.programId,
        })
        .onConflictDoNothing();
      this.logger.log(
        `learner ${p.userId} enrolled in cohort ${p.cohortId} (event ${event.eventId})`,
      );
    });
  }

  /** Project a `LessonCompleted` event into the learner's completed-lesson list. */
  async applyLessonCompleted(event: EventEnvelope<LessonCompleted>) {
    await this.db.transaction(async (tx) => {
      if (!(await this.markProcessed(tx, event.eventId))) {
        return;
      }
      const p = event.payload;
      await tx
        .insert(learnerLessons)
        .values({
          userId: p.userId,
          lessonId: p.lessonId,
          programId: p.programId,
        })
        .onConflictDoNothing();
      this.logger.log(
        `learner ${p.userId} completed lesson ${p.lessonId} (event ${event.eventId})`,
      );
    });
  }

  /**
   * A learner's progress: their enrolled cohorts, completed lessons, and count.
   * @param userId - the learner to read progress for
   */
  async forLearner(userId: string) {
    const [cohorts, lessons] = await Promise.all([
      this.db
        .select()
        .from(learnerCohorts)
        .where(eq(learnerCohorts.userId, userId)),
      this.db
        .select()
        .from(learnerLessons)
        .where(eq(learnerLessons.userId, userId)),
    ]);
    return { cohorts, lessonsCompleted: lessons.length, lessons };
  }

  /**
   * Record an event id as processed for idempotency.
   * @returns true if this is the first time the event is seen; false if a duplicate
   */
  private async markProcessed(
    tx: Parameters<Parameters<Database['transaction']>[0]>[0],
    eventId: string,
  ): Promise<boolean> {
    const [fresh] = await tx
      .insert(processedEvents)
      .values({ eventId })
      .onConflictDoNothing()
      .returning();
    if (!fresh) {
      this.logger.log(`duplicate event ${eventId} ignored`);
      return false;
    }
    return true;
  }
}
