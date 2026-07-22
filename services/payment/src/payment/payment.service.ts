import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { TOPICS, createEvent } from '@ascent/contracts';
import { DB } from '../database/database.module';
import { outbox, payments, processedEvents } from '../database/schema';
import { StripeService } from '../stripe/stripe.service';
import type { Database } from '../database/database.module';
import type Stripe from 'stripe';

interface CohortInfo {
  id: string;
  title: string;
  price: number;
  currency: string;
  full: boolean;
}

/** Cohort purchase via Stripe Checkout and the webhook that completes it. */
@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly config: ConfigService,
    private readonly stripe: StripeService,
  ) {}

  /**
   * Start a purchase: read the cohort's price, create a Stripe Checkout Session,
   * record a pending payment, and return the hosted checkout URL.
   * @param userId - the buyer
   * @param cohortId - the cohort being purchased
   * @param authToken - the caller's `Authorization` header, forwarded to Cohort
   * @throws BadRequestException when the cohort is free (enroll directly)
   * @throws ConflictException when the cohort is full
   */
  async createCheckout(userId: string, cohortId: string, authToken: string) {
    const cohort = await this.fetchCohort(cohortId, authToken);
    if (cohort.price <= 0) {
      throw new BadRequestException('This cohort is free; enroll directly.');
    }
    if (cohort.full) {
      throw new ConflictException('Cohort is full.');
    }

    const publicUrl = this.config.getOrThrow<string>('PUBLIC_URL');
    const session = await this.stripe.createCheckoutSession({
      cohortId,
      userId,
      title: cohort.title,
      amount: cohort.price,
      currency: cohort.currency,
      successUrl: `${publicUrl}/cohorts?purchase=success`,
      cancelUrl: `${publicUrl}/cohorts?purchase=cancelled`,
    });

    await this.db.insert(payments).values({
      cohortId,
      userId,
      stripeSessionId: session.id,
      amount: cohort.price,
      currency: cohort.currency,
    });
    return { checkoutUrl: session.url };
  }

  /**
   * Handle a verified Stripe webhook. On `checkout.session.completed`, mark the
   * payment paid and write `payment.completed` to the outbox. Idempotent by the
   * Stripe event id (Stripe may deliver a webhook more than once).
   */
  async handleWebhook(rawBody: Buffer, signature: string) {
    const event = this.stripe.constructEvent(rawBody, signature);

    await this.db.transaction(async (tx) => {
      const [fresh] = await tx
        .insert(processedEvents)
        .values({ eventId: event.id })
        .onConflictDoNothing()
        .returning();
      if (!fresh) {
        this.logger.log(`duplicate stripe event ${event.id} ignored`);
        return;
      }

      if (event.type !== 'checkout.session.completed') {
        return;
      }

      const session = event.data.object as Stripe.Checkout.Session;
      const [payment] = await tx
        .update(payments)
        .set({ status: 'paid' })
        .where(eq(payments.stripeSessionId, session.id))
        .returning();
      if (!payment) {
        this.logger.warn(`no payment found for session ${session.id}`);
        return;
      }

      const evt = createEvent({
        eventType: 'PaymentCompleted',
        producer: 'payment',
        payload: {
          paymentId: payment.id,
          cohortId: payment.cohortId,
          userId: payment.userId,
          amount: payment.amount,
          currency: payment.currency,
        },
      });
      await tx.insert(outbox).values({
        topic: TOPICS.paymentCompleted,
        key: payment.cohortId,
        payload: evt,
      });
      this.logger.log(`payment ${payment.id} paid; queued payment.completed`);
    });

    return { received: true };
  }

  private async fetchCohort(
    cohortId: string,
    authToken: string,
  ): Promise<CohortInfo> {
    const base = this.config.getOrThrow<string>('COHORT_URL');
    const res = await fetch(`${base}/${cohortId}`, {
      headers: { Authorization: authToken },
    });
    if (res.status === 404) {
      throw new NotFoundException('Cohort not found');
    }
    if (!res.ok) {
      throw new BadRequestException('Could not read cohort');
    }
    return (await res.json()) as CohortInfo;
  }
}
