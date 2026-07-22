import { Module } from '@nestjs/common';
import { LearnerEnrolledConsumer } from './learner-enrolled.consumer';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  controllers: [ProgressController, LearnerEnrolledConsumer],
  providers: [ProgressService],
})
export class ProgressModule {}
