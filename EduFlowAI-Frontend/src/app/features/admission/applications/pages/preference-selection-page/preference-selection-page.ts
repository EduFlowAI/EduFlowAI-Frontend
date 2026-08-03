import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationsStore } from '../../data-access/applications.store'; // Adjust path
import { TrackService } from '../../data-access/track.service'; // Adjust path
import { TrackDto, BranchOfferingDto } from '../../models/track.model'; // Adjust path
import { UpdateApplicationPreferencesDto, PreferenceDto } from '../../models/application.model'; // Adjust path

// Custom validator to ensure Preference 1 and 2 tracks are different
function distinctTracksValidator(control: AbstractControl): ValidationErrors | null {
  const track1 = control.get('preference1.trackId')?.value;
  const track2 = control.get('preference2.trackId')?.value;

  if (track1 && track2 && track1 === track2) {
    return { duplicateTracks: true };
  }
  return null;
}

@Component({
  selector: 'app-preference-selection-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './preference-selection-page.html',
  styleUrl: './preference-selection-page.scss',
})
export class PreferenceSelectionPage implements OnInit{
  readonly store = inject(ApplicationsStore);
  private readonly trackService = inject(TrackService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Form initialization
  preferencesForm: FormGroup = this.fb.group({
    preference1: this.fb.group({
      trackId: ['', Validators.required],
      branchId: ['', Validators.required]
    }),
    preference2: this.fb.group({
      trackId: [''],
      branchId: ['']
    })
  }, { validators: distinctTracksValidator });

  // State signals for tracks and branches
  applicationId = signal<string>('');
  availableTracks = signal<TrackDto[]>([]);

  // Computed signals for branches based on selected tracks
  availableBranches1 = computed(() => {
    const trackId = this.preferencesForm.get('preference1.trackId')?.value;
    const track = this.availableTracks().find(t => t.id === trackId);
    return track ? track.offerings : [];
  });

  availableBranches2 = computed(() => {
    const trackId = this.preferencesForm.get('preference2.trackId')?.value;
    const track = this.availableTracks().find(t => t.id === trackId);
    return track ? track.offerings : [];
  });

  // Calculate remaining days for the deadline banner
  daysRemaining = computed(() => {
    const details = this.store.applicationDetails();
    if (!details || !details.cycleDeadlineUtc) return 0;
    
    const deadline = new Date(details.cycleDeadlineUtc).getTime();
    const now = new Date().getTime();
    const diff = deadline - now;
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  });

  constructor() {
    // Effect to react to application details loaded in the store
    effect(() => {
      const details = this.store.applicationDetails();
      if (details) {
        // Fetch tracks specific to this cycle
        this.loadTracksForCycle(details.cycleId);
        
        // Patch form with existing preferences if any
        if (details.preferences && details.preferences.length > 0) {
          const pref1 = details.preferences.find((p: any) => p.rank === 1);
          const pref2 = details.preferences.find((p: any) => p.rank === 2);
          
          if (pref1) {
            this.preferencesForm.get('preference1')?.patchValue({
              trackId: pref1.trackId,
              branchId: pref1.branchId
            });
          }
          if (pref2) {
            this.preferencesForm.get('preference2')?.patchValue({
              trackId: pref2.trackId,
              branchId: pref2.branchId
            });
          }
        }

        // Disable form if the application is not in an editable state (e.g., Expired/Closed)
        if (!this.store.canEdit()) {
          this.preferencesForm.disable();
        }
      }
    });
  }

  ngOnInit(): void {
    // Extract application ID from the route parameters and load details
    const id = this.route.snapshot.paramMap.get('applicationId');
    if (id) {
      this.applicationId.set(id);
      this.store.loadApplicationDetails(id);
    }
  }

  // Fetch tracks and handle the result
  private loadTracksForCycle(cycleId: string): void {
    this.trackService.getTracks(cycleId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.availableTracks.set(response.data);
        }
      },
      error: (err) => console.error('Failed to load tracks', err)
    });
  }

  // Handle track selection change to clear the corresponding branch
  onTrackChange(preferenceIndex: 1 | 2): void {
    const branchControl = this.preferencesForm.get(`preference${preferenceIndex}.branchId`);
    branchControl?.setValue('');
    
    // If preference 2 track is selected, branch becomes required
    if (preferenceIndex === 2) {
      const trackId2 = this.preferencesForm.get('preference2.trackId')?.value;
      if (trackId2) {
        branchControl?.setValidators(Validators.required);
      } else {
        branchControl?.clearValidators();
      }
      branchControl?.updateValueAndValidity();
    }
  }

  // Prepare DTO and dispatch to store
  savePreferences(): void {
    if (this.preferencesForm.invalid) {
      this.preferencesForm.markAllAsTouched();
      return;
    }

    const formValue = this.preferencesForm.value;
    const preferences: PreferenceDto[] = [];

    // Map Preference 1
    if (formValue.preference1.trackId && formValue.preference1.branchId) {
      preferences.push({
        trackId: formValue.preference1.trackId,
        branchId: formValue.preference1.branchId,
        rank: 1
      });
    }

    // Map Preference 2 (if provided)
    if (formValue.preference2.trackId && formValue.preference2.branchId) {
      preferences.push({
        trackId: formValue.preference2.trackId,
        branchId: formValue.preference2.branchId,
        rank: 2
      });
    }

    const payload: UpdateApplicationPreferencesDto = { preferences };
    
    // Dispatch to store to update backend
    this.store.updatePreferences({ 
      applicationId: this.applicationId(), 
      request: payload 
    });
  }

  // Navigation handlers
  goBack(): void {
    this.router.navigate(['/applications', this.applicationId()]);
  }

  goNext(): void {
    if (this.preferencesForm.valid && this.store.canEdit()) {
      this.savePreferences();
      // Navigate to Documents step (Milestone 4 placeholder)
      this.router.navigate(['/applications', this.applicationId(), 'documents']);
    }
  }
}

