import { Component,computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { DirectionalityService } from './core/i18n/directionality.service';
import { AssistantPage } from './features/ai/assistant/pages/assistant-page/assistant-page';

import { APP_ROLES } from './core/auth/auth-session.model';
import { AuthSessionStore } from './core/auth/auth-session.store';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AssistantPage,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly directionality = inject(DirectionalityService);
  private readonly authSession = inject(AuthSessionStore);

readonly showAssistant = computed(() =>
  this.authSession.hasRole(APP_ROLES.applicant),
);
}