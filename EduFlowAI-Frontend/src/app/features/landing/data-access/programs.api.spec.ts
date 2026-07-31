import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProgramsApi } from './programs.api';

describe('ProgramsApi', () => {
  let api: ProgramsApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProgramsApi,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    api = TestBed.inject(ProgramsApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads and normalizes programs through the relative API route', () => {
    let resultName: string | undefined;
    let resultArabicName: string | undefined;

    api.getPrograms().subscribe((programs) => {
      resultName = programs[0]?.name;
      resultArabicName = programs[0]?.nameAr;
    });

    const request = http.expectOne('/api/programs');
    expect(request.request.method).toBe('GET');
    request.flush({
      data: [
        {
          programId: 'program-1',
          programCode: 'PTP-9M',
          programName: 'Professional Training Program',
          durationInMonths: 9,
          isActive: true,
        },
      ],
    });

    expect(resultName).toBe('Professional Training Program');
    expect(resultArabicName).toBe('Professional Training Program');
  });
});
