import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  DocumentType,
  RequirementGender,
} from '../models/admission-admin.model';
import { AdmissionAdminApiService } from './admission-admin-api.service';

describe('AdmissionAdminApiService', () => {
  let service: AdmissionAdminApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AdmissionAdminApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the Super Admin dashboard', () => {
    service.getDashboard().subscribe();

    const request = http.expectOne('/api/admin/dashboard');
    expect(request.request.method).toBe('GET');
    request.flush({ isSuccess: true, data: {}, statusCode: 200, message: '' });
  });

  it('replaces program document requirements with the backend contract', () => {
    const programId = '11111111-1111-1111-1111-111111111111';
    const body = {
      requirements: [
        {
          documentType: DocumentType.MilitaryCertificate,
          requiredForGender: RequirementGender.Male,
        },
      ],
    };

    service.updateProgramRequirements(programId, body).subscribe();

    const request = http.expectOne(
      `/api/admin/programs/${programId}/document-requirements`,
    );
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(body);
    request.flush({ isSuccess: true, data: [], statusCode: 200, message: '' });
  });

  it('posts the complete offerings collection for a cycle', () => {
    const cycleId = '22222222-2222-2222-2222-222222222222';
    const body = {
      offerings: [
        {
          trackId: '33333333-3333-3333-3333-333333333333',
          branchId: '44444444-4444-4444-4444-444444444444',
          capacity: 40,
        },
      ],
    };

    service.configureOfferings(cycleId, body).subscribe();

    const request = http.expectOne(`/api/admin/cycles/${cycleId}/offerings`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({ isSuccess: true, data: [], statusCode: 200, message: '' });
  });

  it('activates a cycle with the expected endpoint', () => {
    const cycleId = '55555555-5555-5555-5555-555555555555';

    service.activateCycle(cycleId).subscribe();

    const request = http.expectOne(`/api/admin/cycles/${cycleId}/activate`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeNull();
    request.flush({ isSuccess: true, data: {}, statusCode: 200, message: '' });
  });
});
