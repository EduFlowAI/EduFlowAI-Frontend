import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { TrackCatalogService } from '../../data-access/track-catalog.service';
import { TrackCatalogItem } from '../../models/track-catalog.model';
import { TrackCatalogCopy } from '../../track-catalog.copy';

@Component({
  selector: 'app-track-catalog-page',
  imports: [RouterLink],
  templateUrl: './track-catalog-page.html',
  styleUrl: './track-catalog-page.scss',
})
export class TrackCatalogPage implements OnInit {
  protected readonly copy = inject(TrackCatalogCopy);

  private readonly service = inject(TrackCatalogService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly tracks = signal<readonly TrackCatalogItem[]>([]);
  protected readonly query = signal('');
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected readonly filteredTracks = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();

    if (!query) {
      return this.tracks();
    }

    return this.tracks().filter((track) => {
      const searchableValues = [
        track.name,
        track.description,
        ...track.prerequisiteTopics,
        ...track.offerings.flatMap((offering) => [
          offering.branchName,
          offering.governorate,
        ]),
      ];

      return searchableValues
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLocaleLowerCase().includes(query));
    });
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(false);

    this.service
      .getTracks()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (tracks) => this.tracks.set(tracks),
        error: () => {
          this.tracks.set([]);
          this.error.set(true);
        },
      });
  }

  protected onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.query.set(input.value);
  }

  protected branchCount(track: TrackCatalogItem): number {
    return track.offerings.length;
  }

  protected totalCapacity(track: TrackCatalogItem): number {
    return track.offerings.reduce(
      (total, offering) => total + offering.capacity,
      0,
    );
  }
}
