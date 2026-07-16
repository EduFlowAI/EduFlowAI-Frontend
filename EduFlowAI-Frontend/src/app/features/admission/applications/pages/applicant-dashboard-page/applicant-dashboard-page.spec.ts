import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantDashboardPage } from './applicant-dashboard-page';

describe('ApplicantDashboardPage', () => {
  let component: ApplicantDashboardPage;
  let fixture: ComponentFixture<ApplicantDashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantDashboardPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicantDashboardPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
