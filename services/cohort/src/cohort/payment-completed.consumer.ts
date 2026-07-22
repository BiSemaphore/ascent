import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TOPICS } from '@ascent/contracts';
import { CohortService } from './cohort.service';
import type { EventEnvelope, PaymentCompleted } from '@ascent/contracts';

/** Enrolls a learner once their cohort purchase is paid. */
@Controller()
export class PaymentCompletedConsumer {
  private readonly logger = new Logger(PaymentCompletedConsumer.name);

  constructor(private readonly cohorts: CohortService) {}

  /** Handle one `payment.completed` message by enrolling the buyer. */
  @EventPattern(TOPICS.paymentCompleted)
  async handle(@Payload() event: EventEnvelope<PaymentCompleted>) {
    const { cohortId, userId } = event.payload;
    try {
      await this.cohorts.enrollNow(cohortId, userId);
      this.logger.log(`enrolled ${userId} into ${cohortId} after payment`);
    } catch (err) {
      // Already enrolled or full: a duplicate/late event, safe to ignore.
      this.logger.warn(
        `enroll after payment skipped for ${userId}/${cohortId}: ${(err as Error).message}`,
      );
    }
  }
}
