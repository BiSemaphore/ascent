import { Injectable, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { API } from '../config/api';
import { Cohort, CreateCohort } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CohortApi {
  private http = inject(HttpClient);

  readonly cohorts = httpResource<Cohort[]>(() => API.cohorts.list);

  create(dto: CreateCohort) {
    return this.http.post<Cohort>(API.cohorts.list, dto);
  }

  enroll(id: string) {
    return this.http.post<{ seatsRemaining: number; full: boolean }>(
      API.cohorts.enroll(id),
      {},
    );
  }
}
