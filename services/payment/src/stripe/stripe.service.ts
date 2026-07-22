import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

/** Wraps the Stripe SDK: holds the secret key and verifies webhook signatures. */
@Injectable()
export class StripeService {
  readonly client: Stripe;
  private readonly webhookSecret: string;

  constructor(config: ConfigService) {
    this.client = new Stripe(config.getOrThrow<string>('STRIPE_SECRET_KEY'));
    this.webhookSecret = config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
  }

  /**
   * Create a hosted Checkout Session for a one-off cohort purchase.
   * @param params.cohortId - stored in metadata to enroll on success
   * @param params.userId - the buyer, stored in metadata
   * @param params.title - the cohort name shown on the checkout page
   * @param params.amount - price in the currency's minor unit (e.g. cents)
   * @param params.currency - ISO currency code
   * @param params.successUrl - redirect after a successful payment
   * @param params.cancelUrl - redirect if the buyer cancels
   */
  createCheckoutSession(params: {
    cohortId: string;
    userId: string;
    title: string;
    amount: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    return this.client.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: params.currency,
            unit_amount: params.amount,
            product_data: { name: params.title },
          },
        },
      ],
      metadata: { cohortId: params.cohortId, userId: params.userId },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });
  }

  /**
   * Verify and parse a Stripe webhook payload.
   * @param rawBody - the exact bytes Stripe sent (not parsed JSON)
   * @param signature - the `stripe-signature` header
   * @throws when the signature does not match the webhook secret
   */
  constructEvent(rawBody: Buffer, signature: string): Stripe.Event {
    return this.client.webhooks.constructEvent(
      rawBody,
      signature,
      this.webhookSecret,
    );
  }
}
