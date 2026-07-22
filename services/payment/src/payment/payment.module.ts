import { Module } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, StripeService],
})
export class PaymentModule {}
