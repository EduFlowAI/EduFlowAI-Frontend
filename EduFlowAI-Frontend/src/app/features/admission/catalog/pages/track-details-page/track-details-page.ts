import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { isApiError } from '../../../../../core/errors/api-problem';
import { TrackCatalogService } from '../../data-access/track-catalog.service';
import { TrackCatalogItem } from '../../models/track-catalog.model';
import { TrackCatalogCopy } from '../../track-catalog.copy';

@Component({
  selector: 'app-track-details-page',
  imports: [RouterLink],
  templateUrl: './track-details-page.html',
  styleUrl: './track-details-page.scss',
})
export class TrackDetailsPage implements OnInit {
  protected readonly copy = inject(TrackCatalogCopy);

  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TrackCatalogService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly track = signal<TrackCatalogItem | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly loadFailed = signal(false);

  protected readonly totalCapacity = computed(() =>
    this.track()?.offerings.reduce(
      (total, offering) => total + offering.capacity,
      0,
    ) ?? 0,
  );

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    const trackId = this.route.snapshot.paramMap.get('trackId');

    this.loading.set(true);
    this.notFound.set(false);
    this.loadFailed.set(false);
    this.track.set(null);

    if (!trackId) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    this.service
      .getTrack(trackId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (track) => this.track.set(track),
        error: (error: unknown) => {
          if (isApiError(error) && error.status === 404) {
            this.notFound.set(true);
            return;
          }

          this.loadFailed.set(true);
        },
      });
  }
}
