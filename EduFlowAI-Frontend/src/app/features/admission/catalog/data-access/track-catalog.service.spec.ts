import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { RuntimeConfig } from '../../../../core/config/runtime-config';
import { TrackCatalogItem } from '../models/track-catalog.model';
import { TrackCatalogService } from './track-catalog.service';

const apiBaseUrl = 'https://admission.example.test/api';

describe('TrackCatalogService', () => {
  let service: TrackCatalogService;
  let http: HttpTestingController;

  const track: TrackCatalogItem = {
    id: '11111111-1111-1111-1111-111111111111',
    programId: '22222222-2222-2222-2222-222222222222',
    name: '.NET Full Stack',
    description: 'Build production-ready web applications.',
    prerequisiteTopics: ['C#', 'SQL'],
    isActive: true,
    offerings: [
      {
        offeringId: '33333333-3333-3333-3333-333333333333',
        branchId: '44444444-4444-4444-4444-444444444444',
        branchName: 'Alexandria',
        governorate: 'Alexandria',
        capacity: 40,
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TrackCatalogService,
        { provide: RuntimeConfig, useValue: { apiBaseUrl } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(TrackCatalogService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads and unwraps the public track catalog', () => {
    let result: readonly TrackCatalogItem[] | undefined;

    service.getTracks().subscribe((tracks) => {
      result = tracks;
    });

    const request = http.expectOne(`${apiBaseUrl}/tracks`);
    expect(request.request.method).toBe('GET');

    request.flush({
      isSuccess: true,
      data: [track],
      statusCode: 200,
      message: '',
    });

    expect(result).toEqual([track]);
  });

  it('loads and unwraps one public track', () => {
    let result: TrackCatalogItem | undefined;

    service.getTrack(track.id).subscribe((item) => {
      result = item;
    });

    const request = http.expectOne(`${apiBaseUrl}/tracks/${track.id}`);
    expect(request.request.method).toBe('GET');

    request.flush({
      isSuccess: true,
      data: track,
      statusCode: 200,
      message: '',
    });

    expect(result).toEqual(track);
  });
});
