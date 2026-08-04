import { Routes } from '@angular/router';
import { ApplicationsStore } from './data-access/applications.store';

export default [
  {
    path: '',
    // Here we provide the Store. It will be available to all children routes,
    // but destroyed when the user leaves the applications feature!
    providers: [ApplicationsStore],
    children: [
      // Route for starting a new application
      {
        path: 'create',
        loadComponent: () =>
          import('./pages/application-create-page/application-create-page')
            .then(c => c.ApplicationCreatePage),
        title: 'Start Application'
      },
      // Route for selecting preferences
      {
        path: ':applicationId/preferences',
        loadComponent: () =>
          import('./pages/preference-selection-page/preference-selection-page')
            .then(c => c.PreferenceSelectionPage),
        title: 'Select Preferences'
      },
      // Route for uploading documents for a specific application
      {
        path: ':applicationId/documents',
        loadChildren: () =>
          import('../../../features/documents/applicant-documents/routes').then(
            (m) => m.APPLICANT_DOCUMENTS_ROUTES,
          ),
        title: 'Upload Documents'
      },
      // The dynamic ':applicationId' route MUST be at the very bottom
      {
        path: ':applicationId',
        loadComponent: () => import('./pages/applicant-dashboard-page/applicant-dashboard-page')
          .then(c => c.ApplicantDashboardPage)
      }
    ]
  }
] as Routes;

