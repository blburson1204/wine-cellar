/**
 * Result of an image upload operation
 */
export interface UploadResult {
  /** Filename or URL of the uploaded image */
  imageUrl: string;

  /** Size of the stored file in bytes */
  fileSize: number;

  /** MIME type of the stored image */
  mimeType: string;
}

/**
 * Storage service interface for wine label images
 *
 * Provides a unified interface for different storage backends
 * (local filesystem, AWS S3, etc.)
 */
export interface IStorageService {
  /**
   * Upload and store a wine label image
   *
   * @param wineId - The ID of the wine this image belongs to
   * @param buffer - Image data as a Buffer
   * @param mimeType - Original MIME type of the uploaded image
   * @returns Upload result with image URL and metadata
   * @throws {Error} If upload fails
   */
  uploadImage(wineId: string, buffer: Buffer, mimeType: string): Promise<UploadResult>;

  /**
   * Delete a wine label image
   *
   * @param wineId - The ID of the wine whose image should be deleted
   * @throws {Error} If deletion fails (ignores if file doesn't exist)
   */
  deleteImage(wineId: string): Promise<void>;

  /**
   * Get the URL for accessing a wine's image
   *
   * @param wineId - The ID of the wine
   * @returns URL or path to access the image
   */
  getImageUrl(wineId: string): string;

  /**
   * Check if an image exists for a wine
   *
   * @param wineId - The ID of the wine
   * @returns true if the image exists, false otherwise
   */
  imageExists(wineId: string): Promise<boolean>;
}
