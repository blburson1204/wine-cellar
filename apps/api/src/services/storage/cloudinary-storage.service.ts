import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryConfig } from '../../config/storage';
import { optimizeImage } from '../../utils/image-processing';
import { validateImage } from '../../utils/image-validation';
import { IStorageService, UploadResult } from './storage.interface';

/**
 * Cloudinary storage service for wine label images
 *
 * Stores images in Cloudinary cloud storage for production use
 */
export class CloudinaryStorageService implements IStorageService {
  private readonly folder: string;

  constructor() {
    // Configure Cloudinary with credentials
    cloudinary.config({
      cloud_name: cloudinaryConfig.cloudName,
      api_key: cloudinaryConfig.apiKey,
      api_secret: cloudinaryConfig.apiSecret,
    });

    this.folder = cloudinaryConfig.folder;
  }

  /**
   * Upload and store a wine label image to Cloudinary
   *
   * @param wineId - The ID of the wine
   * @param buffer - Image data
   * @param mimeType - Original MIME type
   * @returns Upload result with Cloudinary URL
   */
  async uploadImage(wineId: string, buffer: Buffer, mimeType: string): Promise<UploadResult> {
    // Validate the image
    await validateImage(buffer, mimeType);

    // Optimize the image (resize, compress, convert to JPEG)
    const optimizedBuffer = await optimizeImage(buffer);

    // Upload to Cloudinary using upload_stream
    const result = await this.uploadToCloudinary(wineId, optimizedBuffer);

    return {
      imageUrl: result.secure_url,
      fileSize: result.bytes,
      mimeType: 'image/jpeg',
    };
  }

  /**
   * Upload buffer to Cloudinary using stream
   */
  private uploadToCloudinary(
    wineId: string,
    buffer: Buffer
  ): Promise<{ secure_url: string; bytes: number; format: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: this.folder,
          public_id: wineId,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('Upload failed: no result returned'));
          }
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Delete a wine label image from Cloudinary
   *
   * @param wineId - The ID of the wine
   */
  async deleteImage(wineId: string): Promise<void> {
    const publicId = `${this.folder}/${wineId}`;
    await cloudinary.uploader.destroy(publicId);
    // Note: Cloudinary returns { result: 'ok' } or { result: 'not found' }
    // Both are acceptable - we don't throw for not found
  }

  /**
   * Get the URL for accessing a wine's image
   *
   * @param wineId - The ID of the wine
   * @returns Cloudinary URL
   */
  getImageUrl(wineId: string): string {
    const publicId = `${this.folder}/${wineId}`;
    return cloudinary.url(publicId, {
      secure: true,
    });
  }

  /**
   * Check if an image exists for a wine in Cloudinary
   *
   * @param wineId - The ID of the wine
   * @returns true if exists, false otherwise
   */
  async imageExists(wineId: string): Promise<boolean> {
    const publicId = `${this.folder}/${wineId}`;
    try {
      await cloudinary.api.resource(publicId);
      return true;
    } catch {
      // Any error means the image doesn't exist or can't be accessed
      return false;
    }
  }
}
