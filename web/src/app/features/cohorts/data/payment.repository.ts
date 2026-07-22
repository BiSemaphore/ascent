import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../../../core/config/api';
import { CheckoutSession } from '../../../shared/models';

/** HTTP calls for cohort payment (Stripe Checkout). */
@Injectable({ providedIn: 'root' })
export class PaymentRepository {
  private http = inject(HttpClient);

  /** Start a Stripe Checkout for a cohort; returns the hosted checkout URL. */
  checkout(cohortId: string) {
    return this.http.post<CheckoutSession>(API.payments.checkout, { cohortId });
  }
}
