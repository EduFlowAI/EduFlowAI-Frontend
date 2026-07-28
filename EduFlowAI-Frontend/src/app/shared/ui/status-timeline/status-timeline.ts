import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ApplicationStatus = 'Draft' | 'DocumentsRequired' | 'EligibilityFailed'
  | 'UnderDocumentVerification' | 'NeedsHumanReview' | 'DocumentRejected' 
  | 'AssessmentInProgress' | 'Admitted' | 'Waitlisted'
  | 'NotSelected' | 'Withdrawn' | 'Expired';

// Define the shape of a single step in our timeline
interface TimelineStep{
  id: string;
  labelEn: string;
  labelAr: string;
  icon: string;
  state: 'passed' | 'current' | 'pending';
}

@Component({
  selector: 'app-status-timeline',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './status-timeline.html',
  styleUrl: './status-timeline.scss',
  // OnPush ensures the component only re-renders when the input signal changes
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class StatusTimeline {
  status = input.required<ApplicationStatus>();

  // A computed signal that recalculates the steps whenever the 'status' input changes
  steps = computed<TimelineStep[]>(() => {
    const currentStatus = this.status();

    // We create the base steps. Later we will change their 'state' based on currentStatus
    const timeline: TimelineStep[] = [
      { id: 'app', labelEn: 'Application', labelAr: 'التقديم', icon: 'check', state: 'pending' },
      { id: 'eligibility', labelEn: 'Eligibility', labelAr: 'الأهلية', icon: 'check', state: 'pending' },
      { id: 'verification', labelEn: 'Verification', labelAr: 'المراجعة', icon: 'hourglass_empty', state: 'pending' },
      { id: 'assessment', labelEn: 'Assessment', labelAr: 'التقييم', icon: 'quiz', state: 'pending' },
      { id: 'final', labelEn: 'Final Result', labelAr: 'النتيجة', icon: 'workspace_premium', state: 'pending' }
    ];

    // Basic logic to determine which steps are passed, current, or pending
    if (currentStatus === 'Draft') {
      timeline[0].state = 'current';
    } else if (currentStatus === 'DocumentsRequired') {
      timeline[0].state = 'passed';
      timeline[1].state = 'passed';
      timeline[2].state = 'current';
    } else if (currentStatus === 'AssessmentInProgress') {
      timeline[0].state = 'passed';
      timeline[1].state = 'passed';
      timeline[2].state = 'passed';
      timeline[3].state = 'current';
    } else if (currentStatus === 'Admitted' || currentStatus === 'NotSelected') {
      timeline[0].state = 'passed';
      timeline[1].state = 'passed';
      timeline[2].state = 'passed';
      timeline[3].state = 'passed';
      timeline[4].state = 'passed';
    }

    return timeline;
  });
}
