import sharp from 'sharp';
import { storageConfig } from '../config/storage';

/**
 * Image metadata extracted from a buffer
 */
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
}

/**
 * Get metadata from an image buffer
 *
 * @param buffer - Image buffer
 * @returns Image metadata (width, height, format)
 */
export async function getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
  const metadata = await sharp(buffer).metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
  };
}

/**
 * Optimize an image buffer
 *
 * Performs the following optimizations:
 * - Resizes to maximum width while preserving aspect ratio
 * - Converts to JPEG format for consistency
 * - Compresses with specified quality
 * - Strips EXIF metadata for privacy and size reduction
 *
 * @param buffer - Original image buffer
 * @returns Optimized image buffer
 */
export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  let image = sharp(buffer);

  // Get original dimensions
  const metadata = await image.metadata();

  // Resize if wider than max width (preserving aspect ratio)
  if (metadata.width && metadata.width > storageConfig.maxImageWidth) {
    image = image.resize(storageConfig.maxImageWidth, undefined, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert to JPEG, compress, and strip metadata
  const optimized = await image
    .jpeg({
      quality: storageConfig.imageQuality,
      progressive: true, // Progressive JPEG for better loading experience
    })
    .withMetadata({
      // Strip all metadata except orientation
      orientation: metadata.orientation,
    })
    .toBuffer();

  return optimized;
}

/**
 * Generate a thumbnail from an image buffer
 *
 * Note: This will be used in Phase 3 for table thumbnails
 *
 * @param buffer - Original image buffer
 * @param width - Thumbnail width in pixels
 * @param height - Thumbnail height in pixels (optional, maintains aspect ratio if not provided)
 * @returns Thumbnail image buffer
 */
export async function generateThumbnail(
  buffer: Buffer,
  width: number,
  height?: number
): Promise<Buffer> {
  return sharp(buffer)
    .resize(width, height, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({
      quality: 80,
      progressive: true,
    })
    .toBuffer();
}
