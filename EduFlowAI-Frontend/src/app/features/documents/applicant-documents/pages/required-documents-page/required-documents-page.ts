// features/documents/applicant-documents/pages/required-documents-page/required-documents-page.component.ts

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { LucideAngularModule, CircleCheck, RotateCcw, TriangleAlert, Info } from 'lucide-angular';

import { ApplicantDocumentsStore } from '../../data-access/applicant-documents.store';
import { DocumentsApi } from '../../data-access/documents.api';
import {
  DOCUMENT_TYPE_LABELS,
  DocumentStatus,
  DocumentType,
} from '../../models/Document.model';
import { FileDropzone } from '../../../../../shared/ui/file-dropzone/file-dropzone';
import { UploadProgress } from '../../../../../shared/ui/upload-progress/upload-progress';

@Component({
  selector: 'app-required-documents-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FileDropzone, UploadProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Route-scoped: fresh store per navigation into this feature, not a singleton.
  providers: [DocumentsApi, ApplicantDocumentsStore],
  templateUrl: './required-documents-page.html',
  styleUrl: './required-documents-page.scss',
})
export class RequiredDocumentsPage implements OnInit {
  /** Bound from the :applicationId route param — requires withComponentInputBinding() in app.config.ts */
  @Input({ required: true }) applicationId!: string;

  protected readonly store = inject(ApplicantDocumentsStore);

  protected readonly DocumentStatus = DocumentStatus;
  protected readonly DOCUMENT_TYPE_LABELS = DOCUMENT_TYPE_LABELS;

  protected readonly CircleCheckIcon = CircleCheck;
  protected readonly RotateCcwIcon = RotateCcw;
  protected readonly TriangleAlertIcon = TriangleAlert;
  protected readonly InfoIcon = Info;

  ngOnInit(): void {
    this.store.load(this.applicationId);
  }

  /** Document types whose card currently shows the dropzone in place of the file info (Replace clicked). */
  private readonly _replacingTypes = signal<ReadonlySet<DocumentType>>(new Set());
  protected readonly replacingTypes = this._replacingTypes.asReadonly();

  protected isReplacing(type: DocumentType): boolean {
    return this._replacingTypes().has(type);
  }

  protected toggleReplace(type: DocumentType): void {
    const next = new Set(this._replacingTypes());
    next.has(type) ? next.delete(type) : next.add(type);
    this._replacingTypes.set(next);
  }

  protected onFileSelected(documentType: DocumentType, file: File): void {
    this.store.uploadDocument(this.applicationId, documentType, file);
  }

  protected onSubmit(): void {
    this.store.submitPackage(this.applicationId);
  }

  protected uploadedCount(): number {
    return this.store.requiredTypes().length - this.store.missingTypes().length;
  }

  protected progressPercent(): number {
    const total = this.store.requiredTypes().length;
    return total === 0 ? 0 : Math.round((this.uploadedCount() / total) * 100);
  }
}