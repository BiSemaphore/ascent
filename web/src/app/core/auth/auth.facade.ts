import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { AuthRepository } from './auth.repository';
import { AuthUser, Role } from '../../shared/models';

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
export class AuthFacade {
  private repo = inject(AuthRepository);
  private tokenSig = signal<string | null>(localStorage.getItem('token'));

  readonly token = this.tokenSig.asReadonly();
  readonly user = computed(() => decode(this.tokenSig()));
  readonly role = computed(() => this.user()?.role ?? null);
  readonly isLoggedIn = computed(() => this.tokenSig() !== null);

  hasRole(...roles: Role[]): boolean {
    const r = this.role();
    return r !== null && roles.includes(r);
  }

  login(email: string, password: string) {
    return this.repo
      .login(email, password)
      .pipe(tap((res) => this.setToken(res.accessToken)));
  }

  register(email: string, password: string, role: Role) {
    return this.repo
      .register(email, password, role)
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
