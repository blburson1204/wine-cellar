import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock cloudinary SDK before importing
vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: vi.fn(),
      destroy: vi.fn(),
    },
    api: {
      resource: vi.fn(),
    },
    url: vi.fn(),
  },
}));

// Mock the dependencies
vi.mock('../../../src/utils/image-validation');
vi.mock('../../../src/utils/image-processing');

// Mock config
vi.mock('../../../src/config/storage', () => ({
  cloudinaryConfig: {
    cloudName: 'test-cloud',
    apiKey: 'test-api-key',
    apiSecret: 'test-api-secret',
    folder: 'wine-cellar',
  },
  storageConfig: {
    maxFileSize: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageWidth: 1200,
    imageQuality: 85,
    outputFormat: 'jpeg',
  },
}));

import { CloudinaryStorageService } from '../../../src/services/storage/cloudinary-storage.service';
import { validateImage } from '../../../src/utils/image-validation';
import { optimizeImage } from '../../../src/utils/image-processing';
import { v2 as cloudinary } from 'cloudinary';

describe('CloudinaryStorageService', () => {
  let service: CloudinaryStorageService;
  const testWineId = 'test-wine-123';

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CloudinaryStorageService();
  });

  describe('constructor', () => {
    it('should configure cloudinary with credentials from config', () => {
      expect(cloudinary.config).toHaveBeenCalledWith({
        cloud_name: 'test-cloud',
        api_key: 'test-api-key',
        api_secret: 'test-api-secret',
      });
    });
  });

  describe('uploadImage', () => {
    it('should successfully upload an image to Cloudinary', async () => {
      const mockBuffer = Buffer.from('test-image-data');
      const mockOptimizedBuffer = Buffer.from('optimized-image-data');
      const mockMimeType = 'image/jpeg';

      vi.mocked(validateImage).mockResolvedValue(undefined);
      vi.mocked(optimizeImage).mockResolvedValue(mockOptimizedBuffer);

      // Mock upload_stream to call the callback with success
      vi.mocked(cloudinary.uploader.upload_stream).mockImplementation(
        (
          _options: unknown,
          callback: (
            error: Error | null,
            result?: { secure_url: string; bytes: number; format: string }
          ) => void
        ) => {
          // Simulate async upload completion
          setTimeout(() => {
            callback(null, {
              secure_url:
                'https://res.cloudinary.com/test-cloud/image/upload/wine-cellar/test-wine-123.jpg',
              bytes: mockOptimizedBuffer.length,
              format: 'jpg',
            });
          }, 0);
          // Return a mock writable stream
          return {
            end: vi.fn(),
          } as unknown as NodeJS.WritableStream;
        }
      );

      const result = await service.uploadImage(testWineId, mockBuffer, mockMimeType);

      expect(validateImage).toHaveBeenCalledWith(mockBuffer, mockMimeType);
      expect(optimizeImage).toHaveBeenCalledWith(mockBuffer);
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: 'wine-cellar',
          public_id: testWineId,
          resource_type: 'image',
        }),
        expect.any(Function)
      );
      expect(result).toEqual({
        imageUrl:
          'https://res.cloudinary.com/test-cloud/image/upload/wine-cellar/test-wine-123.jpg',
        fileSize: mockOptimizedBuffer.length,
        mimeType: 'image/jpeg',
      });
    });

    it('should propagate validation errors', async () => {
      const mockBuffer = Buffer.from('invalid-data');
      const mockMimeType = 'image/jpeg';
      const validationError = new Error('Invalid image');

      vi.mocked(validateImage).mockRejectedValue(validationError);

      await expect(service.uploadImage(testWineId, mockBuffer, mockMimeType)).rejects.toThrow(
        'Invalid image'
      );
    });

    it('should propagate optimization errors', async () => {
      const mockBuffer = Buffer.from('test-image-data');
      const mockMimeType = 'image/jpeg';
      const optimizationError = new Error('Optimization failed');

      vi.mocked(validateImage).mockResolvedValue(undefined);
      vi.mocked(optimizeImage).mockRejectedValue(optimizationError);

      await expect(service.uploadImage(testWineId, mockBuffer, mockMimeType)).rejects.toThrow(
        'Optimization failed'
      );
    });

    it('should handle Cloudinary upload errors', async () => {
      const mockBuffer = Buffer.from('test-image-data');
      const mockOptimizedBuffer = Buffer.from('optimized-image-data');
      const mockMimeType = 'image/jpeg';

      vi.mocked(validateImage).mockResolvedValue(undefined);
      vi.mocked(optimizeImage).mockResolvedValue(mockOptimizedBuffer);

      // Mock upload_stream to call the callback with error
      vi.mocked(cloudinary.uploader.upload_stream).mockImplementation(
        (_options: unknown, callback: (error: Error | null, result?: unknown) => void) => {
          setTimeout(() => {
            callback(new Error('Cloudinary upload failed'));
          }, 0);
          return {
            end: vi.fn(),
          } as unknown as NodeJS.WritableStream;
        }
      );

      await expect(service.uploadImage(testWineId, mockBuffer, mockMimeType)).rejects.toThrow(
        'Cloudinary upload failed'
      );
    });
  });

  describe('deleteImage', () => {
    it('should successfully delete an image from Cloudinary', async () => {
      vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: 'ok' });

      await expect(service.deleteImage(testWineId)).resolves.toBeUndefined();
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(`wine-cellar/${testWineId}`);
    });

    it('should silently ignore not_found errors (image does not exist)', async () => {
      vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: 'not found' });

      await expect(service.deleteImage(testWineId)).resolves.toBeUndefined();
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(`wine-cellar/${testWineId}`);
    });

    it('should propagate Cloudinary delete errors', async () => {
      vi.mocked(cloudinary.uploader.destroy).mockRejectedValue(
        new Error('Cloudinary delete failed')
      );

      await expect(service.deleteImage(testWineId)).rejects.toThrow('Cloudinary delete failed');
    });
  });

  describe('getImageUrl', () => {
    it('should return a Cloudinary URL for the wine image', () => {
      const mockUrl =
        'https://res.cloudinary.com/test-cloud/image/upload/wine-cellar/test-wine-123.jpg';
      vi.mocked(cloudinary.url).mockReturnValue(mockUrl);

      const url = service.getImageUrl(testWineId);

      expect(cloudinary.url).toHaveBeenCalledWith(`wine-cellar/${testWineId}`, {
        secure: true,
      });
      expect(url).toBe(mockUrl);
    });

    it('should handle different wine IDs', () => {
      const wineId = 'another-wine-456';
      const mockUrl =
        'https://res.cloudinary.com/test-cloud/image/upload/wine-cellar/another-wine-456.jpg';
      vi.mocked(cloudinary.url).mockReturnValue(mockUrl);

      const url = service.getImageUrl(wineId);

      expect(cloudinary.url).toHaveBeenCalledWith(`wine-cellar/${wineId}`, {
        secure: true,
      });
      expect(url).toBe(mockUrl);
    });
  });

  describe('imageExists', () => {
    it('should return true when image exists in Cloudinary', async () => {
      vi.mocked(cloudinary.api.resource).mockResolvedValue({
        public_id: `wine-cellar/${testWineId}`,
        resource_type: 'image',
      });

      const exists = await service.imageExists(testWineId);

      expect(exists).toBe(true);
      expect(cloudinary.api.resource).toHaveBeenCalledWith(`wine-cellar/${testWineId}`);
    });

    it('should return false when image does not exist in Cloudinary', async () => {
      vi.mocked(cloudinary.api.resource).mockRejectedValue(new Error('Resource not found'));

      const exists = await service.imageExists(testWineId);

      expect(exists).toBe(false);
      expect(cloudinary.api.resource).toHaveBeenCalledWith(`wine-cellar/${testWineId}`);
    });

    it('should return false for any Cloudinary API error', async () => {
      vi.mocked(cloudinary.api.resource).mockRejectedValue(new Error('Network error'));

      const exists = await service.imageExists(testWineId);

      expect(exists).toBe(false);
    });
  });
});
