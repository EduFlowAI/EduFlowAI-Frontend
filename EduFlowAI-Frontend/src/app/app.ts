import { Component, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

import { StatusTimeline, ApplicationStatus } from './shared/ui/status-timeline/status-timeline';
import { StageStepper, AssessmentStageStatus } from './shared/ui/stage-stepper/stage-stepper';

@Component({
  selector: 'app-root',
  standalone: true,
  // imports: [StatusTimeline, StageStepper, RouterOutlet],
  imports: [StatusTimeline, StageStepper],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // Initialize signals with default values for the Timeline
  mockTimelineStatus = signal<ApplicationStatus>('Draft');

  // Initialize signals with default values for the Stepper
  mockEnglish = signal<AssessmentStageStatus>('InProgress');
  mockIq = signal<AssessmentStageStatus>('Pending');
  mockTech = signal<AssessmentStageStatus>('Pending');
  mockInterview = signal<AssessmentStageStatus>('Pending');

  // Helper method to reset the stepper to the initial state
  resetStepper() {
    this.mockEnglish.set('InProgress');
    this.mockIq.set('Pending');
    this.mockTech.set('Pending');
    this.mockInterview.set('Pending');
  }

  // Helper method to simulate passing an exam and moving to the next
  passEnglishStartIq() {
    this.mockEnglish.set('Passed');
    this.mockIq.set('InProgress');
    this.mockTech.set('Pending');
  }
}
