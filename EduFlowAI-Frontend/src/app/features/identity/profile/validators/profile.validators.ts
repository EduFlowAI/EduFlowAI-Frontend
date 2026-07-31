import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function notBlankValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    String(control.value ?? '').trim().length > 0
      ? null
      : { required: true };
}

export function pastDateValidator(today = new Date()): ValidatorFn {
  const maximum = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');

    if (!value) {
      return null;
    }

    const parsed = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed < maximum
      ? null
      : { pastDate: true };
  };
}

export function graduationYearValidator(
  currentYear = new Date().getUTCFullYear(),
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const year = control.value as number | null;

    if (year === null) {
      return null;
    }

    return Number.isInteger(year) && year >= 1900 && year <= currentYear
      ? null
      : { graduationYear: { min: 1900, max: currentYear } };
  };
}
