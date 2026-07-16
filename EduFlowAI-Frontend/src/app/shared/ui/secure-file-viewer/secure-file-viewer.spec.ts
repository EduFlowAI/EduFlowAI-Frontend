import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecureFileViewer } from './secure-file-viewer';

describe('SecureFileViewer', () => {
  let component: SecureFileViewer;
  let fixture: ComponentFixture<SecureFileViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecureFileViewer],
    }).compileComponents();

    fixture = TestBed.createComponent(SecureFileViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
