import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    };
  },
  useSearchParams() {
    return {
      get: vi.fn(),
    };
  },
  usePathname() {
    return '';
  },
}));

// Setup window.fetch mock with default implementation for meta endpoints
global.fetch = vi.fn().mockImplementation((url: string | URL | Request) => {
  const urlString = url.toString();
  // Return empty arrays for combobox meta endpoints
  if (urlString.includes('/api/wines/meta/')) {
    return Promise.resolve({
      ok: true,
      json: async () => [],
    } as Response);
  }
  // Default: return empty object for other endpoints
  return Promise.resolve({ ok: true, json: async () => ({}) } as Response);
});
