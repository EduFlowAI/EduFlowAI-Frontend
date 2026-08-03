// shared/ui/secure-file-viewer/secure-file-viewer.ts

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
  OnDestroy,
  signal,
} from '@angular/core';
import { Observable } from 'rxjs';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { LucideAngularModule, X, TriangleAlert } from 'lucide-angular';

type FileKind = 'pdf' | 'image' | 'unsupported';

/**
 * Reusable modal document viewer. Framework-agnostic about WHERE the file comes
 * from — the caller supplies a `fileFetcher` function that returns an
 * Observable<Blob> for a given document id. This keeps shared/ui decoupled from
 * any specific feature's data-access service (e.g. applicant-documents'
 * DocumentsApi), so both this feature and Ali's human-review feature can reuse
 * it by passing in their own fetch function, without shared/ui depending on
 * either feature.
 *
 * Renders as an object URL, never a raw API URL — see business rule 5 in the
 * feature brief.
 */
@Component({
  selector: 'app-secure-file-viewer',
  standalone: true,
  imports: [CommonModule, NgxExtendedPdfViewerModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secure-file-viewer.html',
  styleUrl: './secure-file-viewer.scss',
})
export class SecureFileViewer implements OnDestroy {
  /** Provided by the consuming feature — e.g. (id) => this.documentsApi.downloadFile(id) */
  @Input({ required: true }) fileFetcher!: (documentId: string) => Observable<Blob>;

  protected readonly XIcon = X;
  protected readonly TriangleAlertIcon = TriangleAlert;

  protected readonly isOpen = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly objectUrl = signal<string | null>(null);
  protected readonly fileKind = signal<FileKind>('unsupported');
  protected readonly fileName = signal('');

  /** Call from a parent component to open the viewer for a given document. */
  open(documentId: string, fileName: string): void {
    this.isOpen.set(true);
    this.fileName.set(fileName);
    this.fileKind.set(this.detectFileKind(fileName));
    this.loading.set(true);
    this.error.set(null);

    this.fileFetcher(documentId).subscribe({
      next: (blob) => {
        this.objectUrl.set(URL.createObjectURL(blob));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load this document. Please try again.');
        this.loading.set(false);
      },
    });
  }

  close(): void {
    this.revokeCurrentUrl();
    this.isOpen.set(false);
    this.error.set(null);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isOpen()) this.close();
  }

  ngOnDestroy(): void {
    this.revokeCurrentUrl();
  }

  private revokeCurrentUrl(): void {
    const url = this.objectUrl();
    if (url) {
      URL.revokeObjectURL(url);
      this.objectUrl.set(null);
    }
  }

  private detectFileKind(fileName: string): FileKind {
    const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
    if (extension === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png'].includes(extension)) return 'image';
    return 'unsupported';
  }
}