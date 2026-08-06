import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { ApplicationService } from '../../applications/data-access/application.service'; 
import { SimulatedStageDto } from '../../applications/models/application.model'; 
import { AssessmentStageStatus } from '../../../../shared/ui/stage-stepper/stage-stepper'; 

// Define the shape of our state
interface AssessmentState {
  stages: SimulatedStageDto[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AssessmentState = {
  stages: [],
  isLoading: false,
  error: null,
};

// Helper function placed OUTSIDE the store to fix TypeScript Signal errors
// It maps the C# StageResult Enum to the frontend AssessmentStageStatus
function mapBackendResultToFrontendStatus(result: string | undefined): AssessmentStageStatus {
  if (!result) return 'Pending';
  
  // Based on StageResult C# Enum: None, Pending, Passed, NotPassed, Missed
  switch (result) {
    case 'Passed':
      return 'Passed';
    case 'NotPassed':
    case 'Missed':
      return 'NotPassed';
    case 'Pending':
    case 'None':
    default:
      return 'Pending';
  }
}

export const AssessmentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    // Using computed() to properly return a Signal for each status
    // Mapping the C# SelectionStage Enum to our UI stepper items
    
    englishStatus: computed(() => {
      // Backend groups English and IQ into 'EnglishExamAndIq'
      const stage = store.stages().find(s => s.stageType === 'EnglishExamAndIq');
      return mapBackendResultToFrontendStatus(stage?.result);
    }),
    
    iqStatus: computed(() => {
      // Backend groups English and IQ into 'EnglishExamAndIq'
      const stage = store.stages().find(s => s.stageType === 'EnglishExamAndIq');
      return mapBackendResultToFrontendStatus(stage?.result);
    }),
    
    technicalStatus: computed(() => {
      // Maps to ProgrammingExam
      const stage = store.stages().find(s => s.stageType === 'ProgrammingExam');
      return mapBackendResultToFrontendStatus(stage?.result);
    }),
    
    interviewStatus: computed(() => {
      // Maps to SoftSkillsInterview
      const stage = store.stages().find(s => s.stageType === 'SoftSkillsInterview');
      return mapBackendResultToFrontendStatus(stage?.result);
    })
  })),
  withMethods((store, applicationService = inject(ApplicationService)) => ({
    
    // Method to fetch stages from backend
    loadStages: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((applicationId) =>
          applicationService.getStagesResults(applicationId).pipe(
            tapResponse({
              next: (response) => {
                if (response.isSuccess && response.data) {
                  patchState(store, { stages: response.data, isLoading: false });
                } else {
                  // Using fallback type casting to safely access 'message' if it exists, fixing the TS error
                  const errorMessage = (response as any).message || 'Failed to load stages';
                  patchState(store, { error: errorMessage, isLoading: false });
                }
              },
              error: (err: any) => {
                console.error('Error loading assessment stages', err);
                patchState(store, { error: err.message || 'Server error', isLoading: false });
              },
            })
          )
        )
      )
    ),
    
    // Method to clear state (useful when leaving the page)
    clearState: () => {
      patchState(store, initialState);
    }
  }))
);