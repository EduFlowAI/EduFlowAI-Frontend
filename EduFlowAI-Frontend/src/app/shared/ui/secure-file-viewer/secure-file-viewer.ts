import { Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface SecureFileViewerLabels {
  zoomIn: string;
  zoomOut: string;
  rotate: string;
  reset: string;
  download: string;
  documentPreview: string;
  unsupported: string;
}

@Component({
  selector: 'app-secure-file-viewer',
  imports: [],
  templateUrl: './secure-file-viewer.html',
  styleUrl: './secure-file-viewer.scss',
})
export class SecureFileViewer {
  readonly sourceUrl = input.required<string>();
  readonly mimeType = input.required<string>();
  readonly fileName = input.required<string>();
  readonly labels = input.required<SecureFileViewerLabels>();

  protected readonly zoom = signal(1);
  protected readonly rotation = signal(0);
  protected readonly isImage = computed(() => this.mimeType().startsWith('image/'));
  protected readonly isPdf = computed(() => this.mimeType() === 'application/pdf');
  protected readonly transform = computed(
    () => `scale(${this.zoom()}) rotate(${this.rotation()}deg)`,
  );
  protected readonly safeSource = computed<SafeResourceUrl>(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(this.sourceUrl()),
  );

  private readonly sanitizer = inject(DomSanitizer);

  protected zoomIn(): void {
    this.zoom.update((value) => Math.min(2.5, Number((value + 0.2).toFixed(1))));
  }

  protected zoomOut(): void {
    this.zoom.update((value) => Math.max(0.6, Number((value - 0.2).toFixed(1))));
  }

  protected rotate(): void {
    this.rotation.update((value) => (value + 90) % 360);
  }

  protected reset(): void {
    this.zoom.set(1);
    this.rotation.set(0);
  }
}
