import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-final-result-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './final-result-card.component.html',
  styleUrl: './final-result-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinalResultCardComponent {
  // Receives the CurrentStatus and applicationId from ApplicationDashboardSummaryDto
  status = input.required<string>(); 
  applicationId = input.required<string | null>();

  // Mock data for the UI representation
  trackName = input<string>('Professional Web Development'); 
  branchName = input<string>('Alexandria'); 
  waitlistPosition = input<number>(5);
}
