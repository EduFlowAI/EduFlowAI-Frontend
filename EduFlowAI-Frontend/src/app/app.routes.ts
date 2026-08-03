import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth-guard';
import { APP_ROLES } from './core/auth/auth-session.model';
import { profileCompleteGuard } from './core/auth/profile-complete-guard';
import { roleGuard } from './core/auth/role-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'tracks',
  },
  {
    path: 'landing',
    title: 'ITI Admissions through EduFlowAI',
    loadComponent: () =>
      import('./features/landing/pages/landing-page/landing-page').then(
        (component) => component.LandingPage,
      ),
  },
  {
    path: 'tracks',
    loadComponent: () =>
      import('./core/layout/public-layout/public-layout').then(
        (component) => component.PublicLayout,
      ),
    loadChildren: () =>
      import('./features/admission/catalog/routes').then(
        (catalogRoutes) => catalogRoutes.TRACK_CATALOG_ROUTES,
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
    path: 'applicant/applications/:applicationId/documents',
    loadChildren: () =>
      import('./features/documents/applicant-documents/routes').then(
        (m) => m.APPLICANT_DOCUMENTS_ROUTES,
      ),
    canMatch: [authGuard, roleGuard(APP_ROLES.applicant)],
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
        path: 'notifications',
        title: 'Notifications | EduFlow AI',
        loadComponent: () =>
          import(
            './features/communication/notifications/pages/notification-center-page/notification-center-page'
          ).then((component) => component.NotificationCenterPage),
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
    loadChildren: () => import('./features/admission/applications/routes'),
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
    children: [
      {
        path: 'admission',
        loadChildren: () =>
          import('./features/admission/admin-configuration/routes').then(
            (adminRoutes) => adminRoutes.ADMISSION_ADMIN_ROUTES,
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'admission',
      },
    ],
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
