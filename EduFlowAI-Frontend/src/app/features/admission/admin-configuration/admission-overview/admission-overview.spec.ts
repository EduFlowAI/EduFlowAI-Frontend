import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AdmissionOverview } from './admission-overview';

describe('AdmissionOverview', () => {
  let component: AdmissionOverview;
  let fixture: ComponentFixture<AdmissionOverview>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmissionOverview],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdmissionOverview);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('creates and loads dashboard counts', () => {
    fixture.detectChanges();

    const request = http.expectOne('/api/admin/dashboard');
    request.flush({
      isSuccess: true,
      data: {
        institutionCount: 1,
        programCount: 1,
        activeTrackCount: 10,
        activeBranchCount: 5,
        draftCycleCount: 1,
        closedCycleCount: 0,
        applicationCount: 3,
        activeCycle: null,
        activeCycleOfferingCount: 0,
        activeCycleCapacity: 0,
      },
      statusCode: 200,
      message: '',
    });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Admission overview');
  });
});
