import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthFacade } from '../auth/auth.facade';

/** Attaches the JWT as a Bearer header on every outgoing request when present. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthFacade).token();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
