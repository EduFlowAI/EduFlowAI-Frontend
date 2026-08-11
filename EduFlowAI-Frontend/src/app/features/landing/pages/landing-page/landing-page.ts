import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { LocaleStore } from '../../../../core/i18n/locale.store';
import { AssistantLauncherService } from '../../../ai/assistant/services/assistant-launcher.service';

type Theme = 'light' | 'dark';

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
        valueKey: 'landing.programs.gradeVaries',
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
        valueKey: 'landing.programs.gradeVaries',
      },
    ],
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

  private readonly title = inject(Title);
  private readonly assistantLauncher =
    inject(AssistantLauncherService);

  readonly theme = signal<Theme>(initialTheme());
  readonly mobileMenuOpen = signal(false);

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

  openAssistant(): void {
    this.assistantLauncher.open();
  }
}
