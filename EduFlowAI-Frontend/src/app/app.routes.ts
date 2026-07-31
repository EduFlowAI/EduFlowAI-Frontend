import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './features/ai/assistant/pages/assistant-page/assistant-page'
      ).then(module => module.AssistantPage),
  },
];