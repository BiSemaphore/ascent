import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Program } from './models';

@Injectable({ providedIn: 'root' })
export class Content {
  private http = inject(HttpClient);

  listPrograms() {
    return this.http.get<Program[]>('/api/content/programs');
  }

  createProgram(title: string, description?: string) {
    return this.http.post<Program>('/api/content/programs', { title, description });
  }

  createCourse(programId: string, title: string) {
    return this.http.post<{ id: string }>(
      `/api/content/programs/${programId}/courses`,
      { title },
    );
  }

  publishProgram(id: string) {
    return this.http.patch<Program>(`/api/content/programs/${id}/publish`, {
      published: true,
    });
  }

  publishCourse(id: string) {
    return this.http.patch(`/api/content/courses/${id}/publish`, {
      published: true,
    });
  }
}
