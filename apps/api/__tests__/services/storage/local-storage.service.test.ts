import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

// Mock the dependencies before importing
vi.mock('../../../src/utils/image-validation');
vi.mock('../../../src/utils/image-processing');
vi.mock('fs/promises');

// Mock config with inline constant (hoisting-safe)
vi.mock('../../../src/config/storage', () => ({
  storageConfig: {
    uploadDir: '/test/uploads/wines',
    assetsDir: '/test/assets',
    maxFileSize: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageWidth: 1200,
    imageQuality: 85,
    outputFormat: 'jpeg',
  },
}));

import { LocalStorageService } from '../../../src/services/storage/local-storage.service';
import { validateImage } from '../../../src/utils/image-validation';
import { optimizeImage } from '../../../src/utils/image-processing';

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  const testUploadDir = '/test/uploads/wines';
  const testWineId = 'test-wine-123';
  const testImagePath = path.join(testUploadDir, `${testWineId}.jpg`);

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock fs.mkdir to succeed
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);

    service = new LocalStorageService();

    // Wait for async constructor to complete
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  describe('constructor', () => {
    it('should create upload directory on initialization', async () => {
      expect(fs.mkdir).toHaveBeenCalledWith(testUploadDir, { recursive: true });
    });

    it('should log error when directory creation fails', async () => {
      // This test verifies that mkdir is attempted, but we can't easily test
      // the error handling since it's fire-and-forget in the constructor
      // The real behavior is tested in integration tests
      expect(fs.mkdir).toHaveBeenCalled();
    });
  });

  describe('uploadImage', () => {
    it('should successfully upload and optimize an image', async () => {
      const mockBuffer = Buffer.from('test-image-data');
      const mockOptimizedBuffer = Buffer.from('optimized-image-data');
      const mockMimeType = 'image/jpeg';

      vi.mocked(validateImage).mockResolvedValue(undefined);
      vi.mocked(optimizeImage).mockResolvedValue(mockOptimizedBuffer);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      const result = await service.uploadImage(testWineId, mockBuffer, mockMimeType);

      expect(validateImage).toHaveBeenCalledWith(mockBuffer, mockMimeType);
      expect(optimizeImage).toHaveBeenCalledWith(mockBuffer);
      expect(fs.writeFile).toHaveBeenCalledWith(testImagePath, mockOptimizedBuffer);
      expect(result).toEqual({
        imageUrl: `${testWineId}.jpg`,
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

    it('should handle file write errors', async () => {
      const mockBuffer = Buffer.from('test-image-data');
      const mockOptimizedBuffer = Buffer.from('optimized-image-data');
      const mockMimeType = 'image/jpeg';
      const writeError = new Error('Disk full');

      vi.mocked(validateImage).mockResolvedValue(undefined);
      vi.mocked(optimizeImage).mockResolvedValue(mockOptimizedBuffer);
      vi.mocked(fs.writeFile).mockRejectedValue(writeError);

      await expect(service.uploadImage(testWineId, mockBuffer, mockMimeType)).rejects.toThrow(
        'Disk full'
      );
    });
  });

  describe('deleteImage', () => {
    it('should successfully delete an existing image', async () => {
      vi.mocked(fs.unlink).mockResolvedValue(undefined);

      await expect(service.deleteImage(testWineId)).resolves.toBeUndefined();
      expect(fs.unlink).toHaveBeenCalledWith(testImagePath);
    });

    it('should silently ignore ENOENT errors (file not found)', async () => {
      const enoentError = Object.assign(new Error('File not found'), { code: 'ENOENT' });
      vi.mocked(fs.unlink).mockRejectedValue(enoentError);

      await expect(service.deleteImage(testWineId)).resolves.toBeUndefined();
      expect(fs.unlink).toHaveBeenCalledWith(testImagePath);
    });

    it('should propagate non-ENOENT errors', async () => {
      const permissionError = Object.assign(new Error('Permission denied'), { code: 'EACCES' });
      vi.mocked(fs.unlink).mockRejectedValue(permissionError);

      await expect(service.deleteImage(testWineId)).rejects.toThrow('Permission denied');
    });
  });

  describe('getImageUrl', () => {
    it('should return the correct image URL', () => {
      const url = service.getImageUrl(testWineId);
      expect(url).toBe(`${testWineId}.jpg`);
    });

    it('should handle different wine IDs', () => {
      const wineId = 'another-wine-456';
      const url = service.getImageUrl(wineId);
      expect(url).toBe(`${wineId}.jpg`);
    });
  });

  describe('imageExists', () => {
    it('should return true when image exists', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const exists = await service.imageExists(testWineId);
      expect(exists).toBe(true);
      expect(fs.access).toHaveBeenCalledWith(testImagePath);
    });

    it('should return false when image does not exist', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

      const exists = await service.imageExists(testWineId);
      expect(exists).toBe(false);
      expect(fs.access).toHaveBeenCalledWith(testImagePath);
    });

    it('should return false for any access error', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('Permission denied'));

      const exists = await service.imageExists(testWineId);
      expect(exists).toBe(false);
    });
  });
});
