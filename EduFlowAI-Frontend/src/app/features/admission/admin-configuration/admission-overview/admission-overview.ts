import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AdmissionAdminCopy } from '../admission-admin.copy';
import { AdmissionAdminApiService } from '../data-access/admission-admin-api.service';
import { AdminAdmissionDashboardDto } from '../models/admission-admin.model';
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
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .getDashboard()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (dashboard) => this.dashboard.set(dashboard),
        error: (error: unknown) =>
          this.error.set(
            admissionAdminErrorMessage(
              error,
              this.copy.text(
                'Unable to load the Admission dashboard.',
                'تعذر تحميل لوحة تحكم القبول.',
              ),
            ),
          ),
      });
  }

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat(
      this.copy.isRtl() ? 'ar-EG' : 'en-US',
      { dateStyle: 'medium', timeStyle: 'short' },
    ).format(new Date(value));
  }
}
