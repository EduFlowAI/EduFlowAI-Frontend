import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EligibilityResultPage } from './eligibility-result-page';

describe('EligibilityResultPage', () => {
  let component: EligibilityResultPage;
  let fixture: ComponentFixture<EligibilityResultPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EligibilityResultPage],
    }).compileComponents();

    fixture = TestBed.createComponent(EligibilityResultPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
