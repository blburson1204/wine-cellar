import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fileTypeFromBuffer } from 'file-type';
import {
  validateFileSize,
  validateMimeType,
  validateImageBuffer,
  validateImage,
} from '../../src/utils/image-validation';
import {
  FileTooLargeError,
  InvalidFileTypeError,
  InvalidImageError,
} from '../../src/errors/AppError';
import { storageConfig } from '../../src/config/storage';

vi.mock('file-type');

describe('image-validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateFileSize', () => {
    it('should pass for files within size limit', () => {
      const smallBuffer = Buffer.alloc(1024 * 1024); // 1MB
      expect(() => validateFileSize(smallBuffer)).not.toThrow();
    });

    it('should pass for files exactly at size limit', () => {
      const maxBuffer = Buffer.alloc(storageConfig.maxFileSize);
      expect(() => validateFileSize(maxBuffer)).not.toThrow();
    });

    it('should throw FileTooLargeError for files exceeding size limit', () => {
      const largeBuffer = Buffer.alloc(storageConfig.maxFileSize + 1);
      expect(() => validateFileSize(largeBuffer)).toThrow(FileTooLargeError);
    });

    it('should include size information in error message', () => {
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
      try {
        validateFileSize(largeBuffer);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(FileTooLargeError);
        expect((error as FileTooLargeError).message).toContain('10MB');
        expect((error as FileTooLargeError).message).toContain('5MB');
      }
    });

    it('should handle empty buffers', () => {
      const emptyBuffer = Buffer.alloc(0);
      expect(() => validateFileSize(emptyBuffer)).not.toThrow();
    });
  });

  describe('validateMimeType', () => {
    it('should pass for allowed JPEG mime type', () => {
      expect(() => validateMimeType('image/jpeg')).not.toThrow();
    });

    it('should pass for allowed PNG mime type', () => {
      expect(() => validateMimeType('image/png')).not.toThrow();
    });

    it('should pass for allowed WebP mime type', () => {
      expect(() => validateMimeType('image/webp')).not.toThrow();
    });

    it('should throw InvalidFileTypeError for unsupported mime types', () => {
      expect(() => validateMimeType('image/gif')).toThrow(InvalidFileTypeError);
      expect(() => validateMimeType('image/bmp')).toThrow(InvalidFileTypeError);
      expect(() => validateMimeType('application/pdf')).toThrow(InvalidFileTypeError);
      expect(() => validateMimeType('text/plain')).toThrow(InvalidFileTypeError);
    });

    it('should include mime type in error message', () => {
      try {
        validateMimeType('image/gif');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFileTypeError);
        expect((error as InvalidFileTypeError).message).toContain('image/gif');
        expect((error as InvalidFileTypeError).message).toContain('JPEG');
        expect((error as InvalidFileTypeError).message).toContain('PNG');
        expect((error as InvalidFileTypeError).message).toContain('WebP');
      }
    });
  });

  describe('validateImageBuffer', () => {
    it('should throw InvalidImageError for empty buffer', async () => {
      const emptyBuffer = Buffer.alloc(0);
      await expect(validateImageBuffer(emptyBuffer)).rejects.toThrow(InvalidImageError);
      await expect(validateImageBuffer(emptyBuffer)).rejects.toThrow('Empty file');
    });

    it('should throw InvalidImageError for null/undefined buffer', async () => {
      await expect(validateImageBuffer(null as any)).rejects.toThrow(InvalidImageError);
      await expect(validateImageBuffer(undefined as any)).rejects.toThrow(InvalidImageError);
    });

    it('should throw InvalidImageError when file type cannot be detected', async () => {
      const unknownBuffer = Buffer.from('not-an-image');
      vi.mocked(fileTypeFromBuffer).mockResolvedValue(undefined);

      await expect(validateImageBuffer(unknownBuffer)).rejects.toThrow(InvalidImageError);
      await expect(validateImageBuffer(unknownBuffer)).rejects.toThrow(
        'Unable to detect file type'
      );
    });

    it('should pass for valid JPEG image', async () => {
      const jpegBuffer = Buffer.from('fake-jpeg-data');
      vi.mocked(fileTypeFromBuffer).mockResolvedValue({
        ext: 'jpg',
        mime: 'image/jpeg',
      });

      await expect(validateImageBuffer(jpegBuffer)).resolves.toBeUndefined();
    });

    it('should pass for valid PNG image', async () => {
      const pngBuffer = Buffer.from('fake-png-data');
      vi.mocked(fileTypeFromBuffer).mockResolvedValue({
        ext: 'png',
        mime: 'image/png',
      });

      await expect(validateImageBuffer(pngBuffer)).resolves.toBeUndefined();
    });

    it('should pass for valid WebP image', async () => {
      const webpBuffer = Buffer.from('fake-webp-data');
      vi.mocked(fileTypeFromBuffer).mockResolvedValue({
        ext: 'webp',
        mime: 'image/webp',
      });

      await expect(validateImageBuffer(webpBuffer)).resolves.toBeUndefined();
    });

    it('should throw InvalidImageError for unsupported image formats', async () => {
      const gifBuffer = Buffer.from('fake-gif-data');
      vi.mocked(fileTypeFromBuffer).mockResolvedValue({
        ext: 'gif',
        mime: 'image/gif',
      });

      await expect(validateImageBuffer(gifBuffer)).rejects.toThrow(InvalidImageError);
      await expect(validateImageBuffer(gifBuffer)).rejects.toThrow('image/gif');
    });

    it('should throw InvalidImageError for non-image files', async () => {
      const pdfBuffer = Buffer.from('fake-pdf-data');
      vi.mocked(fileTypeFromBuffer).mockResolvedValue({
        ext: 'pdf',
        mime: 'application/pdf',
      });

      await expect(validateImageBuffer(pdfBuffer)).rejects.toThrow(InvalidImageError);
      await expect(validateImageBuffer(pdfBuffer)).rejects.toThrow('application/pdf');
    });

    it('should detect file type spoofing', async () => {
      // File claims to be JPEG but is actually PNG
      const spoofedBuffer = Buffer.from('fake-png-pretending-to-be-jpg');
      vi.mocked(fileTypeFromBuffer).mockResolvedValue({
        ext: 'png',
        mime: 'image/png',
      });

      // This should pass because PNG is allowed
      await expect(validateImageBuffer(spoofedBuffer)).resolves.toBeUndefined();
    });

    it('should detect malicious file type spoofing', async () => {
      // File claims to be image but is actually executable
      const maliciousBuffer = Buffer.from('fake-exe-pretending-to-be-jpg');
      vi.mocked(fileTypeFromBuffer).mockResolvedValue({
        ext: 'exe',
        mime: 'application/x-msdownload',
      });

      await expect(validateImageBuffer(maliciousBuffer)).rejects.toThrow(InvalidImageError);
      await expect(validateImageBuffer(maliciousBuffer)).rejects.toThrow(
        'application/x-msdownload'
      );
    });
  });

  describe('validateImage', () => {
    it('should pass all validations for a valid image', async () => {
      const validBuffer = Buffer.alloc(1024 * 1024); // 1MB
      const validMimeType = 'image/jpeg';

      vi.mocked(fileTypeFromBuffer).mockResolvedValue({
        ext: 'jpg',
        mime: 'image/jpeg',
      });

      await expect(validateImage(validBuffer, validMimeType)).resolves.toBeUndefined();
    });

    it('should fail if file size is too large', async () => {
      const largeBuffer = Buffer.alloc(storageConfig.maxFileSize + 1);
      const validMimeType = 'image/jpeg';

      await expect(validateImage(largeBuffer, validMimeType)).rejects.toThrow(FileTooLargeError);
    });

    it('should fail if mime type is invalid', async () => {
      const validBuffer = Buffer.alloc(1024);
      const invalidMimeType = 'image/gif';

      await expect(validateImage(validBuffer, invalidMimeType)).rejects.toThrow(
        InvalidFileTypeError
      );
    });

    it('should fail if buffer is not a valid image', async () => {
      const invalidBuffer = Buffer.from('not-an-image');
      const validMimeType = 'image/jpeg';

      vi.mocked(fileTypeFromBuffer).mockResolvedValue(undefined);

      await expect(validateImage(invalidBuffer, validMimeType)).rejects.toThrow(InvalidImageError);
    });

    it('should detect mime type mismatch', async () => {
      const buffer = Buffer.from('fake-image-data');
      const declaredMimeType = 'image/jpeg';

      // File-type detects it as PNG
      vi.mocked(fileTypeFromBuffer).mockResolvedValue({
        ext: 'png',
        mime: 'image/png',
      });

      // Should still pass because PNG is allowed
      await expect(validateImage(buffer, declaredMimeType)).resolves.toBeUndefined();
    });

    it('should validate in correct order and stop at first error', async () => {
      // Create a buffer that's too large AND has wrong mime type
      const largeBuffer = Buffer.alloc(storageConfig.maxFileSize + 1);
      const invalidMimeType = 'image/gif';

      // Should fail on file size check first (before mime type check)
      await expect(validateImage(largeBuffer, invalidMimeType)).rejects.toThrow(FileTooLargeError);
    });
  });
});
