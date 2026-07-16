import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationsLayout } from './operations-layout';

describe('OperationsLayout', () => {
  let component: OperationsLayout;
  let fixture: ComponentFixture<OperationsLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationsLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(OperationsLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
