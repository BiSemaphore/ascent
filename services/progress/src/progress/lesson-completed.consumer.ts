import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TOPICS } from '@ascent/contracts';
import { ProgressService } from './progress.service';
import type { EventEnvelope, LessonCompleted } from '@ascent/contracts';

/** Kafka consumer that projects `lesson.completed` events into progress. */
@Controller()
export class LessonCompletedConsumer {
  constructor(private readonly progress: ProgressService) {}

  /** Handle one `lesson.completed` message. */
  @EventPattern(TOPICS.lessonCompleted)
  async handle(@Payload() event: EventEnvelope<LessonCompleted>) {
    await this.progress.applyLessonCompleted(event);
  }
}
