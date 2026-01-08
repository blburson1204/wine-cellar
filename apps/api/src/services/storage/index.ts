import { LocalStorageService } from './local-storage.service';
import { IStorageService } from './storage.interface';
// import { S3StorageService } from './s3-storage.service'; // Phase 4

/**
 * Create and return the appropriate storage service based on configuration
 *
 * Currently returns LocalStorageService for all environments.
 * In Phase 4, this will check for S3 configuration and return S3StorageService
 * when appropriate.
 *
 * @returns Storage service instance
 */
export function createStorageService(): IStorageService {
  // Phase 4: Add S3 support
  // if (useS3) {
  //   return new S3StorageService();
  // }

  return new LocalStorageService();
}

// Export singleton instance
export const storageService = createStorageService();

// Export types and interfaces
export * from './storage.interface';
