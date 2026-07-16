import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewQueuePage } from './review-queue-page';

describe('ReviewQueuePage', () => {
  let component: ReviewQueuePage;
  let fixture: ComponentFixture<ReviewQueuePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewQueuePage],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewQueuePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
