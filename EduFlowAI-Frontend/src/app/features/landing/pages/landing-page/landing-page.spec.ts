import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ReplaySubject } from 'rxjs';

import { LocaleStore } from '../../../../core/i18n/locale.store';
import { ProgramsApi } from '../../data-access/programs.api';
import { Program } from '../../models/program.model';
import { LandingPage } from './landing-page';

const programs: readonly Program[] = [
  {
    id: 'program-1',
    code: 'PTP-9M',
    name: '9-Month Professional Training Program',
    nameAr: 'برنامج التدريب الاحترافي لمدة 9 أشهر',
    description: 'Intensive career-focused specialization.',
    descriptionAr: 'تخصص مهني مكثف.',
    durationValue: '9',
    durationUnit: 'Months',
    durationUnitAr: 'أشهر',
    tracksCount: 6,
    locations: 'Multiple branches',
    locationsAr: 'فروع متعددة',
    isActive: true,
  },
  {
    id: 'program-2',
    code: 'ICC-4M',
    name: '4-Month Intensive Training Program',
    nameAr: 'برنامج التدريب المكثف لمدة 4 أشهر',
    description: 'Focused practical training.',
    descriptionAr: 'تدريب عملي مركز.',
    durationValue: '4',
    durationUnit: 'Months',
    durationUnitAr: 'أشهر',
    tracksCount: 4,
    locations: 'Selected branches',
    locationsAr: 'فروع محددة',
    isActive: false,
  },
];

describe('LandingPage', () => {
  let programsSubject: ReplaySubject<readonly Program[]>;

  beforeEach(async () => {
    localStorage.clear();
    programsSubject = new ReplaySubject<readonly Program[]>(1);

    await TestBed.configureTestingModule({
      imports: [LandingPage],
      providers: [
        provideRouter([]),
        {
          provide: ProgramsApi,
          useValue: { getPrograms: () => programsSubject.asObservable() },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(LocaleStore).setLocale('en');
    localStorage.clear();
  });

  it('renders live program availability and disables closed applications', () => {
    const fixture = TestBed.createComponent(LandingPage);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('.programs-grid')
        ?.getAttribute('aria-busy'),
    ).toBe('true');

    programsSubject.next(programs);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('.program-card')).toHaveLength(2);
    expect(root.querySelectorAll('.program-card.is-active')).toHaveLength(1);
    expect(root.querySelector<HTMLButtonElement>('.program-card button:disabled')).not.toBeNull();
  });

  it('combines category filtering with the localized search state', () => {
    const fixture = TestBed.createComponent(LandingPage);
    programsSubject.next(programs);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.setActiveFilter('data');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.track-card')).toHaveLength(1);

    component.trackSearch.set('not-a-real-track');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.empty-state')).not.toBeNull();
  });

  it('keeps track accordions independent', () => {
    const fixture = TestBed.createComponent(LandingPage);
    programsSubject.next(programs);
    fixture.detectChanges();

    fixture.componentInstance.toggleTrack('fullstack');
    fixture.componentInstance.toggleTrack('data-ai');
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.track-card.open'),
    ).toHaveLength(2);
  });

  it('reuses persisted locale state and scopes the persisted theme to the page', () => {
    const fixture = TestBed.createComponent(LandingPage);
    programsSubject.next(programs);
    fixture.detectChanges();

    fixture.componentInstance.toggleLocale();
    fixture.componentInstance.toggleTheme();
    fixture.detectChanges();

    const root = (fixture.nativeElement as HTMLElement).querySelector('.landing-page');
    expect(document.documentElement.dir).toBe('rtl');
    expect(localStorage.getItem('eduflow.locale')).toBe('ar');
    expect(localStorage.getItem('iti-theme')).toBe('dark');
    expect(root?.getAttribute('data-theme')).toBe('dark');
  });
});
