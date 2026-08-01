import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { AdmissionAdminCopy } from '../admission-admin.copy';
import { AdmissionAdminApiService } from '../data-access/admission-admin-api.service';
import {
  AdmissionCycleDto,
  AdminTrackDto,
  BranchDto,
  CumulativeGrade,
  CycleStatus,
  OfferingInput,
  ProgramDto,
} from '../models/admission-admin.model';
import { admissionAdminErrorMessage } from '../utils/admission-admin-error.util';

@Component({
  selector: 'app-cycle-management-page',
  imports: [ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './cycle-management-page.html',
  styleUrl: '../admin-management.scss',
})
export class CycleManagementPage implements OnInit {
  protected readonly copy = inject(AdmissionAdminCopy);
  protected readonly CycleStatus = CycleStatus;

  private readonly api = inject(AdmissionAdminApiService);
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  private readonly destroyRef = inject(DestroyRef);

  protected readonly programs = signal<readonly ProgramDto[]>([]);
  protected readonly tracks = signal<readonly AdminTrackDto[]>([]);
  protected readonly branches = signal<readonly BranchDto[]>([]);
  protected readonly cycles = signal<readonly AdmissionCycleDto[]>([]);
  protected readonly selectedCycleId = signal('');
  protected readonly offeringInputs = signal<OfferingInput[]>([]);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

  protected readonly selectedCycle = computed(() =>
    this.cycles().find((cycle) => cycle.id === this.selectedCycleId()) ?? null,
  );

  protected readonly selectedProgramTracks = computed(() => {
    const cycle = this.selectedCycle();
    return cycle
      ? this.tracks().filter((track) => track.programId === cycle.programId)
      : [];
  });

  protected readonly cycleForm = this.formBuilder.group({
    programId: ['', Validators.required],
    label: ['', [Validators.required, Validators.maxLength(200)]],
    startDate: ['', Validators.required],
    deadlineLocal: ['', Validators.required],
  });

  protected readonly eligibilityForm = this.formBuilder.group({
    requiredNationality: ['EG', [Validators.required, Validators.maxLength(5)]],
    requiredDegreeLevel: ['Bachelor', [Validators.required, Validators.maxLength(30)]],
    maxYearsSinceGraduation: [5, [Validators.required, Validators.min(0), Validators.max(100)]],
    minGrade: [CumulativeGrade.Good, Validators.required],
  });

  protected readonly offeringForm = this.formBuilder.group({
    trackId: ['', Validators.required],
    branchId: ['', Validators.required],
    capacity: [1, [Validators.required, Validators.min(1)]],
  });

  protected readonly gradeOptions = [
    { value: CumulativeGrade.Acceptable, en: 'Acceptable', ar: 'مقبول' },
    { value: CumulativeGrade.Good, en: 'Good', ar: 'جيد' },
    { value: CumulativeGrade.VeryGood, en: 'Very good', ar: 'جيد جدًا' },
    { value: CumulativeGrade.Excellent, en: 'Excellent', ar: 'ممتاز' },
  ] as const;

  ngOnInit(): void {
    this.load();
  }

  protected load(preferredCycleId?: string): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      programs: this.api.getPrograms(),
      tracks: this.api.getTracks(),
      branches: this.api.getBranches(),
      cycles: this.api.getCycles(),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ programs, tracks, branches, cycles }) => {
          this.programs.set(programs);
          this.tracks.set(tracks);
          this.branches.set(branches);
          this.cycles.set(cycles);

          if (!this.cycleForm.controls.programId.value && programs[0]) {
            this.cycleForm.controls.programId.setValue(programs[0].id);
          }

          const cycleId =
            preferredCycleId ??
            this.selectedCycleId() ??
            cycles.find((cycle) => cycle.status === CycleStatus.Active)?.id ??
            cycles[0]?.id ??
            '';
          this.selectCycle(cycleId);
        },
        error: (error: unknown) => this.showError(error, 'Unable to load cycle configuration.'),
      });
  }

  protected createCycle(): void {
    this.clearMessages();

    if (this.cycleForm.invalid) {
      this.cycleForm.markAllAsTouched();
      return;
    }

    const value = this.cycleForm.getRawValue();
    const deadline = new Date(value.deadlineLocal);

    if (Number.isNaN(deadline.getTime())) {
      this.error.set(
        this.copy.text('Enter a valid application deadline.', 'أدخل موعدًا نهائيًا صحيحًا للتقديم.'),
      );
      return;
    }

    this.busy.set(true);
    this.api
      .createCycle({
        programId: value.programId,
        label: value.label.trim(),
        startDate: value.startDate,
        deadlineUtc: deadline.toISOString(),
      })
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (cycle) => {
          this.success.set(
            this.copy.text('Draft cycle created successfully.', 'تم إنشاء دورة مسودة بنجاح.'),
          );
          this.cycleForm.reset({
            programId: this.programs()[0]?.id ?? '',
            label: '',
            startDate: '',
            deadlineLocal: '',
          });
          this.load(cycle.id);
        },
        error: (error: unknown) => this.showError(error, 'Unable to create cycle.'),
      });
  }

  protected onCycleChange(event: Event): void {
    this.selectCycle((event.target as HTMLSelectElement).value);
  }

  protected selectCycle(cycleId: string): void {
    this.selectedCycleId.set(cycleId);
    const cycle = this.cycles().find((item) => item.id === cycleId);

    if (!cycle) {
      this.offeringInputs.set([]);
      return;
    }

    const rule = cycle.eligibilityRule;
    this.eligibilityForm.reset({
      requiredNationality: rule?.requiredNationality ?? 'EG',
      requiredDegreeLevel: rule?.requiredDegreeLevel ?? 'Bachelor',
      maxYearsSinceGraduation: rule?.maxYearsSinceGraduation ?? 5,
      minGrade: rule?.minGrade ?? CumulativeGrade.Good,
    });
    this.offeringInputs.set(
      cycle.offerings.map((offering) => ({
        trackId: offering.trackId,
        branchId: offering.branchId,
        capacity: offering.capacity,
      })),
    );

    const tracks = this.tracks().filter((track) => track.programId === cycle.programId);
    this.offeringForm.reset({
      trackId: tracks[0]?.id ?? '',
      branchId: this.branches().find((branch) => branch.isActive)?.id ?? this.branches()[0]?.id ?? '',
      capacity: 1,
    });
  }

  protected saveEligibility(): void {
    this.clearMessages();
    const cycle = this.selectedCycle();

    if (!cycle || cycle.status !== CycleStatus.Draft || this.eligibilityForm.invalid) {
      this.eligibilityForm.markAllAsTouched();
      return;
    }

    const value = this.eligibilityForm.getRawValue();
    this.busy.set(true);
    this.api
      .updateEligibilityRule(cycle.id, {
        requiredNationality: value.requiredNationality.trim().toUpperCase(),
        requiredDegreeLevel: value.requiredDegreeLevel.trim(),
        maxYearsSinceGraduation: value.maxYearsSinceGraduation,
        minGrade: value.minGrade,
      })
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.success.set(
            this.copy.text('Eligibility rule saved.', 'تم حفظ قاعدة الأهلية.'),
          );
          this.load(cycle.id);
        },
        error: (error: unknown) => this.showError(error, 'Unable to save eligibility rule.'),
      });
  }

  protected addOffering(): void {
    this.clearMessages();

    if (this.offeringForm.invalid) {
      this.offeringForm.markAllAsTouched();
      return;
    }

    const value = this.offeringForm.getRawValue();
    const duplicate = this.offeringInputs().some(
      (offering) =>
        offering.trackId === value.trackId && offering.branchId === value.branchId,
    );

    if (duplicate) {
      this.error.set(
        this.copy.text(
          'That track and branch combination already exists.',
          'تمت إضافة نفس المسار والفرع من قبل.',
        ),
      );
      return;
    }

    this.offeringInputs.update((offerings) => [...offerings, value]);
  }

  protected removeOffering(index: number): void {
    this.offeringInputs.update((offerings) =>
      offerings.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  protected saveOfferings(): void {
    this.clearMessages();
    const cycle = this.selectedCycle();

    if (!cycle || cycle.status !== CycleStatus.Draft || this.offeringInputs().length === 0) {
      this.error.set(
        this.copy.text(
          'Select a draft cycle and add at least one offering.',
          'اختر دورة مسودة وأضف مسارًا وفرعًا واحدًا على الأقل.',
        ),
      );
      return;
    }

    this.busy.set(true);
    this.api
      .configureOfferings(cycle.id, { offerings: this.offeringInputs() })
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.success.set(
            this.copy.text('Cycle offerings saved.', 'تم حفظ مسارات وفروع الدورة.'),
          );
          this.load(cycle.id);
        },
        error: (error: unknown) => this.showError(error, 'Unable to save cycle offerings.'),
      });
  }

  protected activateCycle(): void {
    const cycle = this.selectedCycle();
    if (!cycle || cycle.status !== CycleStatus.Draft) {
      return;
    }

    const confirmed = window.confirm(
      this.copy.text(
        'Activate this cycle? Any other active cycle will block activation.',
        'هل تريد تفعيل هذه الدورة؟ لا يمكن أن توجد دورتان نشطتان في نفس الوقت.',
      ),
    );
    if (!confirmed) {
      return;
    }

    this.runCycleAction(
      this.api.activateCycle(cycle.id),
      cycle.id,
      this.copy.text('Cycle activated successfully.', 'تم تفعيل الدورة بنجاح.'),
    );
  }

  protected closeCycle(): void {
    const cycle = this.selectedCycle();
    if (!cycle || cycle.status !== CycleStatus.Active) {
      return;
    }

    const confirmed = window.confirm(
      this.copy.text(
        'Close this cycle? Applicants will no longer see its offerings.',
        'هل تريد إغلاق هذه الدورة؟ لن تظهر مساراتها للمتقدمين بعد الإغلاق.',
      ),
    );
    if (!confirmed) {
      return;
    }

    this.runCycleAction(
      this.api.closeCycle(cycle.id),
      cycle.id,
      this.copy.text('Cycle closed successfully.', 'تم إغلاق الدورة بنجاح.'),
    );
  }

  protected trackName(trackId: string): string {
    return this.tracks().find((track) => track.id === trackId)?.name ?? trackId;
  }

  protected branchName(branchId: string): string {
    return this.branches().find((branch) => branch.id === branchId)?.name ?? branchId;
  }

  protected cycleStatusLabel(status: CycleStatus): string {
    switch (status) {
      case CycleStatus.Draft:
        return this.copy.text('Draft', 'مسودة');
      case CycleStatus.Active:
        return this.copy.text('Active', 'نشطة');
      case CycleStatus.Closed:
        return this.copy.text('Closed', 'مغلقة');
    }
  }

  protected formatDeadline(value: string): string {
    return new Intl.DateTimeFormat(this.copy.isRtl() ? 'ar-EG' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  private runCycleAction(
    operation: ReturnType<AdmissionAdminApiService['activateCycle']>,
    cycleId: string,
    successMessage: string,
  ): void {
    this.clearMessages();
    this.busy.set(true);
    operation
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.success.set(successMessage);
          this.load(cycleId);
        },
        error: (error: unknown) => this.showError(error, 'Unable to change cycle status.'),
      });
  }

  private clearMessages(): void {
    this.error.set(null);
    this.success.set(null);
  }

  private showError(error: unknown, fallbackEnglish: string): void {
    this.error.set(
      admissionAdminErrorMessage(
        error,
        this.copy.text(fallbackEnglish, 'تعذر إكمال العملية المطلوبة.'),
      ),
    );
  }
}
