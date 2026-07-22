import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
  },
  {
    path: 'cohorts',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/cohorts/cohorts').then((m) => m.Cohorts),
  },
  {
    path: 'programs',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/catalog/programs').then((m) => m.Programs),
  },
  { path: '', pathMatch: 'full', redirectTo: 'cohorts' },
  { path: '**', redirectTo: 'cohorts' },
];
