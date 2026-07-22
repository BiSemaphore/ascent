import { Routes } from '@angular/router';
import { CatalogFacade } from './catalog.facade';
import { Programs } from './pages/programs/programs';

export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    component: Programs,
    providers: [CatalogFacade],
  },
];
