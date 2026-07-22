import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CohortsFacade } from '../../cohorts.facade';
import { Cohort } from '../../../../shared/models';
import { SeatMeter } from '../../../../shared/ui/seat-meter';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';

@Component({
  selector: 'app-cohorts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DatePipe, SeatMeter, HasRoleDirective],
  templateUrl: './cohorts.html',
  styleUrl: './cohorts.scss',
})
export class Cohorts {
  private facade = inject(CohortsFacade);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  readonly cohorts = this.facade.cohorts;
  readonly programs = this.facade.programs;
  readonly status = this.facade.status;
  readonly pending = this.facade.pending;

  form = this.fb.nonNullable.group({
    programId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(3)]],
    startDate: ['', Validators.required],
    seatLimit: [30, [Validators.required, Validators.min(1)]],
  });

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
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.form.reset({ seatLimit: 30 }));
  }

  enroll(cohort: Cohort) {
    this.facade.enroll(cohort).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
