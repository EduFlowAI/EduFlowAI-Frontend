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

  it('directs visitors to the API-backed official catalog without static track cards', () => {
    const fixture = TestBed.createComponent(LandingPage);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const catalogLink = root.querySelector<HTMLAnchorElement>(
      '.tracks-catalog-cta a',
    );

    expect(root.querySelector('.track-card')).toBeNull();
    expect(root.textContent).toContain('Browse the official track catalog');
    expect(root.textContent).toContain('only active-cycle offerings');
    expect(catalogLink?.getAttribute('href')).toBe('/tracks');
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
      'برنامج التدريب الاحترافي (PTP)',
    );
  });
});
