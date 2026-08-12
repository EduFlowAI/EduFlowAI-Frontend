import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleStore } from '../../../../core/i18n/locale.store';
import { LandingPage } from './landing-page';

describe('LandingPage', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [LandingPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(LocaleStore).setLocale('en');
    localStorage.clear();
  });

  it('renders the static program catalog with highlights and eligibility', () => {
    const fixture = TestBed.createComponent(LandingPage);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const cards = root.querySelectorAll('.program-card');

    expect(cards).toHaveLength(2);
    expect(cards[0]?.querySelector('h3')?.textContent?.trim()).toBe(
      'Professional Training Program (9 Months)',
    );
    expect(cards[0]?.querySelectorAll('.program-highlight')).toHaveLength(4);
    expect(cards[0]?.querySelectorAll('.program-eligibility-list > div')).toHaveLength(6);
    const eligibility = cards[0]?.querySelector<HTMLDetailsElement>('.program-eligibility');
    expect(eligibility?.open).toBe(false);
    expect(cards[0]?.querySelector('.program-card-footer')).toBeNull();
    expect(root.querySelector('.programs-state')).toBeNull();
  });

  it('combines category filtering with the localized search state', () => {
    const fixture = TestBed.createComponent(LandingPage);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.setActiveFilter('data');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.track-card')).toHaveLength(1);

    component.trackSearch.set('not-a-real-track');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.empty-state')).not.toBeNull();
  });

  it('shows track prerequisites as tags without requirement accordions', () => {
    const fixture = TestBed.createComponent(LandingPage);
    fixture.detectChanges();

    const firstTrack = (fixture.nativeElement as HTMLElement).querySelector('.track-card');
    const tags = Array.from(firstTrack?.querySelectorAll('.tag') ?? []).map((tag) =>
      tag.textContent?.trim(),
    );

    expect(tags).toEqual(['Programming fundamentals', 'Logical problem solving']);
    expect(firstTrack?.querySelector('.track-toggle')).toBeNull();
    expect(firstTrack?.querySelector('.track-footer')).toBeNull();
    const durations = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.track-meta span:first-child'),
    ).map((duration) => duration.textContent?.replace(/\s+/g, ' ').trim());
    expect(durations.some((duration) => duration?.includes('9 months'))).toBe(true);
    expect(durations.some((duration) => duration?.includes('4 months'))).toBe(true);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.tracks-note')?.textContent?.trim(),
    ).toBe('Available tracks vary by program and by the branches offering each program.');
  });

  it('reuses persisted locale state and scopes the persisted theme to the page', () => {
    const fixture = TestBed.createComponent(LandingPage);
    fixture.detectChanges();

    fixture.componentInstance.toggleLocale();
    fixture.componentInstance.toggleTheme();
    fixture.detectChanges();

    const root = (fixture.nativeElement as HTMLElement).querySelector('.landing-page');
    expect(document.documentElement.dir).toBe('rtl');
    expect(localStorage.getItem('eduflow.locale')).toBe('ar');
    expect(localStorage.getItem('iti-theme')).toBe('dark');
    expect(root?.getAttribute('data-theme')).toBe('dark');
    expect(root?.querySelector('.program-card h3')?.textContent?.trim()).toBe(
      'برنامج التدريب الاحترافي (9 أشهر)',
    );
  });
});
