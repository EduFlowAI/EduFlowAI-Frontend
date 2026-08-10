import { Routes } from '@angular/router';

export const ADMISSION_ADMIN_ROUTES: Routes = [
  {
    path: '',
    title: 'Admission overview | EduFlow AI',
    loadComponent: () =>
      import('./admission-overview/admission-overview').then(
        (component) => component.AdmissionOverview,
      ),
  },
  {
    path: 'programs',
    title: 'Programs & requirements | EduFlow AI',
    loadComponent: () =>
      import('./program-management/program-management-page').then(
        (component) => component.ProgramManagementPage,
      ),
  },
  {
    path: 'catalog',
    title: 'Tracks & branches | EduFlow AI',
    loadComponent: () =>
      import('./catalog-management/catalog-management-page').then(
        (component) => component.CatalogManagementPage,
      ),
  },
  {
    path: 'cycles',
    title: 'Admission cycles | EduFlow AI',
    loadComponent: () =>
      import('./cycle-management/cycle-management-page').then(
        (component) => component.CycleManagementPage,
      ),
  },
  // Load the assessment routes lazily when the URL contains 'assessment'
  {
    path: 'assessment',
    title: 'Assessment & Operations',
    loadChildren: () =>
      import('../assessment/routes').then((m) => m.default),
  }
];

export default ADMISSION_ADMIN_ROUTES;
