// features/documents/applicant-documents/data-access/applicant-documents.store.ts

import { inject, Injectable, computed, signal } from '@angular/core';

import { DocumentsApi } from './documents.api';
import {
    ApplicantDocumentDto,
    DocumentStatus,
    DocumentType,
} from '../models/Document.model';

/**
 * Route-scoped state for the applicant-documents feature.
 * Provide this in the feature's route config (not root) so state resets
 * per application/navigation instead of leaking across applicants.
 */
@Injectable()
export class ApplicantDocumentsStore {
    private readonly api = inject(DocumentsApi);

    // ---- raw state ----
    private readonly _requiredTypes = signal<DocumentType[]>([]);
    private readonly _documents = signal<ApplicantDocumentDto[]>([]);
    private readonly _loading = signal(false);
    private readonly _uploadingType = signal<DocumentType | null>(null);
    private readonly _submitting = signal(false);
    private readonly _error = signal<string | null>(null);

    // ---- public read-only signals ----
    readonly requiredTypes = this._requiredTypes.asReadonly();
    readonly documents = this._documents.asReadonly();
    readonly loading = this._loading.asReadonly();
    /** The DocumentType currently being uploaded, or null if nothing is in flight. */
    readonly uploadingType = this._uploadingType.asReadonly();
    readonly submitting = this._submitting.asReadonly();
    readonly error = this._error.asReadonly();

    /** Latest document (if any) per required type. Rejected counts as "not fulfilled." */
    readonly documentByType = computed(() => {
        const map = new Map<DocumentType, ApplicantDocumentDto>();
        for (const doc of this._documents()) {
            map.set(doc.documentType, doc);
        }
        return map;
    });

    /** Required types that have no document, or whose only document was Rejected. */
    readonly missingTypes = computed(() => {
        const byType = this.documentByType();
        return this._requiredTypes().filter((type) => {
            const doc = byType.get(type);
            return !doc || doc.status === DocumentStatus.Rejected;
        });
    });

    readonly canSubmit = computed(
        () =>
            this._requiredTypes().length > 0 &&
            this.missingTypes().length === 0 &&
            this._uploadingType() === null &&
            !this._submitting(),
    );

    /** Loads both the required-types list and the applicant's existing documents. */
    load(applicationId: string): void {
        this._loading.set(true);
        this._error.set(null);

        this.api.getRequiredDocumentTypes(applicationId).subscribe({
            next: (res) => this._requiredTypes.set(res.documentTypes),
            error: (err) => this._error.set(this.extractErrorMessage(err)),
        });

        this.api.getDocuments(applicationId).subscribe({
            next: (res) => {
                this._documents.set(res.documents);
                this._loading.set(false);
            },
            error: (err) => {
                this._error.set(this.extractErrorMessage(err));
                this._loading.set(false);
            },
        });
    }

    /** Uploads a new document, or overwrites an existing one of the same type (same endpoint). */
    uploadDocument(applicationId: string, documentType: DocumentType, file: File): void {
        this._uploadingType.set(documentType);
        this._error.set(null);

        this.api.uploadDocument(applicationId, documentType, file).subscribe({
            next: () => {
                this._uploadingType.set(null);
                this.load(applicationId); // refresh document list/status after a successful upload
            },
            error: (err) => {
                this._error.set(this.extractErrorMessage(err));
                this._uploadingType.set(null);
            },
        });
    }

    submitPackage(applicationId: string, onSuccess?: (submittedCount: number) => void): void {
        this._submitting.set(true);
        this._error.set(null);

        this.api.submitPackage(applicationId).subscribe({
            next: (res) => {
                this._submitting.set(false);
                onSuccess?.(res.submittedCount);
                this.load(applicationId); // refresh statuses (Uploaded -> Verifying)
            },
            error: (err) => {
                this._error.set(this.extractErrorMessage(err));
                this._submitting.set(false);
            },
        });
    }

    private extractErrorMessage(err: unknown): string {
        const httpError = err as { error?: { error?: string } };
        return httpError?.error?.error ?? 'Something went wrong. Please try again.';
    }
}