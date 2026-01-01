# Phase 1 Implementation Checklist - Wine Label Images

**Date**: December 31, 2025 **Status**: Ready to Begin **Target Duration**: 3-5
days

---

## Decisions Summary

Based on our discussion, Phase 1 will implement:

✅ **Image Display**: Max 600px width in detail modal ✅ **NO Thumbnails**:
Deferred to Phase 2 (faster implementation) ✅ **Placeholder**: Wine emoji 🍷
when no image ✅ **Image Replacement**: Auto-replace with confirmation dialog ✅
**Upload Location**: Only visible in edit mode ✅ **Testing**: Comprehensive
(80%+ coverage) ✅ **Storage**: Abstraction layer (local for dev, S3-ready) ✅
**Database**: Simple fields on Wine model

---

## Phase 1 Scope

### What's Included ✅

- Upload single image per wine (JPEG, PNG, WebP)
- Display full-size image in detail modal
- Delete/replace images
- Local file system storage for development
- Storage abstraction ready for AWS S3 (Phase 2)
- Image optimization (resize to 1200px max, compress)
- Comprehensive testing
- Security validations

### What's NOT Included (Deferred to Phase 2) ⏸️

- Thumbnails in wine table
- AWS S3 production storage
- CloudFront CDN
- Multiple images per wine
- Image editing (crop, rotate)
- Drag-and-drop upload

---

## Implementation Tasks

### 1. Database Schema Changes

**File**: `packages/database/prisma/schema.prisma`

- [ ] Add image fields to Wine model:

  ```prisma
  model Wine {
    // ... existing fields ...

    // Image fields
    imageUrl      String?   // URL/path to optimized image
    imageMimeType String?   // e.g., "image/jpeg"
    imageSize     Int?      // File size in bytes
    imageUploadedAt DateTime? // When image was uploaded

    // ... rest of fields ...
  }
  ```

- [ ] Generate Prisma client: `npm run db:generate`
- [ ] Create migration: `npx prisma migrate dev --name add_wine_images`
- [ ] Test migration in development database
- [ ] Commit schema changes

**Estimated Time**: 30 minutes

---

### 2. Install Dependencies

**File**: `apps/api/package.json`

- [ ] Install Multer for file uploads:

  ```bash
  cd apps/api
  npm install multer
  npm install --save-dev @types/multer
  ```

- [ ] Install Sharp for image processing:

  ```bash
  npm install sharp
  npm install --save-dev @types/sharp
  ```

- [ ] Install file-type for validation:

  ```bash
  npm install file-type
  ```

- [ ] Verify installations: `npm list multer sharp file-type`
- [ ] Commit package.json and package-lock.json

**Estimated Time**: 15 minutes

---

### 3. Configuration

**File**: `apps/api/src/config/storage.ts` (NEW)

- [ ] Create storage configuration:

  ```typescript
  import path from 'path';

  export const storageConfig = {
    uploadDir:
      process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads/wines'),
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageWidth: 1200, // Resize larger images
    imageQuality: 85, // JPEG quality (1-100)
  };

  export const isProduction = process.env.NODE_ENV === 'production';
  export const useS3 = isProduction && !!process.env.AWS_S3_BUCKET;
  ```

- [ ] Add to `.gitignore`:

  ```
  # Image uploads (development)
  apps/api/uploads/
  ```

- [ ] Create uploads directory structure:

  ```bash
  mkdir -p apps/api/uploads/wines
  ```

- [ ] Test configuration loads correctly

**Estimated Time**: 20 minutes

---

### 4. Storage Service Interface

**File**: `apps/api/src/services/storage/storage.interface.ts` (NEW)

- [ ] Create storage interface:

  ```typescript
  export interface IStorageService {
    uploadImage(
      wineId: string,
      buffer: Buffer,
      mimeType: string
    ): Promise<UploadResult>;
    deleteImage(wineId: string): Promise<void>;
    getImageUrl(wineId: string): string;
  }

  export interface UploadResult {
    imageUrl: string;
    fileSize: number;
    mimeType: string;
  }
  ```

- [ ] Add JSDoc comments for all methods
- [ ] Export types

**Estimated Time**: 15 minutes

---

### 5. Local Storage Service Implementation

**File**: `apps/api/src/services/storage/local-storage.service.ts` (NEW)

