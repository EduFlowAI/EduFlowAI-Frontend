export interface ApiResult<T> {
  isSuccess: boolean;
  data: T;
  statusCode: number;
  message: string;
}

export interface BranchOffering {
  offeringId: string;
  branchId: string;
  branchName: string;
  governorate: string | null;
  capacity: number;
}

export interface TrackCatalogItem {
  id: string;
  programId: string;
  name: string;
  description: string | null;
  prerequisiteTopics: string[];
  isActive: boolean;
  offerings: BranchOffering[];
}
