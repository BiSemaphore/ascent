import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../../../core/config/api';
import { Cohort, CreateCohortDto, EnrollResult } from '../../../shared/models';

/** HTTP calls for the cohort domain (list, create, enroll). */
@Injectable({ providedIn: 'root' })
export class CohortRepository {
  private http = inject(HttpClient);

  list() {
    return this.http.get<Cohort[]>(API.cohorts.list);
  }

  create(dto: CreateCohortDto) {
    return this.http.post<Cohort>(API.cohorts.list, dto);
  }

  enroll(id: string) {
    return this.http.post<EnrollResult>(API.cohorts.enroll(id), {});
  }
}
