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

  selectedTrackId1 = signal<string | null>(null);
  selectedTrackId2 = signal<string | null>(null);

  // Computed signals for branches based on selected tracks
  availableBranches1 = computed(() => {
    const trackId = this.selectedTrackId1();
    const track = this.availableTracks().find(t => t.id === trackId);
    return track ? track.offerings : [];
  });

  availableBranches2 = computed(() => {
    const trackId = this.selectedTrackId2();
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
            }, { emitEvent: false});
            // Update signal to trigger computed branches evaluation
            this.selectedTrackId1.set(pref1.trackId);
          }
          if (pref2) {
            this.preferencesForm.get('preference2')?.patchValue({
              trackId: pref2.trackId,
              branchId: pref2.branchId
            }, { emitEvent: false });
            // Update signal to trigger computed branches evaluation
            this.selectedTrackId2.set(pref2.trackId);
          }
        }

        // Automatic routing based on the status after successful submission
        if (details.status === 'DocumentsRequired' || details.status === 'EligibilityFailed') {
          this.router.navigate(['/applications', details.id]);
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
    const trackControl = this.preferencesForm.get(`preference${preferenceIndex}.trackId`);
    const branchControl = this.preferencesForm.get(`preference${preferenceIndex}.branchId`);
    
    // Update the corresponding reactive signal with the newly selected track ID
    if (preferenceIndex === 1) {
      this.selectedTrackId1.set(trackControl?.value || null);
    } else {
      this.selectedTrackId2.set(trackControl?.value || null);
    }
    // Reset the selected branch since the track has changed
    branchControl?.setValue('');
    
    // If preference 2 track is selected, branch becomes required
    if (preferenceIndex === 2) {
      const trackId2 = trackControl?.value;
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

    // Mark form as pristine to prevent duplicate submissions on double clicks
    this.preferencesForm.markAsPristine();
  }

  // Trigger the final submission and automatic evaluation
  submitApplication(): void {
    if (this.preferencesForm.valid && this.store.canEdit() && !this.preferencesForm.dirty) {
      this.store.submitApplication(this.applicationId());
    }
  }

  // Navigation handlers
  goBack(): void {
    this.router.navigate(['/applications', this.applicationId()]);
  }

  // goNext(): void {
  //   if (this.preferencesForm.valid && this.store.canEdit()) {
  //     // Only fire the save API if the user has actually made changes 
  //     // or hasn't clicked "Save Draft" just now.
  //     if (this.preferencesForm.dirty) {
  //       this.savePreferences();
  //     }
      
  //     // Navigate to Documents step (Milestone 4 placeholder)
  //     this.router.navigate(['/applications', this.applicationId(), 'documents']);
  //   }
  // }
}