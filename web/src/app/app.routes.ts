import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';
import { Login } from './pages/login/login';
import { Programs } from './pages/programs/programs';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'programs', component: Programs, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'programs' },
  { path: '**', redirectTo: 'programs' },
];
