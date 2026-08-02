import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';

import { TrackDetailsPage } from './track-details-page';

describe('TrackDetailsPage', () => {
  let component: TrackDetailsPage;
  let fixture: ComponentFixture<TrackDetailsPage>;
  let http: HttpTestingController;

  const trackId = '11111111-1111-1111-1111-111111111111';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackDetailsPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ trackId }),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackDetailsPage);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('creates and loads the selected public track', () => {
    fixture.detectChanges();

    const request = http.expectOne(`/api/tracks/${trackId}`);
    request.flush({
      isSuccess: true,
      data: {
        id: trackId,
        programId: '22222222-2222-2222-2222-222222222222',
        name: '.NET Full Stack',
        description: 'Build production-ready applications.',
        prerequisiteTopics: ['C#'],
        isActive: true,
        offerings: [],
      },
      statusCode: 200,
      message: '',
    });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('.NET Full Stack');
  });
});
