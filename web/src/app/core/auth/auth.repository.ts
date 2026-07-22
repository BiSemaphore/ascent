import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../config/api';
import { LoginResponse, Role } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthRepository {
  private http = inject(HttpClient);

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(API.auth.login, { email, password });
  }

  register(email: string, password: string, role: Role) {
    const body = role === 'learner' ? { email, password } : { email, password, role };
    return this.http.post<LoginResponse>(API.auth.register, body);
  }
}
