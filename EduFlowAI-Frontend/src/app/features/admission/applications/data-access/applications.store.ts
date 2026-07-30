import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { ApplicationService } from './application.service';
import { ApplicationDashboardSummary } from '../models/application-dashboard-summary.model';
import { 
  ApplicationDetailsDto, 
  ApplicationRequestDto, 
  UpdateApplicationPreferencesDto 
} from '../models/application.model';

// 1. Define the state shape tailored for the Applicant Dashboard
type ApplicationState = {
  summaryData: ApplicationDashboardSummary | null;
  applicationDetails: ApplicationDetailsDto | null;
  isLoading: boolean;
  error: string | null;
};
  
// 2. Initial state
const initialState: ApplicationState = {
  summaryData: null,
  applicationDetails: null,
  isLoading: false,
  error: null,
};
  
// 3. Create the SignalStore
export const ApplicationsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  
  // 4. Computed properties for derived UI states
  withComputed(({ summaryData, applicationDetails }) => ({
    // Check if documents are under verification (Milestone 1 & 2)
    isVerificationPending: computed(() => summaryData()?.currentStatus === 'UnderDocumentVerification'),
    
    // Business Rule: Can edit preferences only if status is Draft or DocumentsRequired (Milestone 3)
    canEdit: computed(() => {
      const details = applicationDetails();
      if (!details) return false;
      return details.status === 'Draft' || details.status === 'DocumentsRequired';
    }),
    
    // Check if the application deadline has passed (Milestone 3)
    isExpired: computed(() => {
      const details = applicationDetails();
      return details?.status === 'Expired';
    }),

    // Check if preferences are already filled (Milestone 3)
    hasPreferences: computed(() => {
      const details = applicationDetails();
      return details ? details.preferences.length > 0 : false;
    })
  })),
  
  // 5. Async methods to communicate with the backend API
  withMethods((store, api = inject(ApplicationService)) => ({
    // Method to fetch the dashboard summary
    loadDashboardSummary: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((applicationId) => api.getDashboardSummary(applicationId).pipe(
          tapResponse({
            next: (response: any) => {
              const dataPayload = response.data || response.value || response;
              patchState(store, { summaryData: dataPayload, isLoading: false });
            },
            error: (err: any) => patchState(store, { error: err.error?.message || 'Failed to load dashboard summary' }),
            finalize: () => patchState(store, { isLoading: false }),
          })
        ))
      )
    ),

    // --- Milestone 3 Methods ---
    // Method to load full application details for editing
    loadApplicationDetails: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((applicationId) => api.getApplicationDetails(applicationId).pipe(
          tapResponse({
            next: (response: any) => patchState(store, { 
              applicationDetails: response.data, 
              isLoading: false 
            }),
            error: (err: any) => patchState(store, { 
              error: err.error?.message || 'Failed to load application details', 
              isLoading: false 
            })
          })
        ))
      )
    ),

    // Method to create a new draft application
    createDraft: rxMethod<ApplicationRequestDto>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((request) => api.createDraft(request).pipe(
          tapResponse({
            next: (response: any) => patchState(store, { 
              applicationDetails: response.data, 
              isLoading: false 
            }),
            error: (err: any) => patchState(store, { 
              error: err.error?.message || 'Failed to create application draft', 
              isLoading: false 
            })
          })
        ))
      )
    ),

    // Method to update primary and backup preferences
    updatePreferences: rxMethod<{ applicationId: string; request: UpdateApplicationPreferencesDto }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ applicationId, request }) => api.updatePreferences(applicationId, request).pipe(
          tapResponse({
            next: (response: any) => patchState(store, { 
              applicationDetails: response.data, 
              isLoading: false 
            }),
            error: (err: any) => patchState(store, { 
              error: err.error?.message || 'Failed to update preferences', 
              isLoading: false 
            })
          })
        ))
      )
    )
  }))
);