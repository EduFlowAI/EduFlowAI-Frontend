import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RuntimeConfig {
  readonly apiBaseUrl = '/api';

  isTrustedApiUrl(url: string): boolean {
    if (url.startsWith('/api/')) {
      return true;
    }

    if (!/^https?:\/\//i.test(url)) {
      return false;
    }

    try {
      const parsedUrl = new URL(url);
      const isApiPath = parsedUrl.pathname.startsWith('/api/');

      if (!isApiPath) {
        return false;
      }

      if (
        typeof window !== 'undefined' &&
        parsedUrl.origin === window.location.origin
      ) {
        return true;
      }

      return (
        (parsedUrl.hostname === 'localhost' && parsedUrl.port === '7159') ||
        (parsedUrl.protocol === 'https:' &&
          parsedUrl.hostname === 'api.eduflowai.com')
      );
    } catch {
      return false;
    }
  }
}
