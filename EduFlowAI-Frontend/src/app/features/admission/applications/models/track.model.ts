export interface BranchOfferingDto {
    offeringId: string;
    branchId: string;
    branchName: string;
    governorate: string | null;
    capacity: number;
}

export interface TrackLocationDto {
    branchId: string;
    branchName: string;
    governorate: string | null;
}

export interface TrackDto {
    id: string;
    programId: string;
    officialTrackId: string | null;
    officialTrackUrl: string | null;
    isOfficialIntake47: boolean;
    intake: number | null;
    year: number | null;
    name: string;
    description: string | null;
    category: string | null;
    totalHours: number | null;
    minimumGrade: string | null;
    eligibilitySummary: string | null;
    graduationYearLimitYears: number | null;
    prerequisiteTopics: string[];
    isActive: boolean;
    locations: TrackLocationDto[];
    offerings: BranchOfferingDto[];
}
