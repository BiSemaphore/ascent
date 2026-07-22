import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TOPICS } from '@ascent/contracts';
import { ProgressService } from './progress.service';
import type { EventEnvelope, LearnerEnrolled } from '@ascent/contracts';

/** Kafka consumer that projects `learner.enrolled` events into progress. */
@Controller()
export class LearnerEnrolledConsumer {
  constructor(private readonly progress: ProgressService) {}

  /** Handle one `learner.enrolled` message. */
  @EventPattern(TOPICS.learnerEnrolled)
  async handle(@Payload() event: EventEnvelope<LearnerEnrolled>) {
    await this.progress.applyLearnerEnrolled(event);
  }
}