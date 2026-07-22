import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TOPICS } from '@ascent/contracts';
import { ProgressService } from './progress.service';
import type { EventEnvelope, LearnerEnrolled } from '@ascent/contracts';

@Controller()
export class LearnerEnrolledConsumer {
  constructor(private readonly progress: ProgressService) {}

  @EventPattern(TOPICS.learnerEnrolled)
  async handle(@Payload() event: EventEnvelope<LearnerEnrolled>) {
    await this.progress.applyLearnerEnrolled(event);
  }
}