import { getStorageProvider, isCloudinaryConfigured } from '../../config/storage';
import { CloudinaryStorageService } from './cloudinary-storage.service';
import { LocalStorageService } from './local-storage.service';
import { IStorageService } from './storage.interface';

/**
 * Create and return the appropriate storage service based on configuration
 *
 * Uses STORAGE_PROVIDER env var to determine which service to use:
 * - 'cloudinary': Uses CloudinaryStorageService (requires Cloudinary credentials)
 * - 'local' (default): Uses LocalStorageService
 *
 * @returns Storage service instance
 */
export function createStorageService(): IStorageService {
  const provider = getStorageProvider();

  if (provider === 'cloudinary') {
    if (!isCloudinaryConfigured()) {
      console.warn(
        'STORAGE_PROVIDER=cloudinary but Cloudinary credentials are missing. Falling back to local storage.'
      );
      return new LocalStorageService();
    }
    return new CloudinaryStorageService();
  }

  return new LocalStorageService();
}

// Export singleton instance
export const storageService = createStorageService();

// Export types and interfaces
export * from './storage.interface';
