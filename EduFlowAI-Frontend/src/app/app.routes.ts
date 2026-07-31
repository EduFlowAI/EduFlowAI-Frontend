import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth-guard';
import { APP_ROLES } from './core/auth/auth-session.model';
import { profileCompleteGuard } from './core/auth/profile-complete-guard';
import { roleGuard } from './core/auth/role-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'ITI Admissions through EduFlowAI',
    loadComponent: () =>
      import('./features/landing/pages/landing-page/landing-page').then(
        (component) => component.LandingPage,
      ),
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./core/layout/public-layout/public-layout').then(
        (component) => component.PublicLayout,
      ),
    loadChildren: () =>
      import('./features/identity/auth/auth.routes').then(
        (routes) => routes.AUTH_ROUTES,
      ),
  },
  {
    path: 'applicant',
    canMatch: [authGuard, roleGuard(APP_ROLES.applicant)],
    loadComponent: () =>
      import('./core/layout/applicant-layout/applicant-layout').then(
        (component) => component.ApplicantLayout,
      ),
    children: [
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/identity/profile/routes').then(
            (routes) => routes.PROFILE_ROUTES,
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'profile',
      },
    ],
  },
  {
    path: 'applications',
    canMatch: [
      authGuard,
      roleGuard(APP_ROLES.applicant),
      profileCompleteGuard,
    ],
    loadComponent: () =>
      import('./core/layout/applicant-layout/applicant-layout').then(
        (component) => component.ApplicantLayout,
      ),
    loadChildren: () =>
      import('./features/admission/applications/routes'),
  },
  {
    path: 'operations',
    canMatch: [authGuard, roleGuard(APP_ROLES.operationsManager)],
    loadComponent: () =>
      import('./core/layout/operations-layout/operations-layout').then(
        (component) => component.OperationsLayout,
      ),
  },
  {
    path: 'admin',
    canMatch: [authGuard, roleGuard(APP_ROLES.superAdmin)],
    loadComponent: () =>
      import('./core/layout/admin-layout/admin-layout').then(
        (component) => component.AdminLayout,
      ),
  },
  {
    path: 'error',
    loadComponent: () =>
      import('./core/layout/public-layout/public-layout').then(
        (component) => component.PublicLayout,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./core/errors/unexpected-error-page').then(
            (component) => component.UnexpectedErrorPage,
          ),
      },
    ],
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./core/layout/public-layout/public-layout').then(
        (component) => component.PublicLayout,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./core/errors/not-found-page').then(
            (component) => component.NotFoundPage,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
