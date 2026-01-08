import { fileTypeFromBuffer } from 'file-type';
import { storageConfig } from '../config/storage';
import { FileTooLargeError, InvalidFileTypeError, InvalidImageError } from '../errors/AppError';

/**
 * Validate file size against maximum allowed size
 *
 * @param buffer - File buffer to validate
 * @throws {FileTooLargeError} If file exceeds maximum size
 */
export function validateFileSize(buffer: Buffer): void {
  if (buffer.length > storageConfig.maxFileSize) {
    throw new FileTooLargeError(buffer.length, storageConfig.maxFileSize);
  }
}

/**
 * Validate MIME type against allowed types
 *
 * @param mimeType - MIME type to validate
 * @throws {InvalidFileTypeError} If MIME type is not allowed
 */
export function validateMimeType(mimeType: string): void {
  if (!storageConfig.allowedMimeTypes.includes(mimeType as any)) {
    throw new InvalidFileTypeError(mimeType);
  }
}

/**
 * Validate image buffer by checking magic numbers (file signature)
 *
 * This provides additional security by verifying the file is actually
 * an image and not just a renamed file with an image extension
 *
 * @param buffer - Image buffer to validate
 * @throws {InvalidImageError} If buffer is not a valid image
 */
export async function validateImageBuffer(buffer: Buffer): Promise<void> {
  // Check if buffer is empty
  if (!buffer || buffer.length === 0) {
    throw new InvalidImageError('Empty file');
  }

  // Use file-type to detect actual file type from magic numbers
  const fileType = await fileTypeFromBuffer(buffer);

  if (!fileType) {
    throw new InvalidImageError('Unable to detect file type');
  }

  // Verify the detected type matches our allowed types
  if (!storageConfig.allowedMimeTypes.includes(fileType.mime as any)) {
    throw new InvalidImageError(
      `File appears to be ${fileType.mime}, which is not a supported image format`
    );
  }
}

/**
 * Validate all aspects of an uploaded image file
 *
 * @param buffer - Image buffer to validate
 * @param mimeType - Declared MIME type from upload
 * @throws {FileTooLargeError} If file is too large
 * @throws {InvalidFileTypeError} If MIME type is not allowed
 * @throws {InvalidImageError} If file is not a valid image
 */
export async function validateImage(buffer: Buffer, mimeType: string): Promise<void> {
  validateFileSize(buffer);
  validateMimeType(mimeType);
  await validateImageBuffer(buffer);
}
