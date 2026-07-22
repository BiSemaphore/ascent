import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { AuthUser, LoginResponse, Role } from './models';

function decode(token: string | null): AuthUser | null {
  if (!token) {
    return null;
  }
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(part));
    return { userId: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private tokenSig = signal<string | null>(localStorage.getItem('token'));

  readonly token = this.tokenSig.asReadonly();
  readonly user = computed(() => decode(this.tokenSig()));
  readonly isLoggedIn = computed(() => this.tokenSig() !== null);
  readonly isStaff = computed(() => {
    const r = this.user()?.role;
    return r === 'instructor' || r === 'admin';
  });

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>('/api/auth/login', { email, password })
      .pipe(tap((res) => this.setToken(res.accessToken)));
  }

  register(email: string, password: string, role: Role) {
    const body = role === 'learner' ? { email, password } : { email, password, role };
    return this.http
      .post<LoginResponse>('/api/auth/register', body)
      .pipe(tap((res) => this.setToken(res.accessToken)));
  }

  logout() {
    localStorage.removeItem('token');
    this.tokenSig.set(null);
  }

  private setToken(token: string) {
    localStorage.setItem('token', token);
    this.tokenSig.set(token);
  }
}
