import { Injectable, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, catchError, finalize, tap } from 'rxjs';
import { CohortRepository } from './data/cohort.repository';
import { PaymentRepository } from './data/payment.repository';
import { ProgramRepository } from '../catalog/data/program.repository';
import { CheckoutSession, Cohort, CreateCohortDto } from '../../shared/models';

/** Cohorts feature state + orchestration over the cohort, program, and payment repos. */
@Injectable()
export class CohortsFacade {
  private cohortRepo = inject(CohortRepository);
  private programRepo = inject(ProgramRepository);
  private paymentRepo = inject(PaymentRepository);

  readonly cohorts = rxResource({ stream: () => this.cohortRepo.list() });
  readonly programs = rxResource({ stream: () => this.programRepo.list() });
  readonly status = signal<string | null>(null);
  readonly pending = signal<string | null>(null);

  /** Open a cohort, then refresh the list. */
  openCohort(dto: CreateCohortDto): Observable<unknown> {
    this.status.set('Opening cohort...');
    return this.cohortRepo.create(dto).pipe(
      tap(() => {
        this.cohorts.reload();
        this.status.set('Cohort opened.');
      }),
      catchError((e: { error?: { message?: string } }) => {
        this.status.set(e?.error?.message ?? 'Could not open cohort.');
        return EMPTY;
      }),
    );
  }

  /**
   * Start a paid purchase: returns the Stripe checkout URL for the caller to
   * redirect to. Sets an error status on failure.
   */
  buy(cohort: Cohort): Observable<CheckoutSession> {
    this.pending.set(cohort.id);
    this.status.set(null);
    return this.paymentRepo.checkout(cohort.id).pipe(
      finalize(() => this.pending.set(null)),
      catchError((e: { error?: { message?: string } }) => {
        this.status.set(e?.error?.message ?? 'Could not start checkout.');
        return EMPTY;
      }),
    );
  }

  /** Refresh the cohort list (e.g. after returning from a successful payment). */
  refresh() {
    this.cohorts.reload();
  }

  /** Enroll the current learner into a cohort, then refresh the list. */
  enroll(cohort: Cohort): Observable<unknown> {
    this.pending.set(cohort.id);
    this.status.set(null);
    return this.cohortRepo.enroll(cohort.id).pipe(
      finalize(() => this.pending.set(null)),
      tap(() => {
        this.cohorts.reload();
        this.status.set(`Enrolled in ${cohort.title}.`);
      }),
      catchError((e: { error?: { message?: string } }) => {
        this.status.set(e?.error?.message ?? 'Could not enroll.');
        return EMPTY;
      }),
    );
  }
}
