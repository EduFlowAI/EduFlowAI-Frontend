import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApplicationsStore } from '../../data-access/applications.store';
import { ApplicationRequestDto } from '../../models/application.model';

@Component({
  selector: 'app-application-create-page',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './application-create-page.html',
  styleUrl: './application-create-page.scss',
})
export class ApplicationCreatePage {
  readonly store = inject(ApplicationsStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  createForm: FormGroup;

  constructor() {
    // Initialize the form with basic details required to start an application
    this.createForm = this.fb.group({
      // The user must select an active admission cycle
      cycleId: ['', Validators.required] 
    });

    // Effect to navigate automatically once the application draft is successfully created
    effect(() => {
      const details = this.store.applicationDetails();
      const isLoading = this.store.isLoading();
      const error = this.store.error();

      // If we have application details (success), it's a draft, and no loading/errors are active
      if (details && details.status === 'Draft' && !isLoading && !error) {
        // Redirect to the preferences page we just built
        this.router.navigate(['/applicant/preferences']);
      }
    });
  }

  /**
   * Submits the form to create a new application draft
   */
  onSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const formValues = this.createForm.value;

    // Prepare the payload for the API
    const request: ApplicationRequestDto = {
      cycleId: formValues.cycleId,
      // Preferences are submitted empty here; they will be filled in the next step
      preferences: [] 
    };

    // Dispatch the action to the store
    this.store.createDraft(request);
  }
}
