import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, eq, sql } from 'drizzle-orm';
import { TOPICS, createEvent } from '@ascent/contracts';
import { DB } from '../database/database.module';
import { cohorts, enrollments, outbox } from '../database/schema';
import { CreateCohortDto } from './dto/create-cohort.dto';
import type { Database } from '../database/database.module';
import type { Cohort } from '../database/schema';

@Injectable()
export class CohortService {
  constructor(@Inject(DB) private readonly db: Database) {}

  /**
   * Open a new cohort of a program.
   * @param userId - the staff member opening the cohort (stored as `createdBy`)
   * @param dto - program, title, start date, and seat limit
   */
  async create(userId: string, dto: CreateCohortDto) {
    const [cohort] = await this.db
      .insert(cohorts)
      .values({
        programId: dto.programId,
        title: dto.title,
        startDate: new Date(dto.startDate),
        seatLimit: dto.seatLimit,
        price: dto.price ?? 0,
        currency: dto.currency ?? 'usd',
        createdBy: userId,
      })
      .returning();
    return this.withSeats(cohort);
  }

  /** List all cohorts (each with computed seats-remaining), earliest start first. */
  async list() {
    const rows = await this.db
      .select()
      .from(cohorts)
      .orderBy(asc(cohorts.startDate));
    return rows.map((c) => this.withSeats(c));
  }

  /**
   * Fetch one cohort with its seat counts.
   * @throws NotFoundException when the cohort does not exist
   */
  async get(id: string) {
    const [cohort] = await this.db
      .select()
      .from(cohorts)
      .where(eq(cohorts.id, id))
      .limit(1);
    if (!cohort) {
      throw new NotFoundException('Cohort not found');
    }
    return this.withSeats(cohort);
  }

  /**
   * Direct enrollment (free cohorts only). Paid cohorts must go through Stripe
   * checkout, which enrolls via the `payment.completed` event.
   * @throws NotFoundException when the cohort does not exist
   * @throws BadRequestException when the cohort is paid
   * @throws ConflictException when already enrolled or the cohort is full
   */
  async enroll(cohortId: string, userId: string) {
    const [cohort] = await this.db
      .select()
      .from(cohorts)
      .where(eq(cohorts.id, cohortId))
      .limit(1);
    if (!cohort) {
      throw new NotFoundException('Cohort not found');
    }
    if (cohort.price > 0) {
      throw new BadRequestException(
        'This cohort requires payment. Purchase a seat to enroll.',
      );
    }
    return this.enrollNow(cohortId, userId);
  }

  /**
   * Concurrency-safe enrollment. Atomic conditional update
   * (`seats_taken < seat_limit`) so seats never oversell; writes a
   * `LearnerEnrolled` event to the outbox in the same transaction. Called for
   * free cohorts directly and for paid cohorts after `payment.completed`.
   * @throws NotFoundException when the cohort does not exist
   * @throws ConflictException when already enrolled or the cohort is full
   */
  async enrollNow(cohortId: string, userId: string) {
    const [exists] = await this.db
      .select({ id: cohorts.id })
      .from(cohorts)
      .where(eq(cohorts.id, cohortId))
      .limit(1);
    if (!exists) {
      throw new NotFoundException('Cohort not found');
    }

    const result = await this.db.transaction(async (tx) => {
      const [enrollment] = await tx
        .insert(enrollments)
        .values({ cohortId, userId })
        .onConflictDoNothing()
        .returning();
      if (!enrollment) {
        throw new ConflictException('Already enrolled in this cohort');
      }

      const [updated] = await tx
        .update(cohorts)
        .set({ seatsTaken: sql`${cohorts.seatsTaken} + 1` })
        .where(
          and(
            eq(cohorts.id, cohortId),
            sql`${cohorts.seatsTaken} < ${cohorts.seatLimit}`,
          ),
        )
        .returning();
      if (!updated) {
        throw new ConflictException('Cohort is full');
      }

      const seats = this.withSeats(updated);
      const event = createEvent({
        eventType: 'LearnerEnrolled',
        producer: 'cohort',
        payload: {
          enrollmentId: enrollment.id,
          cohortId,
          userId,
          programId: updated.programId,
          seatsRemaining: seats.seatsRemaining,
        },
      });
      await tx.insert(outbox).values({
        topic: TOPICS.learnerEnrolled,
        key: cohortId,
        payload: event,
      });

      return { enrollment, ...seats };
    });

    return result;
  }

  /** Add computed `seatsRemaining` and `full` to a raw cohort row. */
  private withSeats(c: Cohort) {
    return {
      ...c,
      seatsRemaining: c.seatLimit - c.seatsTaken,
      full: c.seatsTaken >= c.seatLimit,
    };
  }
}
