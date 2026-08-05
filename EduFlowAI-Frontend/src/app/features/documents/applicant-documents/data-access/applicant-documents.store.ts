// features/documents/applicant-documents/data-access/applicant-documents.store.ts

import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { DocumentsApi } from './documents.api';
import { ApplicantDocumentDto, DocumentStatus, DocumentType } from '../models/Document.model';

interface ApplicantDocumentsState {
    requiredTypes: DocumentType[];
    documents: ApplicantDocumentDto[];
    loading: boolean;
    /** The DocumentType currently being uploaded, or null if nothing is in flight. */
    uploadingType: DocumentType | null;
    submitting: boolean;
    error: string | null;
}

const initialState: ApplicantDocumentsState = {
    requiredTypes: [],
    documents: [],
    loading: false,
    uploadingType: null,
    submitting: false,
    error: null,
};

function extractErrorMessage(err: unknown): string {
    const httpError = err as { error?: { error?: string } };
    return httpError?.error?.error ?? 'Something went wrong. Please try again.';
}

/**
 * Route-scoped state for the applicant-documents feature.
 * No `{ providedIn: 'root' }` — provide this in the page/route's own `providers`
 * array so state resets per navigation instead of leaking across applicants,
 * matching how it was scoped before this refactor.
 */
export const ApplicantDocumentsStore = signalStore(
    withState(initialState),

    withComputed(({ requiredTypes, documents, uploadingType, submitting }) => {
        /** Latest document (if any) per required type. */
        const documentByType = computed(() => {
            const map = new Map<DocumentType, ApplicantDocumentDto>();
            for (const doc of documents()) {
                map.set(doc.documentType, doc);
            }
            return map;
        });

        /** Required types that have no document, or whose only document was Rejected. */
        const missingTypes = computed(() => {
            const byType = documentByType();
            return requiredTypes().filter((type) => {
                const doc = byType.get(type);
                return !doc || doc.status === DocumentStatus.Rejected;
            });
        });

        const canSubmit = computed(
            () =>
                requiredTypes().length > 0 &&
                missingTypes().length === 0 &&
                uploadingType() === null &&
                !submitting(),
        );

        return { documentByType, missingTypes, canSubmit };
    }),

    withMethods((store, api = inject(DocumentsApi)) => ({
        /** Loads both the required-types list and the applicant's existing documents. */
        load(applicationId: string): void {
            patchState(store, { loading: true, error: null });

            api.getRequiredDocumentTypes(applicationId).subscribe({
                next: (res) => patchState(store, { requiredTypes: res.documentTypes }),
                error: (err) => patchState(store, { error: extractErrorMessage(err) }),
            });

            api.getDocuments(applicationId).subscribe({
                next: (res) => patchState(store, { documents: res.documents, loading: false }),
                error: (err) => patchState(store, { error: extractErrorMessage(err), loading: false }),
            });
        },

        /** Uploads a new document, or overwrites an existing one of the same type (same endpoint). */
        uploadDocument(applicationId: string, documentType: DocumentType, file: File): void {
            patchState(store, { uploadingType: documentType, error: null });

            api.uploadDocument(applicationId, documentType, file).subscribe({
                next: () => {
                    patchState(store, { uploadingType: null });
                    this.load(applicationId); // refresh document list/status after a successful upload
                },
                error: (err) => patchState(store, { error: extractErrorMessage(err), uploadingType: null }),
            });
        },

        submitPackage(applicationId: string, onSuccess?: (submittedCount: number) => void): void {
            patchState(store, { submitting: true, error: null });

            api.submitPackage(applicationId).subscribe({
                next: (res) => {
                    patchState(store, { submitting: false });
                    onSuccess?.(res.submittedCount);
                    this.load(applicationId); // refresh statuses (Uploaded -> Verifying)
                },
                error: (err) => patchState(store, { error: extractErrorMessage(err), submitting: false }),
            });
        },

        /** Passthrough for SecureFileViewer's fileFetcher input — keeps the API service private to this store. */
        downloadFile(documentId: string) {
            return api.downloadFile(documentId);
        },
    })),
);