import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../../../core/config/api';
import { CreateProgramDto, Program } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class ProgramRepository {
  private http = inject(HttpClient);

  list() {
    return this.http.get<Program[]>(API.content.programs);
  }

  create(dto: CreateProgramDto) {
    return this.http.post<Program>(API.content.programs, dto);
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
}
