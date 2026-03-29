import path from 'path';

/**
 * Environment helpers
 */
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
export const isTest = process.env.NODE_ENV === 'test';

/**
 * Storage provider type
 */
export type StorageProvider = 'local' | 'cloudinary';

/**
 * Get the configured storage provider
 * Defaults to 'local' when STORAGE_PROVIDER is not set
 */
export const getStorageProvider = (): StorageProvider => {
  const provider = process.env.STORAGE_PROVIDER?.toLowerCase();
  if (provider === 'cloudinary') {
    return 'cloudinary';
  }
  return 'local';
};

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
 * Cloudinary configuration
 * Required when STORAGE_PROVIDER=cloudinary
 */
export const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  folder: process.env.CLOUDINARY_FOLDER || 'wine-cellar',
};

/**
 * Check if Cloudinary is properly configured
 */
export const isCloudinaryConfigured = (): boolean => {
  return !!(cloudinaryConfig.cloudName && cloudinaryConfig.apiKey && cloudinaryConfig.apiSecret);
};

/**
 * AWS S3 configuration (legacy - not currently used)
 */
export const useS3 = isProduction && !!process.env.AWS_S3_BUCKET;

export const s3Config = {
  bucket: process.env.AWS_S3_BUCKET || '',
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
};
