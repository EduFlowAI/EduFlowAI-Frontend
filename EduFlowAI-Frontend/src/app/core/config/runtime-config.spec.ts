import { environment } from '../../../environments/environment';
import { RuntimeConfig } from './runtime-config';

describe('RuntimeConfig', () => {
  const configuredRoot = environment.apiUrl.trim().replace(/\/+$/, '');
  const expectedApiBaseUrl = /\/api$/i.test(configuredRoot)
    ? configuredRoot
    : `${configuredRoot}/api`;

  it('builds the API base URL from the selected environment', () => {
    const config = new RuntimeConfig();

    expect(config.apiBaseUrl).toBe(expectedApiBaseUrl);
  });

  it('trusts relative API URLs and only the configured absolute API origin', () => {
    const config = new RuntimeConfig();

    expect(config.isTrustedApiUrl('/api/profile')).toBe(true);
    expect(config.isTrustedApiUrl('https://example.com/api/profile')).toBe(false);

    if (/^https?:\/\//i.test(expectedApiBaseUrl)) {
      const configuredOrigin = new URL(expectedApiBaseUrl).origin;

      expect(config.isTrustedApiUrl(`${expectedApiBaseUrl}/profile`)).toBe(true);
      expect(
        config.isTrustedApiUrl(`${configuredOrigin}/outside-api/profile`),
      ).toBe(false);
      return;
    }

    // In development apiUrl is intentionally empty so Angular's /api proxy is used.
    expect(expectedApiBaseUrl).toBe('/api');
    expect(config.isTrustedApiUrl('http://localhost:7159/api/profile')).toBe(false);
  });
});
