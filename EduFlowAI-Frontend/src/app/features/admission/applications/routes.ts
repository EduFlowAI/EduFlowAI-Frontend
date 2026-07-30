import { Routes } from '@angular/router';
import { ApplicationsStore } from './data-access/applications.store';

export default [
    {
      path: '',
      // Here we provide the Store. It will be available to all children routes,
      // but destroyed when the user leaves the applications feature!
      providers: [ApplicationsStore], 
      children: [
        {
          path: ':id',  // Add ':' to make it a dynamic route parameter
          // Lazy loading the standalone component
          loadComponent: () => import('./pages/applicant-dashboard-page/applicant-dashboard-page')
            .then(c => c.ApplicantDashboardPage)
        }
        // Other routes owned by Halim (like application-create-page) will go here
      ]
    }
] as Routes;

