import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AdmissionAdminCopy } from '../admission-admin.copy';
import { AdmissionAdminApiService } from '../data-access/admission-admin-api.service';
import {
  AdmissionCycleDto,
  AdminTrackDto,
  BranchDto,
  CumulativeGrade,
  CycleStatus,
} from '../models/admission-admin.model';
import { CycleManagementPage } from './cycle-management-page';

const programId = '11111111-1111-1111-1111-111111111111';
const cycleId = '22222222-2222-2222-2222-222222222222';

function cycle(
  status: CycleStatus,
  eligibilityRule: AdmissionCycleDto['eligibilityRule'],
): AdmissionCycleDto {
  return {
    id: cycleId,
    programId,
    programName: '9-Months',
    label: 'Intake 46',
    startDate: '2026-08-16',
    deadlineUtc: '2026-09-15T20:00:00Z',
    status,
    closedAt: null,
    rowVersion: 1,
    eligibilityRule,
    offerings: [],
  };
}

describe('CycleManagementPage', () => {
  let cycles: AdmissionCycleDto[];
  let tracks: AdminTrackDto[];
  let branches: BranchDto[];

  const api = {
    getPrograms: () =>
      of([
        {
          id: programId,
          institutionId: '33333333-3333-3333-3333-333333333333',
          institutionName: 'ITI',
          name: '9-Months',
          code: '9M',
          durationMonths: 9,
          trackCount: 0,
          cycleCount: 1,
        },
      ]),
    getTracks: () => of(tracks),
    getBranches: () => of(branches),
    getCycles: () => of(cycles),
    deleteCycle: vi.fn((_cycleId: string) => of(true)),
  };

  const copy = {
    text: (english: string) => english,
    isRtl: () => false,
  };

  beforeEach(() => {
    tracks = [];
    branches = [];
    vi.clearAllMocks();
    api.deleteCycle.mockReturnValue(of(true));
  });

  async function render() {
    await TestBed.configureTestingModule({
      imports: [CycleManagementPage],
      providers: [
        provideRouter([]),
        { provide: AdmissionAdminApiService, useValue: api },
        { provide: AdmissionAdminCopy, useValue: copy },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CycleManagementPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  /** Click the Eligibility Rules sub-tab so its content is rendered. */
  function switchToEligibilityTab(host: HTMLElement): void {
    const tab = Array.from(host.querySelectorAll('.sub-tabs button')).find((btn) =>
      btn.textContent?.includes('Eligibility'),
    ) as HTMLElement;
    tab.click();
  }

  /** Click the first row in the cycles table to enter the detail view. */
  function selectFirstCycle(host: HTMLElement, fixture: { detectChanges(): void }): void {
    const row = host.querySelector('.cycles-table tbody tr') as HTMLElement;
    row.click();
    fixture.detectChanges();
  }

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('does not display unsaved defaults as a stored rule on an Active cycle', async () => {
    cycles = [cycle(CycleStatus.Active, null)];

    const fixture = await render();
    const host: HTMLElement = fixture.nativeElement;

    // Enter the detail view by clicking the first cycle row
    selectFirstCycle(host, fixture);

    // Overview tab should show Missing eligibility
    expect(host.textContent).toContain('Eligibility');
    expect(host.textContent).toContain('Missing');

    // Switch to eligibility tab to see the warning message
    switchToEligibilityTab(host);
    fixture.detectChanges();

    expect(host.textContent).toContain('No eligibility rule is stored for this cycle.');
    expect(host.querySelector('[formcontrolname="requiredNationality"]')).toBeNull();
  });

  it('keeps an existing Active-cycle eligibility rule read-only', async () => {
    cycles = [
      cycle(CycleStatus.Active, {
        id: '44444444-4444-4444-4444-444444444444',
        cycleId,
        requiredNationality: 'EG',
        requiredDegreeLevel: 'Bachelor',
        maxYearsSinceGraduation: 5,
        minGrade: CumulativeGrade.Good,
      }),
    ];

    const fixture = await render();
    const host: HTMLElement = fixture.nativeElement;

    // Enter the detail view, then switch to eligibility tab
    selectFirstCycle(host, fixture);
    switchToEligibilityTab(host);
    fixture.detectChanges();

    const nationality = host.querySelector(
      '[formcontrolname="requiredNationality"]',
    ) as HTMLInputElement;

    expect(nationality).not.toBeNull();
    expect(nationality.disabled).toBe(true);
    expect(host.textContent).toContain(
      'Eligibility configuration is read-only after the cycle is activated.',
    );
  });

  it('enables eligibility saving after a real edit on a Draft cycle', async () => {
    cycles = [
      cycle(CycleStatus.Draft, {
        id: '44444444-4444-4444-4444-444444444444',
        cycleId,
        requiredNationality: 'EG',
        requiredDegreeLevel: 'Bachelor',
        maxYearsSinceGraduation: 5,
        minGrade: CumulativeGrade.Good,
      }),
    ];

    const fixture = await render();
    const host: HTMLElement = fixture.nativeElement;

    // Enter the detail view, then switch to eligibility tab
    selectFirstCycle(host, fixture);
    switchToEligibilityTab(host);
    fixture.detectChanges();

    const save = host.querySelector('[data-testid="save-eligibility"]') as HTMLButtonElement;
    const nationality = host.querySelector(
      '[formcontrolname="requiredNationality"]',
    ) as HTMLInputElement;

    expect(nationality.disabled).toBe(false);
    expect(save.disabled).toBe(true);

    nationality.value = 'EGY';
    nationality.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(save.disabled).toBe(false);
  });

  it('allows saving default values when a Draft cycle has no rule yet', async () => {
    cycles = [cycle(CycleStatus.Draft, null)];

    const fixture = await render();
    const host: HTMLElement = fixture.nativeElement;

    // Enter the detail view, then switch to eligibility tab
    selectFirstCycle(host, fixture);
    switchToEligibilityTab(host);
    fixture.detectChanges();

    const save = host.querySelector('[data-testid="save-eligibility"]') as HTMLButtonElement;

    expect(host.textContent).toContain('No rule has been saved yet.');
    expect(save.disabled).toBe(false);
  });

  it('renders a cycles table in list view and detail with sub-tabs when a cycle is selected', async () => {
    cycles = [cycle(CycleStatus.Draft, null)];

    const fixture = await render();
    const host: HTMLElement = fixture.nativeElement;

    // Page now starts on the list view — table should be immediately visible
    const table = host.querySelector('.cycles-table');
    expect(table).not.toBeNull();

    // Click the first row to enter the detail view
    selectFirstCycle(host, fixture);

    // Detail view: back button, sub-tabs, and cycle-detail should appear
    const detail = host.querySelector('.cycle-detail');
    const subTabs = host.querySelector('.sub-tabs');
    expect(detail).not.toBeNull();
    expect(subTabs).not.toBeNull();

    // Switch to Eligibility tab
    switchToEligibilityTab(host);
    fixture.detectChanges();

    expect(host.textContent).toContain('Eligibility rule');
    expect(host.textContent).toContain('No rule has been saved yet.');
  });

  it('offers only canonical locations for an official Intake 47 track', async () => {
    cycles = [cycle(CycleStatus.Draft, null)];
    branches = [
      {
        id: 'alexandria',
        name: 'Alexandria',
        governorate: 'Alexandria',
        isActive: true,
        isOfficialIntake47Location: true,
      },
      {
        id: 'smart-village',
        name: 'Smart Village',
        governorate: 'Giza',
        isActive: true,
        isOfficialIntake47Location: true,
      },
    ];
    tracks = [
      {
        id: 'official-track',
        programId,
        officialTrackId: 'cf198247-911f-4df1-a66e-70beb76cfc09',
        officialTrackUrl: 'https://iti.gov.eg/tracks/official-track',
        isOfficialIntake47: true,
        intake: 47,
        year: 2026,
        name: 'Official track',
        description: 'Description',
        category: 'Category',
        totalHours: 1200,
        minimumGrade: 'Good',
        eligibilitySummary: 'Eligibility',
        graduationYearLimitYears: null,
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
    ];

    const fixture = await render();
    const host: HTMLElement = fixture.nativeElement;
    selectFirstCycle(host, fixture);

    const offeringsTab = Array.from(host.querySelectorAll('.sub-tabs button')).find((button) =>
      button.textContent?.includes('Track & Branch'),
    ) as HTMLElement;
    offeringsTab.click();
    fixture.detectChanges();

    const branchSelect = host.querySelector('#offering-branch') as HTMLSelectElement;
    const optionLabels = Array.from(branchSelect.options).map((option) => option.text.trim());

    expect(optionLabels).toEqual(['Select branch', 'Smart Village']);
    expect(branchSelect.value).toBe('smart-village');
  });

  it('shows Delete only for a Draft cycle', async () => {
    cycles = [cycle(CycleStatus.Draft, null)];

    const draftFixture = await render();
    const draftHost: HTMLElement = draftFixture.nativeElement;
    selectFirstCycle(draftHost, draftFixture);
    expect(draftHost.querySelector('[data-testid="delete-cycle"]')).not.toBeNull();

    TestBed.resetTestingModule();
    cycles = [cycle(CycleStatus.Active, null)];
    const activeFixture = await render();
    const activeHost: HTMLElement = activeFixture.nativeElement;
    selectFirstCycle(activeHost, activeFixture);
    expect(activeHost.querySelector('[data-testid="delete-cycle"]')).toBeNull();

    TestBed.resetTestingModule();
    cycles = [cycle(CycleStatus.Closed, null)];
    const closedFixture = await render();
    const closedHost: HTMLElement = closedFixture.nativeElement;
    selectFirstCycle(closedHost, closedFixture);
    expect(closedHost.querySelector('[data-testid="delete-cycle"]')).toBeNull();
  });

  it('requires confirmation and cancel does not call the delete API', async () => {
    cycles = [cycle(CycleStatus.Draft, null)];
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

    const fixture = await render();
    const host: HTMLElement = fixture.nativeElement;
    selectFirstCycle(host, fixture);

    (host.querySelector('[data-testid="delete-cycle"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(confirm).toHaveBeenCalledOnce();
    expect(confirm.mock.calls[0]?.[0]).toContain('Delete "Intake 46"?');
    expect(confirm.mock.calls[0]?.[0]).toContain('cannot be undone');
    expect(api.deleteCycle).not.toHaveBeenCalled();
    expect(host.querySelector('.cycle-detail')).not.toBeNull();
  });

  it('confirmed deletion calls the correct cycle and removes it from the list', async () => {
    cycles = [cycle(CycleStatus.Draft, null)];
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const fixture = await render();
    const host: HTMLElement = fixture.nativeElement;
    selectFirstCycle(host, fixture);

    (host.querySelector('[data-testid="delete-cycle"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(api.deleteCycle).toHaveBeenCalledTimes(1);
    expect(api.deleteCycle).toHaveBeenCalledWith(cycleId);
    expect(host.querySelector('.cycle-detail')).toBeNull();
    expect(host.querySelector('.cycles-table')).toBeNull();
    expect(host.textContent).toContain('Draft cycle deleted successfully.');
    expect(host.textContent).toContain('No admission cycles are configured.');
  });

  it('shows the backend rejection safely and keeps the Draft cycle selected', async () => {
    cycles = [cycle(CycleStatus.Draft, null)];
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    api.deleteCycle.mockReturnValueOnce(
      throwError(
        () =>
          new Error(
            'Admission cycle cannot be deleted because admission activity already exists for this cycle.',
          ),
      ),
    );

    const fixture = await render();
    const host: HTMLElement = fixture.nativeElement;
    selectFirstCycle(host, fixture);

    (host.querySelector('[data-testid="delete-cycle"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(api.deleteCycle).toHaveBeenCalledWith(cycleId);
    expect(host.querySelector('.cycle-detail')).not.toBeNull();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      'Admission cycle cannot be deleted because admission activity already exists for this cycle.',
    );
  });
});
