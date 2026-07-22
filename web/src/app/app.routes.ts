import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'cohorts',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/cohorts/cohorts.routes').then((m) => m.COHORTS_ROUTES),
  },
  {
    path: 'programs',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/catalog/catalog.routes').then((m) => m.CATALOG_ROUTES),
  },
  { path: '', pathMatch: 'full', redirectTo: 'cohorts' },
  { path: '**', redirectTo: 'cohorts' },
];
