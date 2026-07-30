import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { ApplicationService } from './application.service';
import { ApplicationDashboardSummary } from '../models/application-dashboard-summary.model';

// 1. Define the state shape tailored for the Applicant Dashboard
type ApplicationDashboardState = {
    summaryData: ApplicationDashboardSummary | null;
    isLoading: boolean;
    error: string | null;
};
  
// 2. Initial state
const initialState: ApplicationDashboardState = {
    summaryData: null,
    isLoading: false,
    error: null,
};
  
// 3. Create the SignalStore
export const ApplicationsStore = signalStore(
    withState(initialState),
    
    // 4. Computed properties if you need to derive specific UI states
    withComputed(({ summaryData }) => ({
      // Example: Check if all documents are uploaded
      isVerificationPending: () => summaryData()?.currentStatus === 'UnderDocumentVerification',
    })),
    
    // 5. Async methods to communicate with the backend API
    withMethods((store, api = inject(ApplicationService)) => ({
      
      // Method to fetch the status by Application ID
      loadDashboardSummary: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((applicationId) => api.getDashboardSummary(applicationId).pipe(
            tapResponse({
              // Assuming the API returns a Result<T> object containing 'data'
              next: (response) => {
                const dataPayload = response.data || response.value || response;
                patchState(store, { summaryData: dataPayload });
              },
              error: (err: any) => patchState(store, { error: err.message || 'Failed to load dashboard summary' }),
              finalize: () => patchState(store, { isLoading: false }),
            })
          ))
        )
      )
    }))
);