- [ ] Implement `LocalStorageService`:
  - [ ] Constructor (create directories if needed)
  - [ ] `uploadImage()` method:
    - [ ] Validate MIME type
    - [ ] Create wine-specific directory
    - [ ] Optimize image with Sharp (resize, compress)
    - [ ] Save to disk
    - [ ] Return upload result
  - [ ] `deleteImage()` method:
    - [ ] Check if image exists
    - [ ] Delete file
    - [ ] Delete directory if empty
  - [ ] `getImageUrl()` method:
    - [ ] Return relative URL path

- [ ] Add error handling for all file operations
- [ ] Add logging with Winston
- [ ] Test each method works correctly

**Estimated Time**: 2 hours

---

### 6. Storage Service Factory

**File**: `apps/api/src/services/storage/index.ts` (NEW)

- [ ] Create factory function:

  ```typescript
  import { LocalStorageService } from './local-storage.service';
  import { IStorageService } from './storage.interface';
  // import { S3StorageService } from './s3-storage.service'; // Phase 2

  export function createStorageService(): IStorageService {
    // Phase 2: Check for S3 configuration
    // if (useS3) return new S3StorageService();

    return new LocalStorageService();
  }

  export * from './storage.interface';
  ```

- [ ] Export singleton instance
- [ ] Add comments for Phase 2 S3 integration

**Estimated Time**: 15 minutes

---

### 7. Image Validation Utilities

**File**: `apps/api/src/utils/image-validation.ts` (NEW)

- [ ] Create validation functions:
  - [ ] `validateFileSize(buffer: Buffer): void`
  - [ ] `validateMimeType(mimeType: string): void`
  - [ ] `validateImageBuffer(buffer: Buffer): Promise<void>` (check magic
        numbers)

- [ ] Create custom error classes:
  - [ ] `FileTooLargeError extends AppError`
  - [ ] `InvalidFileTypeError extends AppError`
  - [ ] `InvalidImageError extends AppError`

- [ ] Add unit tests for validation functions

**Estimated Time**: 1 hour

---

### 8. Image Processing Utilities

**File**: `apps/api/src/utils/image-processing.ts` (NEW)

- [ ] Create image processing functions:
  - [ ] `optimizeImage(buffer: Buffer): Promise<Buffer>`
    - Resize to max 1200px width (preserve aspect ratio)
    - Compress JPEG to 85% quality
    - Strip EXIF metadata
    - Convert to JPEG format

- [ ] Add metadata extraction:
  - [ ] `getImageMetadata(buffer: Buffer): Promise<{ width, height, format }>`

- [ ] Add unit tests with sample images

**Estimated Time**: 1.5 hours

---

### 9. Upload Endpoint

**File**: `apps/api/src/routes/wines.ts` (MODIFY)

- [ ] Import Multer and configure:

  ```typescript
  import multer from 'multer';

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: storageConfig.maxFileSize },
  });
  ```

- [ ] Add POST endpoint:

  ```typescript
  router.post(
    '/wines/:id/image',
    upload.single('image'),
    async (req, res, next) => {
      // Implementation
    }
  );
  ```

- [ ] Endpoint logic:
  - [ ] Check wine exists
  - [ ] Validate uploaded file
  - [ ] Process image
  - [ ] Upload to storage
  - [ ] Update database
  - [ ] Return updated wine
  - [ ] Error handling

- [ ] Add rate limiting (10 uploads per 15 minutes)
- [ ] Add request logging

**Estimated Time**: 2 hours

---

### 10. Delete Endpoint

**File**: `apps/api/src/routes/wines.ts` (MODIFY)

- [ ] Add DELETE endpoint:

  ```typescript
  router.delete('/wines/:id/image', async (req, res, next) => {
    // Implementation
  });
  ```

- [ ] Endpoint logic:
  - [ ] Check wine exists
  - [ ] Check image exists
  - [ ] Delete from storage
  - [ ] Update database (set imageUrl to null)
  - [ ] Return 204 No Content
  - [ ] Error handling

- [ ] Add request logging

**Estimated Time**: 1 hour

---

### 11. Image Serving Endpoint

**File**: `apps/api/src/routes/wines.ts` (MODIFY)

- [ ] Add GET endpoint:

  ```typescript
  router.get('/wines/:id/image', async (req, res, next) => {
    // Implementation
  });
  ```

