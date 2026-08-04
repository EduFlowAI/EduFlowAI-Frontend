import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationDashboardSummary } from '../../../features/admission/applications/models/application-dashboard-summary.model';

// export type ApplicationStatus = 'Draft' | 'DocumentsRequired' | 'EligibilityFailed'
//   | 'UnderDocumentVerification' | 'NeedsHumanReview' | 'DocumentRejected' 
//   | 'AssessmentInProgress' | 'Admitted' | 'Waitlisted'
//   | 'NotSelected' | 'Withdrawn' | 'Expired';

// Define the shape of a single step in our timeline
interface TimelineStep{
  id: string;
  labelEn: string;
  labelAr: string;
  icon: string;
  state: string;    // State matches the values from the backend model: 'Passed', 'InProgress', 'Pending'
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
  summary = input.required<ApplicationDashboardSummary>();

  // A computed signal that builds the 7 steps automatically whenever the summary input changes
  steps = computed<TimelineStep[]>(() => {
    const data = this.summary();

    // Helper function to normalize the state coming from the backend
    // It maps variations like 'In Progress' or 'Draft' to the strict 'InProgress' string expected by ngClass
    const normalizeState = (rawState: string | undefined): string => {
      if (!rawState) return 'Pending';
      
      // Clean the string: remove extra spaces and convert to lowercase
      const cleanState = rawState.trim().toLowerCase();
      
      // Check variations safely
      if (cleanState === 'in progress' || cleanState === 'inprogress' || cleanState === 'draft') {
        return 'InProgress';
      }
      if (cleanState === 'passed' || cleanState === 'success' || cleanState === 'completed') {
        return 'Passed';
      }
      
      // Strict fallback to ensure ngClass always finds a valid match
      return 'Pending';
    };

    // Pre-calculate all states cleanly before building the array
    const states = {
      app: normalizeState(data.applicationPhaseStatus),
      elig: normalizeState(data.eligibilityPhaseStatus),
      verif: normalizeState(data.verificationPhaseStatus),
      eng: normalizeState(data.englishIqPhaseStatus),
      tech: normalizeState(data.technicalPhaseStatus),
      int: normalizeState(data.interviewPhaseStatus),
      final: normalizeState(data.finalResultPhaseStatus)
    };

    // We create the base steps. Later we will change their 'state' based on currentStatus
    // Build the timeline using the strictly normalized states
    const timeline: TimelineStep[] = [
      { id: 'app', labelEn: 'Application', labelAr: 'التقديم',
        icon: states.app === 'Passed' ? 'check' : 'edit_document', 
        state: states.app },
      { id: 'eligibility', labelEn: 'Eligibility', labelAr: 'الأهلية',
        icon: states.elig === 'Passed' ? 'check' : 'rule', 
        state: states.elig },
      { id: 'verification', labelEn: 'Verification', labelAr: 'المراجعة',
        icon: states.verif === 'Passed' ? 'check' : 'hourglass_top', 
        state: states.verif },
      { id: 'englishIq', labelEn: 'English/IQ', labelAr: 'الإنجليزي والذكاء',
        icon: states.eng === 'Passed' ? 'check' : 'psychology', 
        state: states.eng },
      { id: 'technical', labelEn: 'Technical', labelAr: 'التقني',
        icon: states.tech === 'Passed' ? 'check' : 'terminal', 
        state: states.tech },
      { id: 'interviews', labelEn: 'Interviews', labelAr: 'المقابلات', 
        icon: states.int === 'Passed' ? 'check' : 'groups', 
        state: states.int },
      { id: 'final', labelEn: 'Final Result', labelAr: 'النتيجة', 
        icon: states.final === 'Passed' ? 'check' : 'military_tech', 
        state: states.final }
    ];

    return timeline;
  });
}
