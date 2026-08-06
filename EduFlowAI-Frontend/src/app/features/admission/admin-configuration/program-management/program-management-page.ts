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
  DocumentType,
  InstitutionDto,
  ProgramDocumentRequirementInput,
  ProgramDto,
  RequirementGender,
} from '../models/admission-admin.model';
import { admissionAdminErrorMessage } from '../utils/admission-admin-error.util';

@Component({
  selector: 'app-program-management-page',
  imports: [ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './program-management-page.html',
  styleUrl: '../admin-management.scss',
})
export class ProgramManagementPage implements OnInit {
  protected readonly copy = inject(AdmissionAdminCopy);
  protected readonly DocumentType = DocumentType;
  protected readonly RequirementGender = RequirementGender;

  private readonly api = inject(AdmissionAdminApiService);
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  private readonly destroyRef = inject(DestroyRef);

  protected readonly institutions = signal<readonly InstitutionDto[]>([]);
  protected readonly programs = signal<readonly ProgramDto[]>([]);
  protected readonly requirements = signal<ProgramDocumentRequirementInput[]>([]);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly editingInstitutionId = signal<string | null>(null);
  protected readonly editingProgramId = signal<string | null>(null);
  protected readonly requirementsProgramId = signal<string>('');

  protected readonly selectedRequirementsProgram = computed(() =>
    this.programs().find(
      (program) => program.id === this.requirementsProgramId(),
    ) ?? null,
  );

  protected readonly documentTypes = [
    { value: DocumentType.NationalId, en: 'National ID', ar: 'بطاقة الرقم القومي' },
    { value: DocumentType.BirthCertificate, en: 'Birth certificate', ar: 'شهادة الميلاد' },
    {
      value: DocumentType.GraduationCertificate,
      en: 'Graduation certificate',
      ar: 'شهادة التخرج',
    },
    {
      value: DocumentType.MilitaryCertificate,
      en: 'Military certificate',
      ar: 'شهادة الموقف من التجنيد',
    },
  ] as const;

  protected readonly genders = [
    { value: null, en: 'All genders', ar: 'جميع المتقدمين' },
    { value: RequirementGender.Male, en: 'Male only', ar: 'ذكور فقط' },
    { value: RequirementGender.Female, en: 'Female only', ar: 'إناث فقط' },
  ] as const;

  protected readonly institutionForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    code: ['', [Validators.required, Validators.maxLength(20)]],
  });

  protected readonly programForm = this.formBuilder.group({
    institutionId: ['', Validators.required],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    code: ['', [Validators.required, Validators.maxLength(30)]],
    durationMonths: [9, [Validators.required, Validators.min(1), Validators.max(60)]],
  });

  protected readonly requirementForm = this.formBuilder.group({
    documentType: [DocumentType.NationalId, Validators.required],
    requiredForGender: this.formBuilder.control<RequirementGender | null>(null),
  });

  ngOnInit(): void {
    this.loadReferenceData();
  }

  protected loadReferenceData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      institutions: this.api.getInstitutions(),
      programs: this.api.getPrograms(),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ institutions, programs }) => {
          this.institutions.set(institutions);
          this.programs.set(programs);

          if (!this.programForm.controls.institutionId.value && institutions[0]) {
            this.programForm.controls.institutionId.setValue(institutions[0].id);
          }

          if (!this.requirementsProgramId() && programs[0]) {
            this.selectRequirementsProgram(programs[0].id, false);
          }
        },
        error: (error: unknown) => this.showError(error, 'Unable to load programs.'),
      });
  }

  protected saveInstitution(): void {
    this.clearMessages();

    if (this.institutionForm.invalid) {
      this.institutionForm.markAllAsTouched();
      return;
    }

    const value = this.institutionForm.getRawValue();
    const request = {
      name: value.name.trim(),
      code: value.code.trim().toUpperCase(),
    };
    const editingId = this.editingInstitutionId();
    const operation = editingId
      ? this.api.updateInstitution(editingId, request)
      : this.api.createInstitution(request);

    this.busy.set(true);
    operation
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.success.set(
            this.copy.text('Institution saved successfully.', 'تم حفظ المؤسسة بنجاح.'),
          );
          this.resetInstitutionForm();
          this.loadReferenceData();
        },
        error: (error: unknown) => this.showError(error, 'Unable to save institution.'),
      });
  }

  protected editInstitution(institution: InstitutionDto): void {
    this.clearMessages();
    this.editingInstitutionId.set(institution.id);
    this.institutionForm.setValue({
      name: institution.name,
      code: institution.code,
    });
  }

  protected resetInstitutionForm(): void {
    this.editingInstitutionId.set(null);
    this.institutionForm.reset({ name: '', code: '' });
  }

  protected saveProgram(): void {
    this.clearMessages();

    if (this.programForm.invalid) {
      this.programForm.markAllAsTouched();
      return;
    }

    const value = this.programForm.getRawValue();
    const editingId = this.editingProgramId();
    const operation = editingId
      ? this.api.updateProgram(editingId, {
          name: value.name.trim(),
          code: value.code.trim().toUpperCase(),
          durationMonths: value.durationMonths,
        })
      : this.api.createProgram({
          institutionId: value.institutionId,
          name: value.name.trim(),
          code: value.code.trim().toUpperCase(),
          durationMonths: value.durationMonths,
        });

    this.busy.set(true);
    operation
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.success.set(
            this.copy.text('Program saved successfully.', 'تم حفظ البرنامج بنجاح.'),
          );
          this.resetProgramForm();
          this.loadReferenceData();
        },
        error: (error: unknown) => this.showError(error, 'Unable to save program.'),
      });
  }

  protected editProgram(program: ProgramDto): void {
    this.clearMessages();
    this.editingProgramId.set(program.id);
    this.programForm.setValue({
      institutionId: program.institutionId,
      name: program.name,
      code: program.code,
      durationMonths: program.durationMonths,
    });
  }

  protected deleteProgram(program: ProgramDto): void {
    this.clearMessages();

    const confirmed = window.confirm(
      this.copy.text(
        `Delete ${program.name}? This also deletes its tracks, cycles, offerings, eligibility rules, and document requirements. This cannot be undone.`,
        `هل تريد حذف برنامج ${program.name}؟ سيتم أيضًا حذف المسارات والدورات والعروض وقواعد الأهلية ومتطلبات المستندات التابعة له. لا يمكن التراجع عن هذا الإجراء.`,
      ),
    );
    if (!confirmed) {
      return;
    }

    this.busy.set(true);
    this.api
      .deleteProgram(program.id)
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          if (this.editingProgramId() === program.id) {
            this.resetProgramForm();
          }

          if (this.requirementsProgramId() === program.id) {
            this.requirementsProgramId.set('');
            this.requirements.set([]);
          }

          this.success.set(
            this.copy.text(
              'Program and its configuration data were deleted successfully.',
              'تم حذف البرنامج وكل بيانات الإعداد التابعة له بنجاح.',
            ),
          );
          this.loadReferenceData();
        },
        error: (error: unknown) => this.showError(error, 'Unable to delete program.'),
      });
  }

  protected resetProgramForm(): void {
    this.editingProgramId.set(null);
    this.programForm.reset({
      institutionId: this.institutions()[0]?.id ?? '',
      name: '',
      code: '',
      durationMonths: 9,
    });
  }

  protected onRequirementsProgramChange(event: Event): void {
    this.selectRequirementsProgram((event.target as HTMLSelectElement).value);
  }

  protected selectRequirementsProgram(
    programId: string,
    clearMessages = true,
  ): void {
    if (clearMessages) {
      this.clearMessages();
    }

    this.requirementsProgramId.set(programId);
    this.requirements.set([]);

    if (!programId) {
      return;
    }

    this.busy.set(true);
    this.api
      .getProgramRequirements(programId)
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (requirements) =>
          this.requirements.set(
            requirements.map((requirement) => ({
              documentType: requirement.documentType,
              requiredForGender: requirement.requiredForGender,
            })),
          ),
        error: (error: unknown) => this.showError(error, 'Unable to load requirements.'),
      });
  }

  protected addRequirement(): void {
    const value = this.requirementForm.getRawValue();
    const duplicate = this.requirements().some(
      (requirement) =>
        requirement.documentType === value.documentType &&
        requirement.requiredForGender === value.requiredForGender,
    );

    if (duplicate) {
      this.error.set(
        this.copy.text(
          'That document and gender combination already exists.',
          'تمت إضافة نفس المستند ونوع المتقدم من قبل.',
        ),
      );
      return;
    }

    if (this.requirements().length >= 12) {
      this.error.set(
        this.copy.text(
          'A program can contain at most 12 requirement combinations.',
          'يمكن أن يحتوي البرنامج على 12 مجموعة متطلبات بحد أقصى.',
        ),
      );
      return;
    }

    this.clearMessages();
    this.requirements.update((requirements) => [...requirements, value]);
  }

  protected removeRequirement(index: number): void {
    this.requirements.update((requirements) =>
      requirements.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  protected saveRequirements(): void {
    this.clearMessages();
    const programId = this.requirementsProgramId();

    if (!programId || this.requirements().length === 0) {
      this.error.set(
        this.copy.text(
          'Select a program and add at least one requirement.',
          'اختر برنامجًا وأضف مستندًا مطلوبًا واحدًا على الأقل.',
        ),
      );
      return;
    }

    this.busy.set(true);
    this.api
      .updateProgramRequirements(programId, {
        requirements: this.requirements(),
      })
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (requirements) => {
          this.requirements.set(
            requirements.map((requirement) => ({
              documentType: requirement.documentType,
              requiredForGender: requirement.requiredForGender,
            })),
          );
          this.success.set(
            this.copy.text(
              'Document requirements saved successfully.',
              'تم حفظ المستندات المطلوبة بنجاح.',
            ),
          );
        },
        error: (error: unknown) => this.showError(error, 'Unable to save requirements.'),
      });
  }

  protected documentTypeLabel(documentType: DocumentType): string {
    const option = this.documentTypes.find((item) => item.value === documentType);
    return option
      ? this.copy.text(option.en, option.ar)
      : String(documentType);
  }

  protected genderLabel(gender: RequirementGender | null): string {
    const option = this.genders.find((item) => item.value === gender);
    return option ? this.copy.text(option.en, option.ar) : '';
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
