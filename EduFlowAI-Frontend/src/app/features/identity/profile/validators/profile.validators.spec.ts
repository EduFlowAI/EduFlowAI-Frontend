import { FormControl } from '@angular/forms';

import {
  graduationYearValidator,
  notBlankValidator,
  pastDateValidator,
} from './profile.validators';

describe('profile validators', () => {
  it('rejects strings containing only whitespace', () => {
    const control = new FormControl('   ', {
      nonNullable: true,
      validators: [notBlankValidator()],
    });

    expect(control.hasError('required')).toBe(true);
  });

  it('requires date of birth to be before today', () => {
    const validator = pastDateValidator(new Date('2026-07-31T12:00:00Z'));
    const valid = new FormControl('2000-07-23', {
      nonNullable: true,
      validators: [validator],
    });
    const today = new FormControl('2026-07-31', {
      nonNullable: true,
      validators: [validator],
    });

    expect(valid.valid).toBe(true);
    expect(today.hasError('pastDate')).toBe(true);
  });

  it('enforces the backend graduation-year range', () => {
    const validator = graduationYearValidator(2026);
    const valid = new FormControl<number | null>(2023, validator);
    const future = new FormControl<number | null>(2027, validator);

    expect(valid.valid).toBe(true);
    expect(future.hasError('graduationYear')).toBe(true);
  });
});
