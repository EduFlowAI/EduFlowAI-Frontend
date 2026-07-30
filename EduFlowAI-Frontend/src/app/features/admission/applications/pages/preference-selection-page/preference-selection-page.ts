import { Component, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators, 
  AbstractControl, 
  ValidationErrors 
} from '@angular/forms';
import { ApplicationsStore } from '../../data-access/applications.store';
import { UpdateApplicationPreferencesDto } from '../../models/application.model';

@Component({
  selector: 'app-preference-selection-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './preference-selection-page.html',
  styleUrl: './preference-selection-page.scss',
})
export class PreferenceSelectionPage implements OnInit{
  readonly store = inject(ApplicationsStore);
  private readonly fb = inject(FormBuilder);

  // Initialize the reactive form
  preferencesForm!: FormGroup;

  constructor() {
    this.initForm();

    // Effect to reactively disable/enable the form based on store computed signals
    effect(() => {
      const isExpired = this.store.isExpired();
      const canEdit = this.store.canEdit();
      const isLoading = this.store.isLoading();

      if (isExpired || !canEdit || isLoading) {
        this.preferencesForm.disable({ emitEvent: false });
      } else {
        this.preferencesForm.enable({ emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    // Populate form if preferences already exist in the store
    const details = this.store.applicationDetails();
    if (details && details.preferences && details.preferences.length > 0) {
      // Assuming preference rank 1 is primary and rank 2 is backup
      const primaryPref = details.preferences.find(p => p.rank === 1);
      const backupPref = details.preferences.find(p => p.rank === 2);

      this.preferencesForm.patchValue({
        primaryTrack: primaryPref?.trackBranchOfferingId || '',
        // You will need to map trackBranchOfferingId to actual track and branch dropdowns 
        // based on your tracks catalog data
        backupTrack: backupPref?.trackBranchOfferingId || ''
      });
    }
  }

  /**
   * Initializes the FormGroup with necessary controls and cross-field validation
   */
  private initForm(): void {
    this.preferencesForm = this.fb.group({
      primaryTrack: ['', Validators.required],
      primaryBranch: ['', Validators.required],
      backupTrack: ['', Validators.required],
      backupBranch: ['', Validators.required]
    }, { validators: this.duplicateTrackValidator });
  }

  /**
   * Custom validator to ensure primary and backup tracks are not identical
   */
  private duplicateTrackValidator(group: AbstractControl): ValidationErrors | null {
    const primary = group.get('primaryTrack')?.value;
    const backup = group.get('backupTrack')?.value;
    
    // Return error object if both tracks are selected and they match
    if (primary && backup && primary === backup) {
      return { duplicateTrack: true };
    }
    return null;
  }

  /**
   * Checks if the duplicate track error is present for UI rendering
   */
  get hasDuplicateError(): boolean {
    return this.preferencesForm.hasError('duplicateTrack') && 
           this.preferencesForm.get('backupTrack')?.touched === true;
  }

  /**
   * Handles the save draft action
   */
  onSaveDraft(): void {
    if (this.preferencesForm.valid) {
      this.submitPreferences();
    } else {
      this.preferencesForm.markAllAsTouched();
    }
  }

  /**
   * Handles the next step action
   */
  onNextStep(): void {
    if (this.preferencesForm.valid) {
      this.submitPreferences();
      // Navigate to the next step using Angular Router (e.g., Document Upload)
    } else {
      this.preferencesForm.markAllAsTouched();
    }
  }

  /**
   * Prepares the DTO and dispatches the update method to the SignalStore
   */
  private submitPreferences(): void {
    const details = this.store.applicationDetails();
    if (!details) return;

    const formValues = this.preferencesForm.value;
    
    // Map form values to the expected DTO structure
    const requestDto: UpdateApplicationPreferencesDto = {
      preferences: [
        { trackBranchOfferingId: formValues.primaryTrack, rank: 1 },
        { trackBranchOfferingId: formValues.backupTrack, rank: 2 }
      ]
    };

    // Call the updatePreferences rxMethod from the store
    this.store.updatePreferences({ 
      applicationId: details.id, 
      request: requestDto 
    });
  }
}
