import { Injectable, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, catchError, of, switchMap, tap } from 'rxjs';
import { ProgramRepository } from './data/program.repository';
import { Program } from '../../shared/models';

/** Catalog feature state + orchestration over {@link ProgramRepository}. */
@Injectable()
export class CatalogFacade {
  private repo = inject(ProgramRepository);

  readonly programs = rxResource({ stream: () => this.repo.list() });
  readonly status = signal<string | null>(null);

  /**
   * Create a program, optionally its first course, and publish them.
   * @param title - the program title
   * @param courseTitle - optional first course to create and publish
   */
  publishNewProgram(title: string, courseTitle?: string): Observable<unknown> {
    this.status.set('Publishing...');
    return this.repo.create({ title }).pipe(
      switchMap((program) => {
        const courseStep: Observable<unknown> = courseTitle
          ? this.repo
              .createCourse(program.id, courseTitle)
              .pipe(switchMap((c) => this.repo.publishCourse(c.id)))
          : of(null);
        return courseStep.pipe(switchMap(() => this.repo.publishProgram(program.id)));
      }),
      tap(() => {
        this.programs.reload();
        this.status.set('Program published.');
      }),
      catchError((e: { error?: { message?: string } }) => {
        this.status.set(e?.error?.message ?? 'Could not publish.');
        return EMPTY;
      }),
    );
  }
}
