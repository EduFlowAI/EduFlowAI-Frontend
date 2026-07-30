import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApplicationsStore } from '../../data-access/applications.store';

@Component({
  selector: 'app-applicant-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './applicant-dashboard-page.html',
  styleUrl: './applicant-dashboard-page.scss',
})
export class ApplicantDashboardPage implements OnInit {
  readonly store = inject(ApplicationsStore);

  // Inject ActivatedRoute to read parameters from the URL
  private readonly route = inject(ActivatedRoute);

  // Store the real ID to use it for initial load and retries
  private currentApplicationId: string | null = null;

  ngOnInit(): void {
    // Extract the 'id' parameter from the active route
    this.currentApplicationId = this.route.snapshot.paramMap.get('id');

    if (this.currentApplicationId) {
      // Fetch the data using the real application ID
      this.store.loadDashboardSummary(this.currentApplicationId);
    } else {
      // Fallback or error handling if the ID is missing from the URL
      console.error('Application ID is missing from the route parameters!');
    }
  }

  // Helper method for the UI retry button
  retryLoading(): void {
    if (this.currentApplicationId) {
      // Retry using the same real ID
      this.store.loadDashboardSummary(this.currentApplicationId);
    }
  }
}