- [ ] Endpoint logic:
  - [ ] Check wine exists
  - [ ] Check image exists
  - [ ] Set appropriate headers (Content-Type, Cache-Control)
  - [ ] Stream file to response
  - [ ] Error handling

- [ ] Add caching headers (1 year for immutable images)

**Estimated Time**: 1 hour

---

### 12. Update Wine Deletion to Clean Up Images

**File**: `apps/api/src/routes/wines.ts` (MODIFY)

- [ ] Modify DELETE `/wines/:id` endpoint:
  - [ ] Check if wine has image
  - [ ] Delete image from storage before deleting wine
  - [ ] Handle errors gracefully

- [ ] Test cascade deletion works

**Estimated Time**: 30 minutes

---

### 13. Backend Unit Tests - Storage Service

**File**: `apps/api/__tests__/storage-service.test.ts` (NEW)

- [ ] Test LocalStorageService:
  - [ ] `uploadImage()` creates correct directory structure
  - [ ] `uploadImage()` optimizes image correctly
  - [ ] `uploadImage()` returns correct metadata
  - [ ] `deleteImage()` removes file
  - [ ] `deleteImage()` handles missing files gracefully
  - [ ] `getImageUrl()` returns correct path

- [ ] Test with actual image fixtures
- [ ] Test error cases
- [ ] Ensure tests clean up created files

**Estimated Time**: 2 hours

---

### 14. Backend Integration Tests - API Endpoints

**File**: `apps/api/__tests__/wine-images.test.ts` (NEW)

- [ ] Test POST `/wines/:id/image`:
  - [ ] Uploads JPEG successfully
  - [ ] Uploads PNG successfully
  - [ ] Uploads WebP successfully
  - [ ] Rejects files > 5MB
  - [ ] Rejects invalid file types (PDF, GIF, etc.)
  - [ ] Rejects missing file
  - [ ] Returns 404 for non-existent wine
  - [ ] Optimizes large images
  - [ ] Updates database correctly

- [ ] Test DELETE `/wines/:id/image`:
  - [ ] Deletes image successfully
  - [ ] Returns 404 if no image
  - [ ] Returns 404 for non-existent wine
  - [ ] Updates database correctly

- [ ] Test GET `/wines/:id/image`:
  - [ ] Serves image with correct Content-Type
  - [ ] Returns 404 if no image
  - [ ] Sets correct cache headers

- [ ] Test image replacement:
  - [ ] Uploading new image replaces old one
  - [ ] Old file is deleted from storage

- [ ] Test cascade deletion:
  - [ ] Deleting wine deletes image

**Estimated Time**: 3 hours

---

### 15. Frontend - Update Wine Type

**File**: `apps/web/src/types/wine.ts` (NEW or update existing type)

- [ ] Add image fields to Wine type:

  ```typescript
  export interface Wine {
    id: string;
    name: string;
    vintage: number;
    // ... existing fields ...

    // New image fields
    imageUrl?: string | null;
    imageMimeType?: string | null;
    imageSize?: number | null;
    imageUploadedAt?: string | null;
  }
  ```

**Estimated Time**: 10 minutes

---

### 16. Frontend - Image Upload in Detail Modal

**File**: `apps/web/src/components/WineDetailModal.tsx` (MODIFY)

- [ ] Add state for image upload:
  - [ ] `isUploading: boolean`
  - [ ] `uploadError: string | null`
  - [ ] `showDeleteConfirm: boolean`

- [ ] Add image upload section (only in edit mode):
  - [ ] File input (hidden)
  - [ ] Upload button/zone
  - [ ] Image preview when uploaded
  - [ ] Delete button when image exists
  - [ ] Loading indicator during upload

- [ ] Implement upload handler:
  - [ ] Validate file size (< 5MB)
  - [ ] Validate file type (JPEG, PNG, WebP)
  - [ ] Create FormData
  - [ ] POST to `/api/wines/:id/image`
  - [ ] Update wine state on success
  - [ ] Show error on failure

- [ ] Implement delete handler:
  - [ ] Show confirmation dialog
  - [ ] DELETE to `/api/wines/:id/image`
  - [ ] Update wine state on success
  - [ ] Show error on failure

