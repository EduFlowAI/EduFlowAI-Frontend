import { Routes } from '@angular/router';

export const routes: Routes = [
    {
      // 1. Define the base path for your feature
      path: 'applications',
      
      // 2. Lazy load the feature routes
      // IMPORTANT: Replace the string inside import() with the actual relative path 
      // to your specific routes.ts file (e.g., './features/admission/applications/routes')
      loadChildren: () => import('./features/admission/applications/routes')
    },
    
    // Handle wrong URLs globally
    {
      path: '**',
      redirectTo: '' // Or redirect to a generic 404/Home page
    }
  ];
