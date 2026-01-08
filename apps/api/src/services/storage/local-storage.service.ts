import fs from 'fs/promises';
import path from 'path';
import { storageConfig } from '../../config/storage';
import { optimizeImage } from '../../utils/image-processing';
import { validateImage } from '../../utils/image-validation';
import { IStorageService, UploadResult } from './storage.interface';

/**
 * Local filesystem storage service for wine label images
 *
 * Stores images in the local filesystem under the configured upload directory
 */
export class LocalStorageService implements IStorageService {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = storageConfig.uploadDir;
    this.ensureUploadDirExists();
  }

  /**
   * Ensure the upload directory exists, create it if it doesn't
   */
  private async ensureUploadDirExists(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directory:', error);
      throw new Error('Storage initialization failed');
    }
  }

  /**
   * Get the file path for a wine's image
   *
   * @param wineId - Wine ID
   * @returns Full file path
   */
  private getImagePath(wineId: string): string {
    // Store as JPEG with wine ID as filename
    return path.join(this.uploadDir, `${wineId}.jpg`);
  }

  /**
   * Upload and store a wine label image
   *
   * @param wineId - The ID of the wine
   * @param buffer - Image data
   * @param mimeType - Original MIME type
   * @returns Upload result
   */
  async uploadImage(wineId: string, buffer: Buffer, mimeType: string): Promise<UploadResult> {
    // Validate the image
    await validateImage(buffer, mimeType);

    // Optimize the image (resize, compress, convert to JPEG)
    const optimizedBuffer = await optimizeImage(buffer);

    // Get the file path
    const imagePath = this.getImagePath(wineId);

    // Write to disk
    await fs.writeFile(imagePath, optimizedBuffer);

    // Return upload result
    return {
      imageUrl: `${wineId}.jpg`,
      fileSize: optimizedBuffer.length,
      mimeType: 'image/jpeg',
    };
  }

  /**
   * Delete a wine label image
   *
   * @param wineId - The ID of the wine
   */
  async deleteImage(wineId: string): Promise<void> {
    const imagePath = this.getImagePath(wineId);

    try {
      await fs.unlink(imagePath);
    } catch (error: any) {
      // Ignore if file doesn't exist
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Get the URL for accessing a wine's image
   *
   * @param wineId - The ID of the wine
   * @returns URL path
   */
  getImageUrl(wineId: string): string {
    return `${wineId}.jpg`;
  }

  /**
   * Check if an image exists for a wine
   *
   * @param wineId - The ID of the wine
   * @returns true if exists, false otherwise
   */
  async imageExists(wineId: string): Promise<boolean> {
    const imagePath = this.getImagePath(wineId);

    try {
      await fs.access(imagePath);
      return true;
    } catch {
      return false;
    }
  }
}
