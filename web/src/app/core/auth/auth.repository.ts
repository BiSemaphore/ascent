import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../config/api';
import { LoginResponse, Role } from '../../shared/models';

/** HTTP calls for the auth domain (networking only; state lives in the facade). */
@Injectable({ providedIn: 'root' })
export class AuthRepository {
  private http = inject(HttpClient);

  /** POST credentials, returning the access token and user. */
  login(email: string, password: string) {
    return this.http.post<LoginResponse>(API.auth.login, { email, password });
  }

  /** POST a new registration; learners omit the role. */
  register(email: string, password: string, role: Role) {
    const body = role === 'learner' ? { email, password } : { email, password, role };
    return this.http.post<LoginResponse>(API.auth.register, body);
  }
}
