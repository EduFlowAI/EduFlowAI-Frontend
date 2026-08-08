import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AdmissionAdminCopy } from '../admission-admin.copy';
import { AdmissionAdminApiService } from '../data-access/admission-admin-api.service';
import {
  AdmissionCycleDto,
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
    getTracks: () => of([]),
    getBranches: () => of([]),
    getCycles: () => of(cycles),
  };

  const copy = {
    text: (english: string) => english,
    isRtl: () => false,
  };

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

  afterEach(() => TestBed.resetTestingModule());

  it('does not display unsaved defaults as a stored rule on an Active cycle', async () => {
    cycles = [cycle(CycleStatus.Active, null)];

    const fixture = await render();
    const host: HTMLElement = fixture.nativeElement;

    expect(host.textContent).toContain('Eligibility');
    expect(host.textContent).toContain('Missing');
    expect(host.textContent).toContain(
      'No eligibility rule is stored for this cycle.',
    );
    expect(
      host.querySelector('[formcontrolname="requiredNationality"]'),
    ).toBeNull();
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
    const save = host.querySelector(
      '[data-testid="save-eligibility"]',
    ) as HTMLButtonElement;
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
    const save = host.querySelector(
      '[data-testid="save-eligibility"]',
    ) as HTMLButtonElement;

    expect(host.textContent).toContain('No rule has been saved yet.');
    expect(save.disabled).toBe(false);
  });

  it('renders configuration in the same right-side workspace as the summary', async () => {
    cycles = [cycle(CycleStatus.Draft, null)];

    const fixture = await render();
    const host: HTMLElement = fixture.nativeElement;

    const workspace = host.querySelector('.cycle-workspace');
    const content = host.querySelector('.cycle-workspace__content');

    expect(workspace).not.toBeNull();
    expect(content?.textContent).toContain('Eligibility rule');
    expect(content?.textContent).toContain('Track / branch offerings');
  });
});
