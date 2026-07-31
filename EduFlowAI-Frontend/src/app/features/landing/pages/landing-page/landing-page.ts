import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { LocaleStore } from '../../../../core/i18n/locale.store';
import { ProgramsApi } from '../../data-access/programs.api';
import {
  localizedProgramDescription,
  localizedProgramLocations,
  localizedProgramName,
  Program,
} from '../../models/program.model';

type Theme = 'light' | 'dark';
type ProgramsStatus = 'loading' | 'loaded' | 'error';
type TrackCategory = 'software' | 'data' | 'design' | 'infrastructure';
type TrackFilter = 'all' | TrackCategory;

interface TrackDefinition {
  readonly id: string;
  readonly category: TrackCategory;
  readonly categoryKey: string;
  readonly nameKey: string;
  readonly descriptionKey: string;
  readonly locationKey: string;
  readonly tagKeys: readonly string[];
  readonly requirementKeys: readonly string[];
  readonly isAi: boolean;
}

const THEME_STORAGE_KEY = 'iti-theme';

const TRACKS: readonly TrackDefinition[] = [
  {
    id: 'fullstack',
    category: 'software',
    categoryKey: 'landing.tracks.software',
    nameKey: 'landing.tracks.fullstack',
    descriptionKey: 'landing.tracks.fullstackCopy',
    locationKey: 'landing.tracks.threeBranches',
    tagKeys: ['landing.tracks.tags.computerScience', 'landing.tracks.tags.engineering'],
    requirementKeys: ['landing.tracks.req.programming', 'landing.tracks.req.problemSolving'],
    isAi: false,
  },
  {
    id: 'data-ai',
    category: 'data',
    categoryKey: 'landing.tracks.dataAi',
    nameKey: 'landing.tracks.data',
    descriptionKey: 'landing.tracks.dataCopy',
    locationKey: 'landing.tracks.cairoAlex',
    tagKeys: ['landing.tracks.tags.mathematics', 'landing.tracks.tags.computerScience'],
    requirementKeys: ['landing.tracks.req.math', 'landing.tracks.req.python'],
    isAi: true,
  },
  {
    id: 'cybersecurity',
    category: 'infrastructure',
    categoryKey: 'landing.tracks.infrastructure',
    nameKey: 'landing.tracks.cyber',
    descriptionKey: 'landing.tracks.cyberCopy',
    locationKey: 'landing.tracks.smartVillage',
    tagKeys: ['landing.tracks.tags.networks', 'landing.tracks.tags.it'],
    requirementKeys: ['landing.tracks.req.networks', 'landing.tracks.req.systems'],
    isAi: false,
  },
  {
    id: 'product-design',
    category: 'design',
    categoryKey: 'landing.tracks.design',
    nameKey: 'landing.tracks.ux',
    descriptionKey: 'landing.tracks.uxCopy',
    locationKey: 'landing.tracks.allBranches',
    tagKeys: ['landing.tracks.tags.design', 'landing.tracks.tags.arts'],
    requirementKeys: ['landing.tracks.req.portfolio', 'landing.tracks.req.communication'],
    isAi: false,
  },
  {
    id: 'cloud-devops',
    category: 'infrastructure',
    categoryKey: 'landing.tracks.infrastructure',
    nameKey: 'landing.tracks.cloud',
    descriptionKey: 'landing.tracks.cloudCopy',
    locationKey: 'landing.tracks.cairo',
    tagKeys: ['landing.tracks.tags.it', 'landing.tracks.tags.engineering'],
    requirementKeys: ['landing.tracks.req.linux', 'landing.tracks.req.networks'],
    isAi: false,
  },
  {
    id: 'embedded-iot',
    category: 'software',
    categoryKey: 'landing.tracks.software',
    nameKey: 'landing.tracks.embedded',
    descriptionKey: 'landing.tracks.embeddedCopy',
    locationKey: 'landing.tracks.alex',
    tagKeys: ['landing.tracks.tags.engineering', 'landing.tracks.tags.electronics'],
    requirementKeys: ['landing.tracks.req.electronics', 'landing.tracks.req.c'],
    isAi: false,
  },
];

