import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationEditPage } from './application-edit-page';

describe('ApplicationEditPage', () => {
  let component: ApplicationEditPage;
  let fixture: ComponentFixture<ApplicationEditPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationEditPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationEditPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
