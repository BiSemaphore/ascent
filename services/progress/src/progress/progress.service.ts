import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB } from '../database/database.module';
import { learnerCohorts, processedEvents } from '../database/schema';
import type { Database } from '../database/database.module';
import type { EventEnvelope, LearnerEnrolled } from '@ascent/contracts';

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(@Inject(DB) private readonly db: Database) {}

  async applyLearnerEnrolled(event: EventEnvelope<LearnerEnrolled>) {
    await this.db.transaction(async (tx) => {
      const [fresh] = await tx
        .insert(processedEvents)
        .values({ eventId: event.eventId })
        .onConflictDoNothing()
        .returning();
      if (!fresh) {
        this.logger.log(`duplicate event ${event.eventId} ignored`);
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

  forLearner(userId: string) {
    return this.db
      .select()
      .from(learnerCohorts)
      .where(eq(learnerCohorts.userId, userId));
  }
}