function initialTheme(): Theme {
  if (typeof localStorage !== 'undefined') {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  }

  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrls: [
    './landing-page.scss',
    './landing-page-hero.scss',
    './landing-page-programs.scss',
    './landing-page-sections.scss',
    './landing-page-footer.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {
  readonly locale = inject(LocaleStore);
  readonly tracks = TRACKS;
  readonly trackFilters: readonly {
    value: TrackFilter;
    labelKey: string;
  }[] = [
    { value: 'all', labelKey: 'landing.tracks.filterAll' },
    { value: 'software', labelKey: 'landing.tracks.software' },
    { value: 'data', labelKey: 'landing.tracks.dataAi' },
    { value: 'design', labelKey: 'landing.tracks.design' },
    {
      value: 'infrastructure',
      labelKey: 'landing.tracks.infrastructure',
    },
  ];

  private readonly programsApi = inject(ProgramsApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly title = inject(Title);

  readonly theme = signal<Theme>(initialTheme());
  readonly mobileMenuOpen = signal(false);
  readonly activeFilter = signal<TrackFilter>('all');
  readonly trackSearch = signal('');
  readonly expandedTrackIds = signal<ReadonlySet<string>>(new Set());
  readonly programs = signal<readonly Program[]>([]);
  readonly programsStatus = signal<ProgramsStatus>('loading');
  readonly activeProgramCount = computed(
    () => this.programs().filter((program) => program.isActive).length,
  );
  readonly hasActivePrograms = computed(() => this.activeProgramCount() > 0);
  readonly filteredTracks = computed(() => {
    const filter = this.activeFilter();
    const query = this.trackSearch().trim().toLocaleLowerCase();

    return TRACKS.filter((track) => {
      if (filter !== 'all' && track.category !== filter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        track.categoryKey,
        track.nameKey,
        track.descriptionKey,
        track.locationKey,
        ...track.tagKeys,
        ...track.requirementKeys,
      ]
        .map((key) => this.locale.t(key))
        .join(' ')
        .toLocaleLowerCase();

      return searchableText.includes(query);
    });
  });

  constructor() {
    effect(() => this.title.setTitle(this.locale.t('landing.pageTitle')));
    this.loadPrograms();
  }

  loadPrograms(): void {
    this.programsStatus.set('loading');
    this.programsApi
      .getPrograms()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (programs) => {
          this.programs.set(programs);
          this.programsStatus.set('loaded');
        },
        error: () => {
          this.programs.set([]);
          this.programsStatus.set('error');
        },
      });
  }

  toggleTheme(): void {
    const theme: Theme = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(theme);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }

  toggleLocale(): void {
    this.locale.toggle();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  setActiveFilter(filter: TrackFilter): void {
    this.activeFilter.set(filter);
  }

  updateTrackSearch(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.trackSearch.set(event.target.value);
    }
  }

  toggleTrack(trackId: string): void {
    this.expandedTrackIds.update((current) => {
      const next = new Set(current);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  }

  isTrackExpanded(trackId: string): boolean {
    return this.expandedTrackIds().has(trackId);
  }

  programName(program: Program): string {
    return localizedProgramName(program, this.locale.locale());
  }

  programDescription(program: Program): string {
    return localizedProgramDescription(program, this.locale.locale());
  }

  programLocations(program: Program): string {
    return localizedProgramLocations(program, this.locale.locale());
  }

  programDurationUnit(program: Program): string {
    if (this.locale.locale() === 'ar' && program.durationUnitAr) {
      return program.durationUnitAr;
    }

    if (/^months?$/i.test(program.durationUnit)) {
      return this.locale.t('landing.programs.months');
    }

    if (program.durationUnit === 'Duration') {
      return this.locale.t('landing.programs.duration');
    }

    return program.durationUnit;
  }

  programTrackCount(program: Program): string {
    if (program.tracksCount === null) {
      return this.locale.t('landing.programs.defaultTracks');
    }

    const key =
      program.tracksCount === 1 ? 'landing.programs.oneTrack' : 'landing.programs.manyTracks';
    return this.locale.t(key, { count: program.tracksCount });
  }

  footerProgramStatus(): string {
    const count = this.activeProgramCount();
    if (count === 0) {
      return this.locale.t('landing.programs.closedFooter');
    }

    return this.locale.t(
      count === 1 ? 'landing.programs.activeFooterOne' : 'landing.programs.activeFooterMany',
      { count },
    );
  }
}
