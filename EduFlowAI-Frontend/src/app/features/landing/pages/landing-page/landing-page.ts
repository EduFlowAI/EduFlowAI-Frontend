import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { LocaleStore } from '../../../../core/i18n/locale.store';

type Theme = 'light' | 'dark';
type TrackCategory = 'software' | 'data' | 'design' | 'infrastructure';
type TrackFilter = 'all' | TrackCategory;

interface ProgramFact {
  readonly labelKey: string;
  readonly valueKey: string;
}

interface ProgramDefinition {
  readonly id: string;
  readonly code: string;
  readonly nameKey: string;
  readonly descriptionKey: string;
  readonly durationMonths: number;
  readonly highlights: readonly ProgramFact[];
  readonly eligibility: readonly ProgramFact[];
}

interface TrackDefinition {
  readonly id: string;
  readonly category: TrackCategory;
  readonly categoryKey: string;
  readonly nameKey: string;
  readonly descriptionKey: string;
  readonly locationKey: string;
  readonly durationMonths: 4 | 9;
  readonly requirementKeys: readonly string[];
  readonly isAi: boolean;
}

const THEME_STORAGE_KEY = 'iti-theme';

const SHARED_ELIGIBILITY: readonly ProgramFact[] = [
  {
    labelKey: 'landing.programs.gender',
    valueKey: 'landing.programs.malesAndFemales',
  },
  {
    labelKey: 'landing.programs.nationalities',
    valueKey: 'landing.programs.egyptian',
  },
  {
    labelKey: 'landing.programs.militaryService',
    valueKey: 'landing.programs.militaryStatus',
  },
  {
    labelKey: 'landing.programs.educationDegree',
    valueKey: 'landing.programs.bachelorDegree',
  },
];

const PROGRAMS: readonly ProgramDefinition[] = [
  {
    id: 'professional-training-program',
    code: 'PTP-9M',
    nameKey: 'landing.programs.professional.name',
    descriptionKey: 'landing.programs.professional.description',
    durationMonths: 9,
    highlights: [
      {
        labelKey: 'landing.programs.fees',
        valueKey: 'landing.programs.fullyFunded',
      },
      {
        labelKey: 'landing.programs.jobProfiles',
        valueKey: 'landing.programs.professional.jobProfiles',
      },
      {
        labelKey: 'landing.programs.graduates',
        valueKey: 'landing.programs.professional.graduates',
      },
      {
        labelKey: 'landing.programs.duration',
        valueKey: 'landing.programs.professional.duration',
      },
    ],
    eligibility: [
      ...SHARED_ELIGIBILITY,
      {
        labelKey: 'landing.programs.graduationYear',
        valueKey: 'landing.programs.professional.graduationYear',
      },
      {
        labelKey: 'landing.programs.grade',
        valueKey: 'landing.programs.fair',
      },
    ],
  },
  {
    id: 'intensive-code-camps',
    code: 'ICC-4M',
    nameKey: 'landing.programs.icc.name',
    descriptionKey: 'landing.programs.icc.description',
    durationMonths: 4,
    highlights: [
      {
        labelKey: 'landing.programs.fees',
        valueKey: 'landing.programs.fullyFunded',
      },
      {
        labelKey: 'landing.programs.jobProfiles',
        valueKey: 'landing.programs.icc.jobProfiles',
      },
      {
        labelKey: 'landing.programs.graduates',
        valueKey: 'landing.programs.icc.graduates',
      },
      {
        labelKey: 'landing.programs.duration',
        valueKey: 'landing.programs.icc.duration',
      },
    ],
    eligibility: [
      ...SHARED_ELIGIBILITY,
      {
        labelKey: 'landing.programs.graduationYear',
        valueKey: 'landing.programs.icc.graduationYear',
      },
      {
        labelKey: 'landing.programs.grade',
        valueKey: 'landing.programs.fair',
      },
    ],
  },
];

const TRACKS: readonly TrackDefinition[] = [
  {
    id: 'fullstack',
    category: 'software',
    categoryKey: 'landing.tracks.software',
    nameKey: 'landing.tracks.fullstack',
    descriptionKey: 'landing.tracks.fullstackCopy',
    locationKey: 'landing.tracks.threeBranches',
    durationMonths: 9,
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
    durationMonths: 9,
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
    durationMonths: 9,
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
    durationMonths: 4,
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
    durationMonths: 4,
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
    durationMonths: 4,
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
  readonly programs = PROGRAMS;
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

  private readonly title = inject(Title);

  readonly theme = signal<Theme>(initialTheme());
  readonly mobileMenuOpen = signal(false);
  readonly activeFilter = signal<TrackFilter>('all');
  readonly trackSearch = signal('');
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
}
