import { Module } from '@nestjs/common';
import { CohortController } from './cohort.controller';
import { CohortService } from './cohort.service';
import { PaymentCompletedConsumer } from './payment-completed.consumer';

@Module({
  controllers: [CohortController, PaymentCompletedConsumer],
  providers: [CohortService],
})
export class CohortModule {}
