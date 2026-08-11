import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { BranchOfferingDto, TrackDto } from './../models/track.model';
import { Result } from './../models/application.model';

@Injectable({
  providedIn: 'root',
})
export class TrackService {
  private readonly http = inject(HttpClient);
  private readonly tracksUrl = `${environment.apiUrl}/api/tracks`;

  /**
   * Fetches the public tracks, optionally filtered by admission cycle.
   * Maps to GET: api/tracks?cycleId={cycleId}
   */
  getTracks(cycleId?: string): Observable<Result<TrackDto[]>> {
    let params = new HttpParams();
    if (cycleId) {
      params = params.set('cycleId', cycleId);
    }

    return this.http.get<Result<TrackDto[]>>(this.tracksUrl, { params }).pipe(
      map((result) => ({
        ...result,
        data: (result.data ?? []).map((track) => this.normalizeTrack(track)),
      })),
    );
  }

  private normalizeTrack(track: TrackDto): TrackDto {
    const offerings = track.offerings ?? [];
    const locations =
      track.isOfficialIntake47 || (track.locations?.length ?? 0) > 0
        ? (track.locations ?? [])
        : offerings
            .filter(
              (offering, index, items) =>
                items.findIndex((item) => item.branchId === offering.branchId) === index,
            )
            .map((offering) => ({
              branchId: offering.branchId,
              branchName: offering.branchName,
              governorate: offering.governorate,
            }));

    return {
      ...track,
      officialTrackId: track.officialTrackId ?? null,
      officialTrackUrl: track.officialTrackUrl ?? null,
      isOfficialIntake47: track.isOfficialIntake47 ?? false,
      intake: track.intake ?? null,
      year: track.year ?? null,
      category: track.category ?? null,
      totalHours: track.totalHours ?? null,
      minimumGrade: track.minimumGrade ?? null,
      eligibilitySummary: track.eligibilitySummary ?? null,
      graduationYearLimitYears: track.graduationYearLimitYears ?? null,
      prerequisiteTopics: track.prerequisiteTopics ?? [],
      locations,
      offerings,
    };
  }
}
