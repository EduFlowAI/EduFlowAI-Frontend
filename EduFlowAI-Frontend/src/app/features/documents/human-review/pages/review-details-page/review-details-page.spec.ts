import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewDetailsPage } from './review-details-page';

describe('ReviewDetailsPage', () => {
  let component: ReviewDetailsPage;
  let fixture: ComponentFixture<ReviewDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewDetailsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewDetailsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
