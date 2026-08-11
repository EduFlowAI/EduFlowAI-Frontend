import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { ApplicationsStore } from '../../data-access/applications.store';
import { TrackService } from '../../data-access/track.service';
import { TrackDto } from '../../models/track.model';
import { PreferenceSelectionPage } from './preference-selection-page';

describe('PreferenceSelectionPage', () => {
  let component: PreferenceSelectionPage;
  let fixture: ComponentFixture<PreferenceSelectionPage>;
  let getTracks: ReturnType<typeof vi.fn>;

  const officialTrack: TrackDto = {
    id: 'official-dotnet',
    programId: 'iti-9m',
    officialTrackId: 'cf198247-911f-4df1-a66e-70beb76cfc09',
    officialTrackUrl: 'https://iti.gov.eg/tracks/official-dotnet',
    isOfficialIntake47: true,
    intake: 47,
    year: 2026,
    name: '.NET Enterprise Solutions Development & Architecture Foundations with AI Integration',
    description: 'Official description',
    category: 'Software Engineering & Agentic AI Development',
    totalHours: 1313,
    minimumGrade: 'Good',
    eligibilitySummary: 'Official eligibility',
    graduationYearLimitYears: null,
    prerequisiteTopics: ['C#'],
    isActive: true,
    locations: [
      {
        branchId: 'alexandria',
        branchName: 'Alexandria',
        governorate: 'Alexandria',
      },
    ],
    offerings: [
      {
        offeringId: 'offering-1',
        branchId: 'alexandria',
        branchName: 'Alexandria',
        governorate: 'Alexandria',
        capacity: 40,
      },
    ],
  };

  beforeEach(async () => {
    const applicationDetails = signal({
      id: 'application-1',
      applicantUserId: 'applicant-1',
      cycleId: 'intake-47-cycle',
      cycleName: 'ITI Intake 47',
      cycleDeadlineUtc: '2026-12-31T20:00:00Z',
      status: 'Draft',
      createdAt: '2026-08-11T00:00:00Z',
      updatedAt: '2026-08-11T00:00:00Z',
      preferences: [],
    });
    const store = {
      applicationDetails,
      isLoading: signal(false),
      isExpired: signal(false),
      canEdit: signal(true),
      loadApplicationDetails: vi.fn(),
      updatePreferences: vi.fn(),
      submitApplication: vi.fn(),
    };
    getTracks = vi.fn(() =>
      of({
        isSuccess: true,
        data: [officialTrack],
        statusCode: 200,
        message: '',
      }),
    );

    await TestBed.configureTestingModule({
      imports: [PreferenceSelectionPage],
      providers: [
        { provide: ApplicationsStore, useValue: store },
        { provide: TrackService, useValue: { getTracks } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 'application-1' }),
            },
          },
        },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PreferenceSelectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('loads cycle-filtered official tracks and their selectable offerings', () => {
    expect(component).toBeTruthy();
    expect(getTracks).toHaveBeenCalledWith('intake-47-cycle');

    const root = fixture.nativeElement as HTMLElement;
    const selects = root.querySelectorAll<HTMLSelectElement>('select');
    const primaryTrack = selects[0];

    expect(primaryTrack.textContent).toContain(officialTrack.name);
    expect(primaryTrack.textContent).not.toContain(
      'Integrated Software Development & Architecture',
    );

    primaryTrack.value = officialTrack.id;
    primaryTrack.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(selects[1].textContent).toContain('Alexandria');
  });
});
