import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { NotificationCenterPage } from './notification-center-page';

describe('NotificationCenterPage', () => {
  const originalMatchMedia = window.matchMedia;
  let component: NotificationCenterPage;
  let fixture: ComponentFixture<NotificationCenterPage>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationCenterPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('should create', () => {
    createComponent([]);
    expect(component).toBeTruthy();
  });

  it('marks the initially opened unread notification as read', () => {
    createComponent([
      {
        id: 'notification-1',
        message: 'Upload the requested document.',
        type: 1,
        isRead: false,
        createdAt: '2026-08-01T10:00:00Z',
      },
    ]);

    const request = http.expectOne('/api/communication/notifications/notification-1/read');
    expect(request.request.method).toBe('PATCH');
    request.flush(null, { status: 204, statusText: 'No Content' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.unread-dot')).toBeNull();
    expect(fixture.nativeElement.querySelector('.status-pill')?.textContent).toContain('Read');
  });

  it('marks all loaded notifications as read from the toolbar action', () => {
    createComponent([
      {
        id: 'notification-1',
        message: 'Your first notification.',
        type: 1,
        isRead: true,
        createdAt: '2026-08-01T10:00:00Z',
      },
      {
        id: 'notification-2',
        message: 'Your second notification.',
        type: 5,
        isRead: false,
        createdAt: '2026-08-01T09:00:00Z',
      },
    ]);

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.mark-all-button');
    button.click();

    const request = http.expectOne('/api/communication/notifications/read-all');
    expect(request.request.method).toBe('PATCH');
    request.flush({ updatedCount: 1 });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.unread-dot')).toHaveLength(0);
  });

  it('switches from the inbox to detail and back in compact view', () => {
    useCompactViewport();
    createComponent([
      {
        id: 'notification-1',
        message: 'Open this notification.',
        type: 5,
        isRead: false,
        createdAt: '2026-08-01T10:00:00Z',
      },
    ]);

    http.expectNone('/api/communication/notifications/notification-1/read');

    const notification: HTMLButtonElement =
      fixture.nativeElement.querySelector('.notification-item');
    notification.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.notification-list-panel').style.display).toBe(
      'none',
    );
    expect(fixture.nativeElement.querySelector('.notification-detail').style.display).toBe('');

    http
      .expectOne('/api/communication/notifications/notification-1/read')
      .flush(null, { status: 204, statusText: 'No Content' });

    const backButton: HTMLButtonElement = fixture.nativeElement.querySelector('.back-to-inbox');
    backButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.notification-list-panel').style.display).toBe('');
    expect(fixture.nativeElement.querySelector('.notification-detail').style.display).toBe('none');
  });

  function createComponent(data: object[]): void {
    fixture = TestBed.createComponent(NotificationCenterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    http
      .expectOne(
        (request) =>
          request.url === '/api/communication/notifications' &&
          request.params.get('Page') === '1' &&
          request.params.get('PageSize') === '10',
      )
      .flush({
        data,
        filters: null,
        currentPage: 1,
        totalPages: data.length > 0 ? 1 : 0,
        pageSize: 10,
        totalCount: data.length,
      });

    fixture.detectChanges();
  }

  function useCompactViewport(): void {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () =>
        ({
          matches: true,
          media: '(max-width: 55rem)',
          onchange: null,
          addListener: () => undefined,
          removeListener: () => undefined,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
          dispatchEvent: () => true,
        }) as MediaQueryList,
    });
  }
});
