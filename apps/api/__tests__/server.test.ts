import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock dependencies before importing
vi.mock('../src/app', () => ({
  createApp: vi.fn(() => ({
    listen: vi.fn((port: number | string, callback: () => void) => {
      callback();
      return { close: vi.fn() };
    }),
  })),
}));

vi.mock('../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

describe('Server', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('starts server on default port 3001 when PORT env is not set', async () => {
    delete process.env.PORT;

    const { createApp } = await import('../src/app');
    const { logger } = await import('../src/utils/logger');

    // Import server to trigger initialization
    await import('../src/server');

    expect(createApp).toHaveBeenCalled();
    const app = (createApp as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(app.listen).toHaveBeenCalledWith(3001, expect.any(Function));
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('localhost:3001'),
      expect.objectContaining({
        port: 3001,
      })
    );
  });

  it('starts server on custom port from PORT env', async () => {
    process.env.PORT = '4000';

    vi.resetModules();

    // Re-mock after reset
    vi.doMock('../src/app', () => ({
      createApp: vi.fn(() => ({
        listen: vi.fn((port: number | string, callback: () => void) => {
          callback();
          return { close: vi.fn() };
        }),
      })),
    }));

    vi.doMock('../src/utils/logger', () => ({
      logger: {
        info: vi.fn(),
      },
    }));

    const { createApp } = await import('../src/app');
    const { logger } = await import('../src/utils/logger');

    // Import server to trigger initialization
    await import('../src/server');

    expect(createApp).toHaveBeenCalled();
    const app = (createApp as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(app.listen).toHaveBeenCalledWith('4000', expect.any(Function));
    expect(logger.info).toHaveBeenCalledWith(
      'API server running on http://localhost:4000',
      expect.objectContaining({
        port: '4000',
      })
    );
  });

  it('uses NODE_ENV from environment', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.PORT;

    vi.resetModules();

    // Re-mock after reset
    vi.doMock('../src/app', () => ({
      createApp: vi.fn(() => ({
        listen: vi.fn((port: number | string, callback: () => void) => {
          callback();
          return { close: vi.fn() };
        }),
      })),
    }));

    vi.doMock('../src/utils/logger', () => ({
      logger: {
        info: vi.fn(),
      },
    }));

    const { logger } = await import('../src/utils/logger');

    // Import server to trigger initialization
    await import('../src/server');

    expect(logger.info).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        nodeEnv: 'production',
      })
    );
  });

  it('defaults to development when NODE_ENV is not set', async () => {
    delete process.env.NODE_ENV;
    delete process.env.PORT;

    vi.resetModules();

    // Re-mock after reset
    vi.doMock('../src/app', () => ({
      createApp: vi.fn(() => ({
        listen: vi.fn((port: number | string, callback: () => void) => {
          callback();
          return { close: vi.fn() };
        }),
      })),
    }));

    vi.doMock('../src/utils/logger', () => ({
      logger: {
        info: vi.fn(),
      },
    }));

    const { logger } = await import('../src/utils/logger');

    // Import server to trigger initialization
    await import('../src/server');

    expect(logger.info).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        nodeEnv: 'development',
      })
    );
  });
});
