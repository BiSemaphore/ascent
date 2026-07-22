import { Routes } from '@angular/router';
import { CohortsFacade } from './cohorts.facade';
import { Cohorts } from './pages/cohorts/cohorts';

export const COHORTS_ROUTES: Routes = [
  {
    path: '',
    component: Cohorts,
    providers: [CohortsFacade],
  },
];
