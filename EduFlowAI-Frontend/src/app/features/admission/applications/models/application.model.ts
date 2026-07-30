// Core Result Wrapper matching the C# Result<T> implementation
export interface Result<T> {
    isSuccess: boolean;
    data: T;
    statusCode: number;
    message: string;
}

// Application Status Enum matching C# ApplicationStatus
export enum ApplicationStatus {
    None = 0,
    Draft = 1,
    DocumentsRequired = 2,
    EligibilityFailed = 3,
    UnderDocumentVerification = 4,
    NeedsHumanReview = 5,
    DocumentRejected = 6,
    AssessmentInProgress = 7,
    Admitted = 8,
    Waitlisted = 9,
    NotSelected = 10,
    Withdrawn = 11,
    Expired = 12
}

// DTO for Track/Branch Preference
export interface PreferenceDto {
    trackBranchOfferingId: string; // Guid maps to string in TS
    rank: number;                  // short maps to number
}

// DTO for creating a new draft application
export interface ApplicationRequestDto {
    cycleId: string;
    preferences: PreferenceDto[];
}

// DTO for updating existing preferences
export interface UpdateApplicationPreferencesDto {
    preferences: PreferenceDto[];
}

// DTO for application details returned from GET endpoint
export interface ApplicationDetailsDto {
    id: string;
    applicantUserId: string;
    cycleId: string;
    status: string;     // Kept as string to match C# JSON serialization, can be mapped to Enum if needed
    createdAt: string;  // DateTimeOffset maps to ISO string
    updatedAt: string;
    preferences: PreferenceDto[];
}