- [ ] Style with wine-themed colors (#7C2D3C, #F5F1E8)

**Estimated Time**: 3 hours

---

### 17. Frontend - Display Image in Detail Modal

**File**: `apps/web/src/components/WineDetailModal.tsx` (MODIFY)

- [ ] Add image display in view mode:
  - [ ] Show image at max 600px width
  - [ ] Preserve aspect ratio
  - [ ] Alt text for accessibility
  - [ ] Wine emoji 🍷 placeholder if no image
  - [ ] Rounded corners (8px border-radius)

- [ ] Add loading state for image
- [ ] Handle broken image (fallback to placeholder)

**Estimated Time**: 1 hour

---

### 18. Frontend - Update API Utilities

**File**: `apps/web/src/utils/api.ts` (MODIFY if needed)

- [ ] Add image upload function (or use existing fetchApi):

  ```typescript
  export async function uploadWineImage(
    wineId: string,
    file: File
  ): Promise<Wine> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`/api/wines/${wineId}/image`, {
      method: 'POST',
      body: formData, // Don't set Content-Type, let browser set it
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.error, error.errorCode);
    }

    return response.json();
  }

  export async function deleteWineImage(wineId: string): Promise<void> {
    const response = await fetch(`/api/wines/${wineId}/image`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.error, error.errorCode);
    }
  }
  ```

**Estimated Time**: 30 minutes

---

### 19. Frontend Unit Tests - WineDetailModal Image Upload

**File**: `apps/web/__tests__/WineDetailModal.test.tsx` (MODIFY)

- [ ] Test image upload UI:
  - [ ] Shows upload button in edit mode (no image)
  - [ ] Hides upload in view mode
  - [ ] Shows image when available
  - [ ] Shows delete button when image exists

- [ ] Test file validation:
  - [ ] Accepts JPEG files
  - [ ] Accepts PNG files
  - [ ] Accepts WebP files
  - [ ] Rejects files > 5MB
  - [ ] Rejects invalid file types
  - [ ] Shows appropriate error messages

- [ ] Test upload flow:
  - [ ] Calls API with FormData
  - [ ] Shows loading indicator
  - [ ] Updates wine on success
  - [ ] Shows error on failure

- [ ] Test delete flow:
  - [ ] Shows confirmation dialog
  - [ ] Calls delete API on confirm
  - [ ] Updates wine on success
  - [ ] Cancels on dialog dismiss

- [ ] Test image display:
  - [ ] Renders image with correct src
  - [ ] Shows placeholder when no image
  - [ ] Handles broken images

**Estimated Time**: 2.5 hours

---

### 20. Error Handling

**File**: `apps/api/src/errors/AppError.ts` (MODIFY)

- [ ] Add image-specific error classes:

  ```typescript
  export class ImageUploadError extends AppError {
    constructor(message: string, reason?: string) {
      super(400, message, true, 'IMAGE_UPLOAD_ERROR');
    }
  }

  export class FileTooLargeError extends ImageUploadError {
    constructor(size: number, maxSize: number) {
      super(
        `File size ${Math.round(size / 1024 / 1024)}MB exceeds maximum ${Math.round(maxSize / 1024 / 1024)}MB`,
        'FILE_TOO_LARGE'
      );
    }
  }

  export class InvalidFileTypeError extends ImageUploadError {
    constructor(mimeType: string) {
      super(
        `File type ${mimeType} is not supported. Please upload JPEG, PNG, or WebP images.`,
        'INVALID_FILE_TYPE'
      );
    }
  }
  ```

- [ ] Update error handler to handle these new errors

**Estimated Time**: 30 minutes

---

### 21. Logging

- [ ] Add structured logging for image operations:
  - [ ] Upload start/success/failure
  - [ ] Delete operations
  - [ ] File validation errors
  - [ ] Storage errors

- [ ] Include metadata:
  - [ ] Wine ID
  - [ ] File size
  - [ ] MIME type
  - [ ] Request ID

**Estimated Time**: 30 minutes

---

### 22. Documentation

**File**: Update existing docs

- [ ] Update `README.md`:
  - [ ] Add image upload feature to features list
  - [ ] Document supported formats (JPEG, PNG, WebP)
  - [ ] Document file size limit (5MB)

- [ ] Create `IMAGE-UPLOAD-GUIDE.md`:
  - [ ] How to upload images
  - [ ] Supported formats
  - [ ] Size limits
  - [ ] Troubleshooting

- [ ] Update API documentation (if exists)

**Estimated Time**: 1 hour

---

### 23. Manual Testing

- [ ] **Upload Tests**:
  - [ ] Upload JPEG image (< 5MB) ✓
  - [ ] Upload PNG image (< 5MB) ✓
  - [ ] Upload WebP image (< 5MB) ✓
  - [ ] Try uploading 6MB file (should fail) ✓
  - [ ] Try uploading PDF (should fail) ✓
  - [ ] Try uploading without selecting file (should fail) ✓

- [ ] **Display Tests**:
  - [ ] Image appears in detail modal (view mode) ✓
  - [ ] Image is properly sized (max 600px) ✓
  - [ ] Placeholder shows when no image ✓
  - [ ] Alt text is correct ✓

- [ ] **Replace Tests**:
  - [ ] Upload image for wine that already has one ✓
  - [ ] Confirmation dialog appears ✓
  - [ ] Old image is replaced ✓
  - [ ] Old file deleted from storage ✓

- [ ] **Delete Tests**:
  - [ ] Delete image from detail modal ✓
  - [ ] Confirmation dialog appears ✓
  - [ ] Image removed from UI ✓
  - [ ] File deleted from storage ✓

- [ ] **Edge Cases**:
  - [ ] Upload very small image (< 100KB) ✓
  - [ ] Upload image exactly 5MB ✓
  - [ ] Upload very large image (gets resized) ✓
  - [ ] Delete wine with image (image gets cleaned up) ✓
  - [ ] Network error during upload (shows error) ✓

- [ ] **Browser Compatibility**:
  - [ ] Test in Chrome ✓
  - [ ] Test in Firefox ✓
  - [ ] Test in Safari ✓

- [ ] **Mobile Testing** (if possible):
  - [ ] Upload from phone camera ✓
  - [ ] Upload from photo library ✓
  - [ ] Image displays correctly ✓

**Estimated Time**: 2 hours

---

### 24. Code Review & Cleanup

- [ ] Run linter: `npm run lint`
- [ ] Fix any linting errors
- [ ] Run formatter: `npm run format`
- [ ] Run type check: `npm run type-check`
- [ ] Review all code changes
- [ ] Remove console.logs and debug code
- [ ] Check for commented-out code
- [ ] Verify error messages are user-friendly
- [ ] Check for hardcoded values (use config instead)

**Estimated Time**: 1 hour

---

### 25. Final Testing

- [ ] Run all tests: `npm test`
- [ ] Verify 80%+ coverage for new code: `npm run test:coverage`
- [ ] Fix any failing tests
- [ ] Verify no console errors in browser
- [ ] Check network tab for proper requests/responses
- [ ] Test with database reset (fresh state)

**Estimated Time**: 1 hour

---

## Total Estimated Time

**Backend**: ~12 hours **Frontend**: ~7 hours **Testing**: ~8 hours
**Documentation & Review**: ~3 hours

**Total**: ~30 hours (3-5 days at 6-10 hours/day)

---

## Definition of Done

Phase 1 is complete when:

✅ Users can upload wine label images (JPEG, PNG, WebP) ✅ Images are displayed
in detail modal (max 600px width) ✅ Users can delete images with confirmation
✅ Users can replace images with confirmation ✅ Upload only available in edit
mode ✅ File size validation (5MB max) ✅ File type validation (magic number
check) ✅ Images optimized (resized to 1200px, compressed) ✅ Storage
abstraction ready for S3 (Phase 2) ✅ Comprehensive tests (80%+ coverage) ✅ All
existing tests still pass ✅ No console errors or warnings ✅ Linting and
formatting clean ✅ Documentation updated ✅ Manual testing checklist complete

---

## Phase 2 Preview

After Phase 1 is stable, Phase 2 will add:

- Thumbnails in wine table (200x200px)
- AWS S3 storage with CloudFront CDN
- Professional placeholder images
- Performance optimizations
- Production deployment

---

## Notes

- Keep commits small and focused
- Test frequently as you build
- Ask questions if anything is unclear
- Document any deviations from this plan
- Update this checklist as you complete tasks

---

**Ready to begin!** Start with task #1 (Database Schema) and work through
sequentially.
