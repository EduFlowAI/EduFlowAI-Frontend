// shared/ui/file-dropzone/file-dropzone.component.ts

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { LucideAngularModule, UploadCloud, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-file-dropzone',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-dropzone.html',
  styleUrl: './file-dropzone.scss',
})
export class FileDropzone {
  /** File extensions without the dot, e.g. ['pdf', 'jpg', 'jpeg', 'png'] */
  @Input() acceptedTypes: string[] = ['pdf', 'jpg', 'jpeg', 'png'];
  @Input() maxSizeMb = 10;
  @Input() disabled = false;
  @Input() ariaLabel = 'Upload a document';

  /** Emits only after the file has passed client-side type/size validation. */
  @Output() fileSelected = new EventEmitter<File>();

  @ViewChild('fileInput') private fileInputRef!: ElementRef<HTMLInputElement>;

  protected readonly UploadCloudIcon = UploadCloud;
  protected readonly AlertCircleIcon = AlertCircle;

  protected readonly isDragOver = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly hintText = computed(
    () => `${this.acceptedTypes.map((t) => t.toUpperCase()).join(', ')}, max ${this.maxSizeMb}MB`,
  );

  protected readonly acceptAttr = computed(() =>
    this.acceptedTypes.map((t) => `.${t}`).join(','),
  );

  protected readonly containerClasses = computed(() => {
    const base = 'bg-[var(--surface-raised)]';
    if (this.disabled) {
      return `${base} border-[var(--border)] opacity-60 cursor-not-allowed`;
    }
    if (this.errorMessage()) {
      return `${base} border-[var(--red-700)] bg-[var(--red-100)]/40`;
    }
    if (this.isDragOver()) {
      return `${base} border-[var(--navy-900)] bg-[var(--border)]/20 cursor-pointer`;
    }
    return `${base} border-[var(--border-strong)] hover:border-[var(--navy-700)] hover:bg-[var(--border)]/10 cursor-pointer`;
  });

  protected onZoneClick(): void {
    if (this.disabled) return;
    this.fileInputRef.nativeElement.click();
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.disabled) return;
    this.isDragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    if (this.disabled) return;

    const file = event.dataTransfer?.files?.[0];
    if (file) this.validateAndEmit(file);
  }

  protected onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.validateAndEmit(file);
    input.value = ''; // allow re-selecting the same file later
  }

  private validateAndEmit(file: File): void {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const isAcceptedType = this.acceptedTypes.includes(extension);
    const isWithinSize = file.size <= this.maxSizeMb * 1024 * 1024;

    if (!isAcceptedType) {
      this.errorMessage.set(`Unsupported file type. Allowed: ${this.hintText()}`);
      return;
    }
    if (!isWithinSize) {
      this.errorMessage.set(`File too large. Max ${this.maxSizeMb}MB.`);
      return;
    }

    this.errorMessage.set(null);
    this.fileSelected.emit(file);
  }
}