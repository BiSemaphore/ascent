import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthFacade } from '../auth/auth.facade';

/** Allows the route when logged in; otherwise redirects to /login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthFacade);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
