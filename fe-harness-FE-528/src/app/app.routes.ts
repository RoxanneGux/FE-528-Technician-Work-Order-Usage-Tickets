import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/work-order-details/work-order-details.component').then(
        m => m.WorkOrderDetailsComponent
      ),
  },
];
