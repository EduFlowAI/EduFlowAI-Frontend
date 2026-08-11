import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { TrackCatalogService } from '../../../../admission/catalog/data-access/track-catalog.service';
import { TrackCatalogItem } from '../../../../admission/catalog/models/track-catalog.model';
import { AssistantApiService } from '../../services/assistant-api.service';
import { AssistantPage } from './assistant-page';

describe('AssistantPage', () => {
  let component: AssistantPage;
  let fixture: ComponentFixture<AssistantPage>;
  let tracks: Record<string, TrackCatalogItem>;
  let getTrack: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    tracks = {
      industrial: {
        id: 'industrial',
        programId: 'nine-month',
        officialTrackId: '59d2e6c7-7221-4024-fe29-08dbe75ac461',
        officialTrackUrl: 'https://iti.gov.eg/tracks/industrial',
        isOfficialIntake47: true,
        intake: 47,
        year: 2026,
        name: 'Industrial Automation',
        description: 'Official industrial automation description.',
        category: 'Industrial Systems',
        totalHours: null,
        minimumGrade: 'Good',
        eligibilitySummary: 'Graduation Year: Last 5 years. Grade: Good.',
        graduationYearLimitYears: 5,
        prerequisiteTopics: [],
        isActive: true,
        locations: [
          {
            branchId: 'smart-village',
            branchName: 'Smart Village',
            governorate: 'Giza',
          },
        ],
        offerings: [],
      },
      dotnet: {
        id: 'dotnet',
        programId: 'nine-month',
        officialTrackId: 'official-dotnet',
        officialTrackUrl: 'https://iti.gov.eg/tracks/dotnet',
        isOfficialIntake47: true,
        intake: 47,
        year: 2026,
        name: '.NET Enterprise Solutions Development & Architecture Foundations with AI Integration',
        description: 'Official .NET track description.',
        category: 'Software Engineering & Agentic AI Development',
        totalHours: 1329,
        minimumGrade: 'Good',
        eligibilitySummary: 'Open to university graduates.',
        graduationYearLimitYears: null,
        prerequisiteTopics: ['C#'],
        isActive: true,
        locations: [
          {
            branchId: 'assiut',
            branchName: 'Assiut',
            governorate: 'Assiut',
          },
          {
            branchId: 'alexandria',
            branchName: 'Alexandria',
            governorate: 'Alexandria',
          },
        ],
        offerings: [],
      },
    };
    getTrack = vi.fn((trackId: string) => of(tracks[trackId]));

    await TestBed.configureTestingModule({
      imports: [AssistantPage],
      providers: [
        {
          provide: AssistantApiService,
          useValue: { sendMessage: vi.fn() },
        },
        {
          provide: TrackCatalogService,
          useValue: { getTrack },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssistantPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('compares official metadata, nullable hours, and canonical locations', () => {
    const recommendations = [
      {
        trackId: 'industrial',
        trackName: 'Industrial Automation',
        rank: 1,
        reason: 'Matches automation interests.',
      },
      {
        trackId: 'dotnet',
        trackName: tracks['dotnet'].name,
        rank: 2,
        reason: 'Matches enterprise development interests.',
      },
    ];

    component.latestRecommendedTracks.set(recommendations);
    component.selectedComparisonTracks.set(recommendations);
    component.openComparison();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(getTrack).toHaveBeenCalledTimes(2);
    expect(text).toContain('Industrial Automation');
    expect(text).toContain('Not published');
    expect(text).toContain('Within the last 5 years');
    expect(text).toContain('Smart Village');
    expect(text).toContain(tracks['dotnet'].name);
    expect(text).toContain('1,329 hours');
    expect(text).toContain('Alexandria');
    expect(text).toContain('No active-cycle capacity configured.');
  });
});
