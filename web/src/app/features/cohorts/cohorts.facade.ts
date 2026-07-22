import { Injectable, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, catchError, finalize, tap } from 'rxjs';
import { CohortRepository } from './data/cohort.repository';
import { ProgramRepository } from '../catalog/data/program.repository';
import { Cohort, CreateCohortDto } from '../../shared/models';

@Injectable()
export class CohortsFacade {
  private cohortRepo = inject(CohortRepository);
  private programRepo = inject(ProgramRepository);

  readonly cohorts = rxResource({ stream: () => this.cohortRepo.list() });
  readonly programs = rxResource({ stream: () => this.programRepo.list() });
  readonly status = signal<string | null>(null);
  readonly pending = signal<string | null>(null);

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
