import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, eq, sql } from 'drizzle-orm';
import { TOPICS, createEvent } from '@ascent/contracts';
import { DB } from '../database/database.module';
import { cohorts, enrollments } from '../database/schema';
import { KafkaPublisher } from '../events/kafka.publisher';
import { CreateCohortDto } from './dto/create-cohort.dto';
import type { Database } from '../database/database.module';
import type { Cohort } from '../database/schema';

@Injectable()
export class CohortService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly publisher: KafkaPublisher,
  ) {}

  async create(userId: string, dto: CreateCohortDto) {
    const [cohort] = await this.db
      .insert(cohorts)
      .values({
        programId: dto.programId,
        title: dto.title,
        startDate: new Date(dto.startDate),
        seatLimit: dto.seatLimit,
        createdBy: userId,
      })
      .returning();
    return this.withSeats(cohort);
  }

  async list() {
    const rows = await this.db
      .select()
      .from(cohorts)
      .orderBy(asc(cohorts.startDate));
    return rows.map((c) => this.withSeats(c));
  }

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

  async enroll(cohortId: string, userId: string) {
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

      return { enrollment, ...this.withSeats(updated) };
    });

    await this.publisher.emit(
      TOPICS.learnerEnrolled,
      createEvent({
        eventType: 'LearnerEnrolled',
        producer: 'cohort',
        payload: {
          enrollmentId: result.enrollment.id,
          cohortId,
          userId,
          programId: result.programId,
          seatsRemaining: result.seatsRemaining,
        },
      }),
    );

    return result;
  }

  private withSeats(c: Cohort) {
    return {
      ...c,
      seatsRemaining: c.seatLimit - c.seatsTaken,
      full: c.seatsTaken >= c.seatLimit,
    };
  }
}
