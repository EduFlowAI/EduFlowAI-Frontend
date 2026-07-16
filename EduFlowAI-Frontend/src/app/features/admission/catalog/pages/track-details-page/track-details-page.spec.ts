import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackDetailsPage } from './track-details-page';

describe('TrackDetailsPage', () => {
  let component: TrackDetailsPage;
  let fixture: ComponentFixture<TrackDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackDetailsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackDetailsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
