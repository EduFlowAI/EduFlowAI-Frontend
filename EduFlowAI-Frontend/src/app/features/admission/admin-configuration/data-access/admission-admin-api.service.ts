import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  AdminAdmissionDashboardDto,
  AdminTrackDto,
  AdmissionCycleDto,
  ApiResult,
  BranchDto,
  CreateAdmissionCycleRequest,
  CreateBranchRequest,
  CreateInstitutionRequest,
  CreateOfferingRequest,
  CreateProgramRequest,
  CreateTrackRequest,
  CycleEligibilityRuleDto,
  InstitutionDto,
  OfferingDto,
  ProgramDocumentRequirementDto,
  ProgramDto,
  UpdateBranchRequest,
  UpdateCycleEligibilityRuleRequest,
  UpdateInstitutionRequest,
  UpdateOfferingRequest,
  UpdateProgramDocumentRequirementsRequest,
  UpdateProgramRequest,
  UpdateTrackRequest,
} from '../models/admission-admin.model';

@Injectable({ providedIn: 'root' })
export class AdmissionAdminApiService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<AdminAdmissionDashboardDto> {
    return this.get<AdminAdmissionDashboardDto>('/api/admin/dashboard');
  }

  getInstitutions(): Observable<readonly InstitutionDto[]> {
    return this.get<InstitutionDto[]>('/api/admin/institutions');
  }

  createInstitution(
    request: CreateInstitutionRequest,
  ): Observable<InstitutionDto> {
    return this.post<InstitutionDto>('/api/admin/institutions', request);
  }

  updateInstitution(
    institutionId: string,
    request: UpdateInstitutionRequest,
  ): Observable<InstitutionDto> {
    return this.put<InstitutionDto>(
      `/api/admin/institutions/${institutionId}`,
      request,
    );
  }

  getPrograms(): Observable<readonly ProgramDto[]> {
    return this.get<ProgramDto[]>('/api/admin/programs');
  }

  createProgram(request: CreateProgramRequest): Observable<ProgramDto> {
    return this.post<ProgramDto>('/api/admin/programs', request);
  }

  updateProgram(
    programId: string,
    request: UpdateProgramRequest,
  ): Observable<ProgramDto> {
    return this.put<ProgramDto>(`/api/admin/programs/${programId}`, request);
  }

  deleteProgram(programId: string): Observable<boolean> {
    return this.delete<boolean>(`/api/admin/programs/${programId}`);
  }

  getProgramRequirements(
    programId: string,
  ): Observable<readonly ProgramDocumentRequirementDto[]> {
    return this.get<ProgramDocumentRequirementDto[]>(
      `/api/admin/programs/${programId}/document-requirements`,
    );
  }

  updateProgramRequirements(
    programId: string,
    request: UpdateProgramDocumentRequirementsRequest,
  ): Observable<readonly ProgramDocumentRequirementDto[]> {
    return this.put<ProgramDocumentRequirementDto[]>(
      `/api/admin/programs/${programId}/document-requirements`,
      request,
    );
  }

  getTracks(): Observable<readonly AdminTrackDto[]> {
    return this.get<AdminTrackDto[]>('/api/admin/tracks');
  }

  createTrack(request: CreateTrackRequest): Observable<AdminTrackDto> {
    return this.post<AdminTrackDto>('/api/admin/tracks', request);
  }

  updateTrack(
    trackId: string,
    request: UpdateTrackRequest,
  ): Observable<AdminTrackDto> {
    return this.put<AdminTrackDto>(`/api/admin/tracks/${trackId}`, request);
  }

  getBranches(): Observable<readonly BranchDto[]> {
    return this.get<BranchDto[]>('/api/admin/branches');
  }

  createBranch(request: CreateBranchRequest): Observable<BranchDto> {
    return this.post<BranchDto>('/api/admin/branches', request);
  }

  updateBranch(
    branchId: string,
    request: UpdateBranchRequest,
  ): Observable<BranchDto> {
    return this.put<BranchDto>(`/api/admin/branches/${branchId}`, request);
  }

  getCycles(): Observable<readonly AdmissionCycleDto[]> {
    return this.get<AdmissionCycleDto[]>('/api/admin/cycles');
  }

  createCycle(
    request: CreateAdmissionCycleRequest,
  ): Observable<AdmissionCycleDto> {
    return this.post<AdmissionCycleDto>('/api/admin/cycles', request);
  }

  updateEligibilityRule(
    cycleId: string,
    request: UpdateCycleEligibilityRuleRequest,
  ): Observable<CycleEligibilityRuleDto> {
    return this.put<CycleEligibilityRuleDto>(
      `/api/admin/cycles/${cycleId}/eligibility-rule`,
      request,
    );
  }

  createOffering(
    cycleId: string,
    request: CreateOfferingRequest,
  ): Observable<OfferingDto> {
    return this.post<OfferingDto>(
      `/api/admin/cycles/${cycleId}/offerings`,
      request,
    );
  }

  updateOffering(
    cycleId: string,
    offeringId: string,
    request: UpdateOfferingRequest,
  ): Observable<OfferingDto> {
    return this.put<OfferingDto>(
      `/api/admin/cycles/${cycleId}/offerings/${offeringId}`,
      request,
    );
  }

  deleteOffering(cycleId: string, offeringId: string): Observable<boolean> {
    return this.delete<boolean>(
      `/api/admin/cycles/${cycleId}/offerings/${offeringId}`,
    );
  }

  activateCycle(cycleId: string): Observable<AdmissionCycleDto> {
    return this.post<AdmissionCycleDto>(
      `/api/admin/cycles/${cycleId}/activate`,
      null,
    );
  }

  closeCycle(cycleId: string): Observable<AdmissionCycleDto> {
    return this.post<AdmissionCycleDto>(
      `/api/admin/cycles/${cycleId}/close`,
      null,
    );
  }

  private get<T>(url: string): Observable<T> {
    return this.http
      .get<ApiResult<T>>(url)
      .pipe(map((response) => this.unwrap(response)));
  }

  private post<T>(url: string, body: unknown): Observable<T> {
    return this.http
      .post<ApiResult<T>>(url, body)
      .pipe(map((response) => this.unwrap(response)));
  }

  private put<T>(url: string, body: unknown): Observable<T> {
    return this.http
      .put<ApiResult<T>>(url, body)
      .pipe(map((response) => this.unwrap(response)));
  }

  private delete<T>(url: string): Observable<T> {
    return this.http
      .delete<ApiResult<T>>(url)
      .pipe(map((response) => this.unwrap(response)));
  }

  private unwrap<T>(response: ApiResult<T>): T {
    if (!response.isSuccess) {
      throw new Error(response.message || 'The request was not successful.');
    }

    return response.data;
  }
}
