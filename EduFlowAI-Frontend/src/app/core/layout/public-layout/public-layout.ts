import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { LocaleStore } from '../../i18n/locale.store';

@Component({
  selector: 'app-public-layout',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
})
export class PublicLayout {
  protected readonly locale = inject(LocaleStore);
}
