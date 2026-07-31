import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { DirectionalityService } from './core/i18n/directionality.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly directionality = inject(DirectionalityService);
}