//   /**
//    * Initializes the FormGroup with necessary controls and cross-field validation
//    */
//   private initForm(): void {
//     this.preferencesForm = this.fb.group({
//       primaryTrack: ['', Validators.required],
//       primaryBranch: ['', Validators.required],
//       backupTrack: ['', Validators.required],
//       backupBranch: ['', Validators.required]
//     }, { validators: this.duplicateTrackValidator });
//   }

//   /**
//    * Custom validator to ensure primary and backup tracks are not identical
//    */
//   private duplicateTrackValidator(group: AbstractControl): ValidationErrors | null {
//     const primary = group.get('primaryTrack')?.value;
//     const backup = group.get('backupTrack')?.value;
    
//     // Return error object if both tracks are selected and they match
//     if (primary && backup && primary === backup) {
//       return { duplicateTrack: true };
//     }
//     return null;
//   }

//   /**
//    * Checks if the duplicate track error is present for UI rendering
//    */
//   get hasDuplicateError(): boolean {
//     return this.preferencesForm.hasError('duplicateTrack') && 
//            this.preferencesForm.get('backupTrack')?.touched === true;
//   }

//   /**
//    * Handles the save draft action
//    */
//   onSaveDraft(): void {
//     if (this.preferencesForm.valid) {
//       this.submitPreferences();
//     } else {
//       this.preferencesForm.markAllAsTouched();
//     }
//   }

//   /**
//    * Handles the next step action
//    */
//   onNextStep(): void {
//     if (this.preferencesForm.valid) {
//       this.submitPreferences();
//       // Navigate to the next step using Angular Router (e.g., Document Upload)
//     } else {
//       this.preferencesForm.markAllAsTouched();
//     }
//   }

//   /**
//    * Prepares the DTO and dispatches the update method to the SignalStore
//    */
//   private submitPreferences(): void {
//     const details = this.store.applicationDetails();
//     if (!details) return;

//     const formValues = this.preferencesForm.value;
    
//     // Map form values to the expected DTO structure
//     const requestDto: UpdateApplicationPreferencesDto = {
//       preferences: [
//         { trackBranchOfferingId: formValues.primaryTrack, rank: 1 },
//         { trackBranchOfferingId: formValues.backupTrack, rank: 2 }
//       ]
//     };

//     // Call the updatePreferences rxMethod from the store
//     this.store.updatePreferences({ 
//       applicationId: details.id, 
//       request: requestDto 
//     });
//   }
// }
