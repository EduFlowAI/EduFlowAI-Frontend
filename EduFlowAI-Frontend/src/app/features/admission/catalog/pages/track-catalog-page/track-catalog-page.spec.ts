import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackCatalogPage } from './track-catalog-page';

describe('TrackCatalogPage', () => {
  let component: TrackCatalogPage;
  let fixture: ComponentFixture<TrackCatalogPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackCatalogPage],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackCatalogPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
