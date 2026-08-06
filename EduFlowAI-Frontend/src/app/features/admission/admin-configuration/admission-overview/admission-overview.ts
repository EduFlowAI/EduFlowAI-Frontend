import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';

import { AdmissionAdminCopy } from '../admission-admin.copy';
import { AdmissionAdminApiService } from '../data-access/admission-admin-api.service';
import {
  AdminAdmissionDashboardDto,
  ProgramDto,
} from '../models/admission-admin.model';
import { admissionAdminErrorMessage } from '../utils/admission-admin-error.util';

@Component({
  selector: 'app-admission-overview',
  imports: [RouterLink],
  templateUrl: './admission-overview.html',
  styleUrl: './admission-overview.scss',
})
export class AdmissionOverview implements OnInit {
  protected readonly copy = inject(AdmissionAdminCopy);

  private readonly api = inject(AdmissionAdminApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly dashboard = signal<AdminAdmissionDashboardDto | null>(null);
  protected readonly programs = signal<readonly ProgramDto[]>([]);
  protected readonly selectedProgramId = signal('');
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .getPrograms()
      .pipe(
        switchMap((programs) => {
          this.programs.set(programs);

          const currentProgramId = this.selectedProgramId();
          const selectedProgramId = programs.some(
            (program) => program.id === currentProgramId,
          )
            ? currentProgramId
            : (programs[0]?.id ?? '');

          this.selectedProgramId.set(selectedProgramId);
          return this.api.getDashboard(selectedProgramId || undefined);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (dashboard) => this.dashboard.set(dashboard),
        error: (error: unknown) => this.setLoadError(error),
      });
  }

  protected onProgramChange(event: Event): void {
    const programId = (event.target as HTMLSelectElement).value;
    this.selectedProgramId.set(programId);
    this.loadDashboard(programId || undefined);
  }

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat(
      this.copy.isRtl() ? 'ar-EG' : 'en-US',
      { dateStyle: 'medium', timeStyle: 'short' },
    ).format(new Date(value));
  }

  private loadDashboard(programId?: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .getDashboard(programId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (dashboard) => this.dashboard.set(dashboard),
        error: (error: unknown) => this.setLoadError(error),
      });
  }

  private setLoadError(error: unknown): void {
    this.error.set(
      admissionAdminErrorMessage(
        error,
        this.copy.text(
          'Unable to load the Admission dashboard.',
          'تعذر تحميل لوحة تحكم القبول.',
        ),
      ),
    );
  }
}
