import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  ApiResult,
  TrackCatalogItem,
} from '../models/track-catalog.model';

@Injectable({ providedIn: 'root' })
export class TrackCatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/tracks';

  getTracks(): Observable<readonly TrackCatalogItem[]> {
    return this.http
      .get<ApiResult<TrackCatalogItem[]>>(this.baseUrl)
      .pipe(map((response) => this.unwrap(response)));
  }

  getTrack(trackId: string): Observable<TrackCatalogItem> {
    return this.http
      .get<ApiResult<TrackCatalogItem>>(`${this.baseUrl}/${trackId}`)
      .pipe(map((response) => this.unwrap(response)));
  }

  private unwrap<T>(response: ApiResult<T>): T {
    if (!response.isSuccess) {
      throw new Error(response.message || 'The request was not successful.');
    }

    return response.data;
  }
}
