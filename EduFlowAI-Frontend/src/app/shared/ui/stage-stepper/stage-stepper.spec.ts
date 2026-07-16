import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StageStepper } from './stage-stepper';

describe('StageStepper', () => {
  let component: StageStepper;
  let fixture: ComponentFixture<StageStepper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StageStepper],
    }).compileComponents();

    fixture = TestBed.createComponent(StageStepper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
