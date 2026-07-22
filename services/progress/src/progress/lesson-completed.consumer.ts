import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TOPICS } from '@ascent/contracts';
import { ProgressService } from './progress.service';
import type { EventEnvelope, LessonCompleted } from '@ascent/contracts';

@Controller()
export class LessonCompletedConsumer {
  constructor(private readonly progress: ProgressService) {}

  @EventPattern(TOPICS.lessonCompleted)
  async handle(@Payload() event: EventEnvelope<LessonCompleted>) {
    await this.progress.applyLessonCompleted(event);
  }
}
