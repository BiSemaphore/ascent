import { Injectable, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { API } from '../config/api';
import { Program } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class Content {
  private http = inject(HttpClient);

  readonly programs = httpResource<Program[]>(() => API.content.programs);

  createProgram(title: string, description?: string) {
    return this.http.post<Program>(API.content.programs, { title, description });
  }

  createCourse(programId: string, title: string) {
    return this.http.post<{ id: string }>(API.content.courses(programId), {
      title,
    });
  }

  publishProgram(id: string) {
    return this.http.patch<Program>(API.content.publishProgram(id), {
      published: true,
    });
  }

  publishCourse(id: string) {
    return this.http.patch(API.content.publishCourse(id), { published: true });
  }

  publishNewProgram(title: string, courseTitle?: string): Observable<Program> {
    return this.createProgram(title).pipe(
      switchMap((program) => {
        const courseStep: Observable<unknown> = courseTitle
          ? this.createCourse(program.id, courseTitle).pipe(
              switchMap((c) => this.publishCourse(c.id)),
            )
          : of(null);
        return courseStep.pipe(switchMap(() => this.publishProgram(program.id)));
      }),
    );
  }
}
