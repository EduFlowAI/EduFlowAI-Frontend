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
import { environment } from '../../../../../environments/environment.development';


@Injectable()
export class DocumentsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getRequiredDocumentTypes(applicationId: string): Observable<RequiredDocumentsResponse> {
    return this.http.get<RequiredDocumentsResponse>(
      `${this.baseUrl}/applications/${applicationId}/documents/required`
    );
  }

  getDocuments(applicationId: string): Observable<{ documents: ApplicantDocumentDto[] }> {
    return this.http.get<{ documents: ApplicantDocumentDto[] }>(
      `${this.baseUrl}/applications/${applicationId}/documents`
    );
  }

  uploadDocument(
    applicationId: string,
    documentType: DocumentType,
    file: File
  ): Observable<UploadDocumentResponse> {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('DocumentType', documentType.toString());

    return this.http.post<UploadDocumentResponse>(
      `${this.baseUrl}/applications/${applicationId}/documents`,
      formData
    );
  }

  submitPackage(applicationId: string): Observable<SubmitPackageResponse> {
    return this.http.post<SubmitPackageResponse>(
      `${this.baseUrl}/applications/${applicationId}/documents/submit`,
      null
    );
  }

  downloadFile(documentId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/documents/${documentId}/file`, {
      responseType: 'blob',
    });
  }
}