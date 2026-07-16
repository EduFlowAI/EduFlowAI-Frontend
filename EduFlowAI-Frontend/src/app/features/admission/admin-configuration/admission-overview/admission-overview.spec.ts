import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmissionOverview } from './admission-overview';

describe('AdmissionOverview', () => {
  let component: AdmissionOverview;
  let fixture: ComponentFixture<AdmissionOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmissionOverview],
    }).compileComponents();

    fixture = TestBed.createComponent(AdmissionOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
