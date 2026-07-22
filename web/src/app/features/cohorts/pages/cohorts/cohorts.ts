import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CohortsFacade } from '../../cohorts.facade';
import { Cohort } from '../../../../shared/models';
import { SeatMeter } from '../../../../shared/ui/seat-meter';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';

@Component({
  selector: 'app-cohorts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DatePipe, CurrencyPipe, SeatMeter, HasRoleDirective],
  templateUrl: './cohorts.html',
  styleUrl: './cohorts.scss',
})
export class Cohorts {
  private facade = inject(CohortsFacade);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);

  readonly cohorts = this.facade.cohorts;
  readonly programs = this.facade.programs;
  readonly status = this.facade.status;
  readonly pending = this.facade.pending;

  form = this.fb.nonNullable.group({
    programId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(3)]],
    startDate: ['', Validators.required],
    seatLimit: [30, [Validators.required, Validators.min(1)]],
    priceUsd: [0, [Validators.min(0)]],
  });

  constructor() {
    // Handle the redirect back from Stripe Checkout.
    const purchase = this.route.snapshot.queryParamMap.get('purchase');
    if (purchase === 'success') {
      this.status.set('Payment received. Your seat is being confirmed.');
      this.facade.refresh();
    } else if (purchase === 'cancelled') {
      this.status.set('Checkout cancelled.');
    }
  }

  open() {
    if (this.form.invalid) {
      this.status.set('Pick a program, a title, and a start date.');
      return;
    }
    const v = this.form.getRawValue();
    this.facade
      .openCohort({
        programId: v.programId,
        title: v.title.trim(),
        startDate: new Date(v.startDate).toISOString(),
        seatLimit: Number(v.seatLimit),
        price: Math.round(Number(v.priceUsd) * 100),
        currency: 'usd',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.form.reset({ seatLimit: 30, priceUsd: 0 }));
  }

  enroll(cohort: Cohort) {
    this.facade.enroll(cohort).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  buy(cohort: Cohort) {
    this.facade
      .buy(cohort)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((session) => {
        window.location.href = session.checkoutUrl;
      });
  }
}
