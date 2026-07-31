import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocaleStore } from '../../../../../core/i18n/locale.store';
import { ProfileStore } from '../../data-access/profile.store';
import {
  ApplicantProfile,
  ProfileFieldName,
  UpdateApplicantProfileRequest,
} from '../../models/profile.model';
import { ProfilePage } from './profile-page';

const lockedProfile: ApplicantProfile = {
  userId: 'user-1',
  email: 'applicant@example.com',
  phoneNumber: '01282538431',
  preferredLanguage: 'en',
  gmailNotificationsEnabled: true,
  isComplete: true,
  isProfileLocked: true,
  fullNameEn: 'Karim Ramadan',
  fullNameAr: 'كريم رمضان',
  nationalId: '30009060201856',
  nationality: 'EGY',
  dateOfBirth: '2000-07-23',
  gender: 'Male',
  address: 'Cairo',
  governorate: 'Cairo',
  university: 'Cairo University',
  faculty: 'Engineering',
  degreeLevel: 'Bachelor',
  major: 'Computer Engineering',
  graduationYear: 2023,
  cumulativeGrade: 'VeryGood',
  militaryStatus: 'Completed',
  createdAt: '2026-07-01T00:00:00Z',
  updatedAt: '2026-07-30T00:00:00Z',
};

describe('ProfilePage', () => {
  let fixture: ComponentFixture<ProfilePage>;
  let component: ProfilePage;
  let save: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    save = vi.fn();
    const validationErrors = signal<
      Partial<Record<ProfileFieldName, string[]>>
    >({});
    const profile = signal<ApplicantProfile | null>(lockedProfile);
    const store = {
      profile,
      isLoading: signal(false),
      isSaving: signal(false),
      hasLoaded: signal(true),
      loadError: signal<string | null>(null),
      saveError: signal<string | null>(null),
      validationErrors,
      savedAt: signal<number | null>(null),
      isComplete: signal(true),
      isLocked: signal(true),
      load: vi.fn(),
      save,
      clearFieldError: vi.fn(),
      clearSaveFeedback: vi.fn(),
    };
    const locale = {
      locale: signal<'en' | 'ar'>('en'),
      setLocale: vi.fn(),
      toggle: vi.fn(),
      t: (key: string) => key,
    };

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        { provide: ProfileStore, useValue: store },
        { provide: LocaleStore, useValue: locale },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the locked profile presentation', () => {
    expect(component).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('.locked-banner'),
    ).not.toBeNull();
  });

  it('disables protected fields but leaves contact fields editable', () => {
    expect(component.form.controls.nationalId.disabled).toBe(true);
    expect(component.form.controls.university.disabled).toBe(true);
    expect(component.form.controls.phoneNumber.enabled).toBe(true);
    expect(component.form.controls.address.enabled).toBe(true);
  });

  it('submits locked fields unchanged through getRawValue', () => {
    component.form.controls.phoneNumber.setValue('01000000000');

    component.submit();

    expect(save).toHaveBeenCalledOnce();
    const request = save.mock.calls[0][0] as UpdateApplicantProfileRequest;
    expect(request.nationalId).toBe(lockedProfile.nationalId);
    expect(request.university).toBe(lockedProfile.university);
    expect(request.phoneNumber).toBe('01000000000');
  });

  it('shows validation feedback for editable locked contact fields', () => {
    component.form.controls.address.setValue('x'.repeat(2001));
    component.form.controls.address.markAsTouched();

    component.submit();
    fixture.detectChanges();

    expect(save).not.toHaveBeenCalled();
    expect(component.fieldMessages('address')).toContain(
      'This value is too long.',
    );
    expect(
      fixture.nativeElement.querySelector('#locked-address')?.getAttribute(
        'aria-invalid',
      ),
    ).toBe('true');
  });
});
