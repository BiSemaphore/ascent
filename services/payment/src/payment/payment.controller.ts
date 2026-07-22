import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@ascent/auth';
import type { RawBodyRequest } from '@nestjs/common';
import type { AuthUser } from '@ascent/auth';
import type { Request } from 'express';
import { PaymentService } from './payment.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

/** HTTP API for cohort purchase: start checkout (learner) and the Stripe webhook. */
@ApiTags('payments')
@Controller()
export class PaymentController {
  constructor(private readonly payment: PaymentService) {}

  /** Start a Stripe Checkout for a cohort; returns the hosted checkout URL. */
  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('learner')
  checkout(
    @Body() dto: CreateCheckoutDto,
    @CurrentUser() user: AuthUser,
    @Headers('authorization') auth: string,
  ) {
    return this.payment.createCheckout(user.userId, dto.cohortId, auth);
  }

  /** Stripe webhook receiver. Public, but every payload's signature is verified. */
  @Post('webhook')
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.payment.handleWebhook(req.rawBody as Buffer, signature);
  }
}
