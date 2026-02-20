import { describe, it, expect, beforeEach, vi } from 'vitest';
import sharp from 'sharp';
import {
  getImageMetadata,
  optimizeImage,
  generateThumbnail,
} from '../../src/utils/image-processing';
import { storageConfig } from '../../src/config/storage';

vi.mock('sharp');

describe('image-processing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getImageMetadata', () => {
    it('should extract metadata from an image buffer', async () => {
      const mockBuffer = Buffer.from('test-image');
      const mockMetadata = {
        width: 1920,
        height: 1080,
        format: 'jpeg',
      };

      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue(mockMetadata),
      };
      vi.mocked(sharp).mockReturnValue(mockSharpInstance as any);

      const result = await getImageMetadata(mockBuffer);

      expect(sharp).toHaveBeenCalledWith(mockBuffer);
      expect(mockSharpInstance.metadata).toHaveBeenCalled();
      expect(result).toEqual({
        width: 1920,
        height: 1080,
        format: 'jpeg',
      });
    });

    it('should handle missing dimensions', async () => {
      const mockBuffer = Buffer.from('test-image');
      const mockMetadata = {
        format: 'png',
      };

      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue(mockMetadata),
      };
      vi.mocked(sharp).mockReturnValue(mockSharpInstance as any);

      const result = await getImageMetadata(mockBuffer);

      expect(result).toEqual({
        width: 0,
        height: 0,
        format: 'png',
      });
    });

    it('should handle missing format', async () => {
      const mockBuffer = Buffer.from('test-image');
      const mockMetadata = {
        width: 800,
        height: 600,
      };

      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue(mockMetadata),
      };
      vi.mocked(sharp).mockReturnValue(mockSharpInstance as any);

      const result = await getImageMetadata(mockBuffer);

      expect(result).toEqual({
        width: 800,
        height: 600,
        format: 'unknown',
      });
    });
  });

  describe('optimizeImage', () => {
    it('should optimize image without resizing if under max width', async () => {
      const mockBuffer = Buffer.from('test-image');
      const mockOptimizedBuffer = Buffer.from('optimized-image');

      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue({
          width: 800,
          height: 600,
          orientation: 1,
        }),
        resize: vi.fn().mockReturnThis(),
        jpeg: vi.fn().mockReturnThis(),
        withMetadata: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(mockOptimizedBuffer),
      };

      vi.mocked(sharp).mockReturnValue(mockSharpInstance as any);

      const result = await optimizeImage(mockBuffer);

      expect(sharp).toHaveBeenCalledWith(mockBuffer);
      expect(mockSharpInstance.metadata).toHaveBeenCalled();
      expect(mockSharpInstance.resize).not.toHaveBeenCalled();
      expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({
        quality: storageConfig.imageQuality,
        progressive: true,
      });
      expect(mockSharpInstance.withMetadata).toHaveBeenCalledWith({
        orientation: 1,
      });
      expect(result).toBe(mockOptimizedBuffer);
    });

    it('should resize image if wider than max width', async () => {
      const mockBuffer = Buffer.from('large-image');
      const mockOptimizedBuffer = Buffer.from('optimized-image');

      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue({
          width: 2400,
          height: 1800,
          orientation: 1,
        }),
        resize: vi.fn().mockReturnThis(),
        jpeg: vi.fn().mockReturnThis(),
        withMetadata: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(mockOptimizedBuffer),
      };

      vi.mocked(sharp).mockReturnValue(mockSharpInstance as any);

      const result = await optimizeImage(mockBuffer);

      expect(mockSharpInstance.resize).toHaveBeenCalledWith(
        storageConfig.maxImageWidth,
        undefined,
        {
          fit: 'inside',
          withoutEnlargement: true,
        }
      );
      expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({
        quality: storageConfig.imageQuality,
        progressive: true,
      });
      expect(result).toBe(mockOptimizedBuffer);
    });

    it('should resize image if exactly at max width', async () => {
      const mockBuffer = Buffer.from('exact-width-image');
      const mockOptimizedBuffer = Buffer.from('optimized-image');

      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue({
          width: storageConfig.maxImageWidth,
          height: 900,
          orientation: 1,
        }),
        resize: vi.fn().mockReturnThis(),
        jpeg: vi.fn().mockReturnThis(),
        withMetadata: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(mockOptimizedBuffer),
      };

      vi.mocked(sharp).mockReturnValue(mockSharpInstance as any);

      const result = await optimizeImage(mockBuffer);

      // Should not resize if exactly at max width
      expect(mockSharpInstance.resize).not.toHaveBeenCalled();
      expect(result).toBe(mockOptimizedBuffer);
    });

    it('should preserve orientation metadata', async () => {
      const mockBuffer = Buffer.from('test-image');
      const mockOptimizedBuffer = Buffer.from('optimized-image');

      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue({
          width: 800,
          height: 600,
          orientation: 6, // Rotated 90 degrees
        }),
        resize: vi.fn().mockReturnThis(),
        jpeg: vi.fn().mockReturnThis(),
        withMetadata: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(mockOptimizedBuffer),
      };

      vi.mocked(sharp).mockReturnValue(mockSharpInstance as any);

      await optimizeImage(mockBuffer);

      expect(mockSharpInstance.withMetadata).toHaveBeenCalledWith({
        orientation: 6,
      });
    });

    it('should handle images without orientation', async () => {
      const mockBuffer = Buffer.from('test-image');
      const mockOptimizedBuffer = Buffer.from('optimized-image');

      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue({
          width: 800,
          height: 600,
        }),
        resize: vi.fn().mockReturnThis(),
        jpeg: vi.fn().mockReturnThis(),
        withMetadata: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(mockOptimizedBuffer),
      };

      vi.mocked(sharp).mockReturnValue(mockSharpInstance as any);

      await optimizeImage(mockBuffer);

      expect(mockSharpInstance.withMetadata).toHaveBeenCalledWith({
        orientation: undefined,
      });
    });

    it('should convert all formats to JPEG', async () => {
      const mockBuffer = Buffer.from('png-image');
      const mockOptimizedBuffer = Buffer.from('jpeg-image');

      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue({
          width: 800,
          height: 600,
          format: 'png',
          orientation: 1,
        }),
        resize: vi.fn().mockReturnThis(),
        jpeg: vi.fn().mockReturnThis(),
        withMetadata: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(mockOptimizedBuffer),
      };

      vi.mocked(sharp).mockReturnValue(mockSharpInstance as any);

      await optimizeImage(mockBuffer);

      expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({
        quality: storageConfig.imageQuality,
        progressive: true,
      });
    });
  });

  describe('generateThumbnail', () => {
    it('should generate thumbnail with width and height using cover fit', async () => {
      const mockBuffer = Buffer.from('test-image');
      const mockThumbnailBuffer = Buffer.from('thumbnail-image');

      const mockSharpInstance = {
        resize: vi.fn().mockReturnThis(),
        jpeg: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(mockThumbnailBuffer),
      };

      vi.mocked(sharp).mockReturnValue(mockSharpInstance as any);

      const result = await generateThumbnail(mockBuffer, 200, 150);

      expect(sharp).toHaveBeenCalledWith(mockBuffer);
      expect(mockSharpInstance.resize).toHaveBeenCalledWith(200, 150, {
        fit: 'cover',
        position: 'center',
      });
      expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({
        quality: 80,
        progressive: true,
      });
      expect(result).toBe(mockThumbnailBuffer);
    });

    it('should generate thumbnail with only width (aspect ratio preserved)', async () => {
      const mockBuffer = Buffer.from('test-image');
      const mockThumbnailBuffer = Buffer.from('thumbnail-image');

      const mockSharpInstance = {
        resize: vi.fn().mockReturnThis(),
        jpeg: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(mockThumbnailBuffer),
      };

      vi.mocked(sharp).mockReturnValue(mockSharpInstance as any);

      const result = await generateThumbnail(mockBuffer, 200);

      expect(mockSharpInstance.resize).toHaveBeenCalledWith(200, undefined, {
        fit: 'cover',
        position: 'center',
      });
      expect(result).toBe(mockThumbnailBuffer);
    });
  });
});
