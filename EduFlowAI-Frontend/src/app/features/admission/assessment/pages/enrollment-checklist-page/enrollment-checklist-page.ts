import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-enrollment-checklist-page',
  standalone: true,
  imports: [],
  templateUrl: './enrollment-checklist-page.html',
  styleUrl: './enrollment-checklist-page.scss',
  // Enforcing zoneless architecture for optimal performance
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnrollmentChecklistPage {
  
}
