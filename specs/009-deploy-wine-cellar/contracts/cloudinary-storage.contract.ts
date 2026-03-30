/**
 * Contract: CloudinaryStorageService
 *
 * Implements IStorageService for Cloudinary cloud storage.
 * This contract defines the expected interface — tests written against
 * this contract should fail until implementation exists.
 */

import type { IStorageService } from '../../../apps/api/src/services/storage/storage.interface';

/**
 * CloudinaryStorageService must implement IStorageService
 *
 * Expected behavior:
 * - uploadImage: validates → optimizes (Sharp) → uploads buffer to Cloudinary → returns UploadResult with secure_url
 * - deleteImage: deletes from Cloudinary by public_id (wine-cellar/wines/{wineId})
 * - getImageUrl: returns Cloudinary URL pattern for wineId
 * - imageExists: checks Cloudinary resource exists via API
 *
 * Configuration (from environment):
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 *
 * Cloudinary folder structure:
 * - Folder: wine-cellar/wines/
 * - Public ID: wine-cellar/wines/{wineId}
 *
 * UploadResult mapping:
 * - imageUrl: Cloudinary secure_url (full HTTPS URL)
 * - fileSize: optimized buffer length (pre-upload size)
 * - mimeType: 'image/jpeg' (always, since Sharp converts to JPEG)
 */
type CloudinaryStorageContract = IStorageService;

/**
 * Storage factory contract
 *
 * createStorageService() must return:
 * - LocalStorageService when STORAGE_PROVIDER is 'local' or undefined
 * - CloudinaryStorageService when STORAGE_PROVIDER is 'cloudinary'
 */
type StorageFactoryContract = () => IStorageService;

export type { CloudinaryStorageContract, StorageFactoryContract };
