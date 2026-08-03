import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ApplicantDocumentDto,
  DocumentType,
  RequiredDocumentsResponse,
  SubmitPackageResponse,
  UploadDocumentResponse,
} from '../models/Document.model';

@Injectable()
export class DocumentsApi {
  private readonly http = inject(HttpClient);

  getRequiredDocumentTypes(applicationId: string): Observable<RequiredDocumentsResponse> {
    return this.http.get<RequiredDocumentsResponse>(
      `/api/applications/${applicationId}/documents/required`
    );
  }

  getDocuments(applicationId: string): Observable<{ documents: ApplicantDocumentDto[] }> {
    return this.http.get<{ documents: ApplicantDocumentDto[] }>(
      `/api/applications/${applicationId}/documents`
    );
  }

  uploadDocument(
    applicationId: string,
    documentType: DocumentType,
    file: File
  ): Observable<UploadDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType.toString());

    return this.http.post<UploadDocumentResponse>(
      `/api/applications/${applicationId}/documents`,
      formData
    );
  }

  submitPackage(applicationId: string): Observable<SubmitPackageResponse> {
    return this.http.post<SubmitPackageResponse>(
      `/api/applications/${applicationId}/documents/submit`,
      null
    );
  }
}