import { AppLocale } from '../../../core/i18n/locale.store';

export interface ProgramDto {
  readonly id?: string | number;
  readonly programId?: string | number;
  readonly code?: string;
  readonly programCode?: string;
  readonly name?: string;
  readonly title?: string;
  readonly programName?: string;
  readonly nameAr?: string;
  readonly titleAr?: string;
  readonly programNameAr?: string;
  readonly description?: string;
  readonly summary?: string;
  readonly descriptionAr?: string;
  readonly summaryAr?: string;
  readonly durationInMonths?: number;
  readonly durationMonths?: number;
  readonly months?: number;
  readonly duration?: string;
  readonly durationLabel?: string;
  readonly durationValue?: string | number;
  readonly durationUnit?: string;
  readonly durationUnitAr?: string;
  readonly tracksCount?: number;
  readonly numberOfTracks?: number;
  readonly locations?: string;
  readonly location?: string;
  readonly locationsAr?: string;
  readonly locationAr?: string;
  readonly isActive?: boolean;
  readonly detailsUrl?: string;
  readonly applicationUrl?: string;
  readonly applyUrl?: string;
}

export type ProgramsApiResponse =
  | readonly ProgramDto[]
  | {
      readonly items?: readonly ProgramDto[];
      readonly data?: readonly ProgramDto[];
      readonly value?: readonly ProgramDto[];
    };

export interface Program {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly nameAr: string;
  readonly description: string;
  readonly descriptionAr: string;
  readonly durationValue: string;
  readonly durationUnit: string;
  readonly durationUnitAr: string;
  readonly tracksCount: number | null;
  readonly locations: string;
  readonly locationsAr: string;
  readonly isActive: boolean;
}

export function extractPrograms(response: ProgramsApiResponse): readonly ProgramDto[] {
  if (Array.isArray(response)) {
    return response;
  }

  const wrapped = response as Exclude<ProgramsApiResponse, readonly ProgramDto[]>;
  return wrapped.items ?? wrapped.data ?? wrapped.value ?? [];
}

export function normalizeProgram(program: ProgramDto, index: number): Program {
  const durationInMonths = program.durationInMonths ?? program.durationMonths ?? program.months;
  const rawDuration = program.duration ?? program.durationLabel;
  let durationValue = String(program.durationValue ?? durationInMonths ?? '');
  let durationUnit = program.durationUnit ?? 'Months';

  if (!durationValue && rawDuration) {
    const match = rawDuration.trim().match(/^(\d+)\s*(.*)$/);
    durationValue = match?.[1] ?? rawDuration;
    durationUnit = match?.[2] || 'Duration';
  }

  const name = program.name ?? program.title ?? program.programName ?? 'ITI Program';
  const description = program.description ?? program.summary ?? '';
  const locations = program.locations ?? program.location ?? 'ITI branches';

  return {
    id: String(program.id ?? program.programId ?? index),
    code: program.code ?? program.programCode ?? `PROGRAM-${index + 1}`,
    name,
    nameAr: program.nameAr ?? program.titleAr ?? program.programNameAr ?? name,
    description,
    descriptionAr: program.descriptionAr ?? program.summaryAr ?? description,
    durationValue,
    durationUnit,
    durationUnitAr: program.durationUnitAr ?? (/^months?$/i.test(durationUnit) ? 'أشهر' : ''),
    tracksCount: program.tracksCount ?? program.numberOfTracks ?? null,
    locations,
    locationsAr: program.locationsAr ?? program.locationAr ?? locations,
    isActive: program.isActive === true,
  };
}

export function localizedProgramName(program: Program, locale: AppLocale): string {
  return locale === 'ar' ? program.nameAr || program.name : program.name;
}

export function localizedProgramDescription(program: Program, locale: AppLocale): string {
  return locale === 'ar' ? program.descriptionAr || program.description : program.description;
}

export function localizedProgramLocations(program: Program, locale: AppLocale): string {
  return locale === 'ar' ? program.locationsAr || program.locations : program.locations;
}
