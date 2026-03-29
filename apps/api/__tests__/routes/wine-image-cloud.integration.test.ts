import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { cleanupDatabase, createTestWine } from '../../src/test/helpers';

describe('Wine Image Cloud Integration Tests', () => {
  const app = createApp();

  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('GET /api/wines/:id/image - Cloud URL Redirect', () => {
    it('should redirect (302) for HTTPS Cloudinary URLs', async () => {
      const cloudUrl =
        'https://res.cloudinary.com/test-cloud/image/upload/wine-cellar/wine-123.jpg';
      const wine = await createTestWine({ imageUrl: cloudUrl });

      const response = await request(app).get(`/api/wines/${wine.id}/image`).expect(302);

      expect(response.headers.location).toBe(cloudUrl);
    });

    it('should redirect (302) for HTTP cloud URLs', async () => {
      const cloudUrl = 'http://example.com/images/wine-label.jpg';
      const wine = await createTestWine({ imageUrl: cloudUrl });

      const response = await request(app).get(`/api/wines/${wine.id}/image`).expect(302);

      expect(response.headers.location).toBe(cloudUrl);
    });

    it('should redirect to HTTPS URLs with query parameters', async () => {
      const cloudUrl =
        'https://res.cloudinary.com/test/image/upload/w_800,h_600/wine.jpg?version=123';
      const wine = await createTestWine({ imageUrl: cloudUrl });

      const response = await request(app).get(`/api/wines/${wine.id}/image`).expect(302);

      expect(response.headers.location).toBe(cloudUrl);
    });

    it('should redirect to URLs with special characters encoded', async () => {
      const cloudUrl = 'https://cdn.example.com/images/wine%20label%20special.jpg';
      const wine = await createTestWine({ imageUrl: cloudUrl });

      const response = await request(app).get(`/api/wines/${wine.id}/image`).expect(302);

      expect(response.headers.location).toBe(cloudUrl);
    });

    it('should return 404 when wine has no image', async () => {
      const wine = await createTestWine({ imageUrl: null });

      const response = await request(app).get(`/api/wines/${wine.id}/image`).expect(404);

      expect(response.body.errorCode).toBe('IMAGE_NOT_FOUND');
    });

    it('should return 404 for non-existent wine', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app).get(`/api/wines/${nonExistentId}/image`).expect(404);

      expect(response.body.errorCode).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/wines/:id/image - Local filename handling', () => {
    it('should return 404 when local filename does not exist on disk', async () => {
      // Create wine with local filename that doesn't exist
      const wine = await createTestWine({ imageUrl: 'non-existent-file.jpg' });

      const response = await request(app).get(`/api/wines/${wine.id}/image`).expect(404);

      expect(response.body.errorCode).toBe('IMAGE_FILE_NOT_FOUND');
    });

    it('should not redirect local filenames (non-http URLs)', async () => {
      const wine = await createTestWine({ imageUrl: 'local-wine-image.jpg' });

      const response = await request(app).get(`/api/wines/${wine.id}/image`);

      // Should NOT be a redirect - should be 404 (file not found) since file doesn't exist
      expect(response.status).not.toBe(302);
      expect(response.headers.location).toBeUndefined();
    });

    it('should treat relative paths as local files, not cloud URLs', async () => {
      const wine = await createTestWine({ imageUrl: './some-image.jpg' });

      const response = await request(app).get(`/api/wines/${wine.id}/image`);

      // Should NOT redirect
      expect(response.status).not.toBe(302);
    });

    it('should treat just a filename as a local file', async () => {
      const wine = await createTestWine({ imageUrl: 'wine-123.jpg' });

      const response = await request(app).get(`/api/wines/${wine.id}/image`);

      // Should NOT redirect
      expect(response.status).not.toBe(302);
    });
  });
});

describe('Storage Factory Provider Selection', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  it('should return local storage when STORAGE_PROVIDER is not set', async () => {
    delete process.env.STORAGE_PROVIDER;

    const { getStorageProvider } = await import('../../src/config/storage');

    expect(getStorageProvider()).toBe('local');
  });

  it('should return local storage when STORAGE_PROVIDER=local', async () => {
    process.env.STORAGE_PROVIDER = 'local';

    const { getStorageProvider } = await import('../../src/config/storage');

    expect(getStorageProvider()).toBe('local');
  });

  it('should return cloudinary when STORAGE_PROVIDER=cloudinary', async () => {
    process.env.STORAGE_PROVIDER = 'cloudinary';

    const { getStorageProvider } = await import('../../src/config/storage');

    expect(getStorageProvider()).toBe('cloudinary');
  });

  it('should be case-insensitive for STORAGE_PROVIDER', async () => {
    process.env.STORAGE_PROVIDER = 'CLOUDINARY';

    const { getStorageProvider } = await import('../../src/config/storage');

    expect(getStorageProvider()).toBe('cloudinary');
  });

  it('should default to local for unknown provider values', async () => {
    process.env.STORAGE_PROVIDER = 'unknown-provider';

    const { getStorageProvider } = await import('../../src/config/storage');

    expect(getStorageProvider()).toBe('local');
  });

  it('should report Cloudinary as configured when all credentials are present', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-key';
    process.env.CLOUDINARY_API_SECRET = 'test-secret';

    const { isCloudinaryConfigured } = await import('../../src/config/storage');

    expect(isCloudinaryConfigured()).toBe(true);
  });

  it('should report Cloudinary as not configured when credentials are missing', async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    const { isCloudinaryConfigured } = await import('../../src/config/storage');

    expect(isCloudinaryConfigured()).toBe(false);
  });

  it('should report Cloudinary as not configured when only partial credentials exist', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    const { isCloudinaryConfigured } = await import('../../src/config/storage');

    expect(isCloudinaryConfigured()).toBe(false);
  });
});

describe('Storage Factory Service Creation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  it('should create LocalStorageService when STORAGE_PROVIDER is not set', async () => {
    delete process.env.STORAGE_PROVIDER;

    const { createStorageService } = await import('../../src/services/storage/index');
    const { LocalStorageService } =
      await import('../../src/services/storage/local-storage.service');

    const service = createStorageService();

    expect(service).toBeInstanceOf(LocalStorageService);
  });

  it('should create LocalStorageService when STORAGE_PROVIDER=local', async () => {
    process.env.STORAGE_PROVIDER = 'local';

    const { createStorageService } = await import('../../src/services/storage/index');
    const { LocalStorageService } =
      await import('../../src/services/storage/local-storage.service');

    const service = createStorageService();

    expect(service).toBeInstanceOf(LocalStorageService);
  });

  it('should fallback to LocalStorageService when STORAGE_PROVIDER=cloudinary but credentials missing', async () => {
    process.env.STORAGE_PROVIDER = 'cloudinary';
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { createStorageService } = await import('../../src/services/storage/index');
    const { LocalStorageService } =
      await import('../../src/services/storage/local-storage.service');

    const service = createStorageService();

    expect(service).toBeInstanceOf(LocalStorageService);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Cloudinary credentials are missing')
    );

    warnSpy.mockRestore();
  });

  it('should create CloudinaryStorageService when provider=cloudinary and credentials present', async () => {
    process.env.STORAGE_PROVIDER = 'cloudinary';
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-key';
    process.env.CLOUDINARY_API_SECRET = 'test-secret';

    const { createStorageService } = await import('../../src/services/storage/index');
    const { CloudinaryStorageService } =
      await import('../../src/services/storage/cloudinary-storage.service');

    const service = createStorageService();

    expect(service).toBeInstanceOf(CloudinaryStorageService);
  });
});
