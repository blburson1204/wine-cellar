// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Next.js router
// eslint-disable-next-line no-undef
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      // eslint-disable-next-line no-undef
      push: jest.fn(),
      // eslint-disable-next-line no-undef
      replace: jest.fn(),
      // eslint-disable-next-line no-undef
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return {
      // eslint-disable-next-line no-undef
      get: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
}));

// Setup window.fetch mock
// eslint-disable-next-line no-undef
global.fetch = jest.fn();
