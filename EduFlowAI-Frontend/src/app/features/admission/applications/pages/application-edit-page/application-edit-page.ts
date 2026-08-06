import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationsStore } from '../../data-access/applications.store'; 
import { TrackService } from '../../data-access/track.service'; 
import { TrackDto } from '../../models/track.model'; 
import { UpdateApplicationPreferencesDto, PreferenceDto } from '../../models/application.model';

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
  selector: 'app-application-edit-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './application-edit-page.html',
  styleUrl: './application-edit-page.scss',
})
export class ApplicationEditPage implements OnInit {
  readonly store = inject(ApplicationsStore);
  private readonly trackService = inject(TrackService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Initialize the form with distinct validation
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

  // State signals
  applicationId = signal<string>('');
  availableTracks = signal<TrackDto[]>([]);

  selectedTrackId1 = signal<string | null>(null);
  selectedTrackId2 = signal<string | null>(null);

  // Computed signals for branch dropdowns based on track selection
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

  // Calculate remaining days for UI banner
  daysRemaining = computed(() => {
    const details = this.store.applicationDetails();
    if (!details || !details.cycleDeadlineUtc) return 0;
    
    const deadline = new Date(details.cycleDeadlineUtc).getTime();
    const now = new Date().getTime();
    const diff = deadline - now;
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  });

  constructor() {
    // React to store changes and patch the form when application details are loaded
    effect(() => {
      const details = this.store.applicationDetails();
      if (details) {
        
        // Load cycle specific tracks
        this.loadTracksForCycle(details.cycleId);
        
        // Patch form with existing data to allow editing
        if (details.preferences && details.preferences.length > 0) {
          const pref1 = details.preferences.find((p: any) => p.rank === 1);
          const pref2 = details.preferences.find((p: any) => p.rank === 2);
          
          if (pref1) {
            this.preferencesForm.get('preference1')?.patchValue({
              trackId: pref1.trackId,
              branchId: pref1.branchId
            }, { emitEvent: false});
            this.selectedTrackId1.set(pref1.trackId);
          }
          if (pref2) {
            this.preferencesForm.get('preference2')?.patchValue({
              trackId: pref2.trackId,
              branchId: pref2.branchId
            }, { emitEvent: false });
            this.selectedTrackId2.set(pref2.trackId);
          }
        }

        // Redirect if the application is already submitted and evaluated
        if (details.status === 'DocumentsRequired' || details.status === 'EligibilityFailed') {
          this.router.navigate(['/applications', details.id]);
        }

        // Lock form if it's no longer editable
        if (!this.store.canEdit()) {
          this.preferencesForm.disable();
        }
      }
    });
  }

  ngOnInit(): void {
    // Get ID from URL and load the application data
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.applicationId.set(id);
      this.store.loadApplicationDetails(id);
    }
  }

  // Load tracks from the API
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

  // Handle track changes to dynamically update branch lists
  onTrackChange(preferenceIndex: 1 | 2): void {
    const trackControl = this.preferencesForm.get(`preference${preferenceIndex}.trackId`);
    const branchControl = this.preferencesForm.get(`preference${preferenceIndex}.branchId`);
    
    if (preferenceIndex === 1) {
      this.selectedTrackId1.set(trackControl?.value || null);
    } else {
      this.selectedTrackId2.set(trackControl?.value || null);
    }
    
    // Clear branch selection on track change
    branchControl?.setValue('');
    
    // Enforce branch validation if a backup track is selected
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

  // Save changes as draft without submitting
  savePreferences(): void {
    if (this.preferencesForm.invalid) {
      this.preferencesForm.markAllAsTouched();
      return;
    }

    const formValue = this.preferencesForm.value;
    const preferences: PreferenceDto[] = [];

    if (formValue.preference1.trackId && formValue.preference1.branchId) {
      preferences.push({
        trackId: formValue.preference1.trackId,
        branchId: formValue.preference1.branchId,
        rank: 1
      });
    }

    if (formValue.preference2.trackId && formValue.preference2.branchId) {
      preferences.push({
        trackId: formValue.preference2.trackId,
        branchId: formValue.preference2.branchId,
        rank: 2
      });
    }

    const payload: UpdateApplicationPreferencesDto = { preferences };
    
    this.store.updatePreferences({ 
      applicationId: this.applicationId(), 
      request: payload 
    });

    this.preferencesForm.markAsPristine();
  }

  // Submit the application for eligibility evaluation
  submitApplication(): void {
    if (this.preferencesForm.valid && this.store.canEdit() && !this.preferencesForm.dirty) {
      this.store.submitApplication(this.applicationId());
    }
  }

  // Navigate back to the dashboard overview
  goBack(): void {
    this.router.navigate(['/applications', this.applicationId()]);
  }

}
