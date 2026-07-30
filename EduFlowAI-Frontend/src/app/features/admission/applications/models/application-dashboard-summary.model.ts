/*
 * Define the shape of the data returned by the dashboard-summary endpoint
*/
export interface ApplicationDashboardSummary {
    applicationId: string;
    intakeName: string;
    submittedAt?: string; 
    lastUpdatedAt: string;
    currentStatus: string;
    eligibilityResult: string;
    statusMessage: string;
    
    // Fields for the dynamic timeline
    timelineProgressPercentage: number;
    applicationPhaseStatus: string;
    eligibilityPhaseStatus: string;
    verificationPhaseStatus: string;
    englishIqPhaseStatus: string;
    technicalPhaseStatus: string;
    interviewPhaseStatus: string;
    finalResultPhaseStatus: string;
}