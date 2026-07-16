import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplacementUploadPage } from './replacement-upload-page';

describe('ReplacementUploadPage', () => {
  let component: ReplacementUploadPage;
  let fixture: ComponentFixture<ReplacementUploadPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplacementUploadPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ReplacementUploadPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
