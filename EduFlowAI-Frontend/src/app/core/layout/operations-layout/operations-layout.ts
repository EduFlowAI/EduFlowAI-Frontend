import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthSessionStore } from '../../auth/auth-session.store';
import { LocaleStore } from '../../i18n/locale.store';

@Component({
  selector: 'app-operations-layout',
  imports: [RouterOutlet],
  templateUrl: './operations-layout.html',
  styleUrl: './operations-layout.scss',
})
export class OperationsLayout {
  protected readonly locale = inject(LocaleStore);
  protected readonly session = inject(AuthSessionStore);
  private readonly router = inject(Router);

  protected logout(): void {
    this.session.clear();
    void this.router.navigate(['/auth/login']);
  }
}
