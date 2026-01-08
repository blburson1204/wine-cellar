import path from 'path';

/**
 * Storage configuration for wine label images
 */
export const storageConfig = {
  // Upload directory for new images (development and production)
  uploadDir: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads/wines'),

  // Existing assets directory (for images already downloaded)
  assetsDir: path.join(process.cwd(), '../..', 'assets/wine-labels'),

  // Maximum file size (5MB)
  maxFileSize: 5 * 1024 * 1024,

  // Allowed MIME types
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,

  // Image optimization settings
  maxImageWidth: 1200, // Resize larger images to this width
  imageQuality: 85, // JPEG quality (1-100)

  // Convert all images to JPEG for consistency
  outputFormat: 'jpeg' as const,
};

/**
 * Environment helpers
 */
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * AWS S3 configuration (for Phase 4)
 * Currently not used - will be implemented in production phase
 */
export const useS3 = isProduction && !!process.env.AWS_S3_BUCKET;

export const s3Config = {
  bucket: process.env.AWS_S3_BUCKET || '',
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
};
