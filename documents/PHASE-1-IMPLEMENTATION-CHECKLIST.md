# Phase 1 Implementation Checklist - Wine Label Images

**Date**: December 31, 2025 (Updated January 4, 2026) **Status**: REVISED -
Ready to Begin **Target Duration**: 2-4 days

---

## IMPORTANT UPDATE (January 4, 2026)

Wine label images (~220) have already been downloaded from Vivino and stored in
[assets/wine-labels](../assets/wine-labels), keyed by Wine ID. This changes our
implementation approach:

**NEW Phase 1A Priority**: Display existing images in Wine Detail modals **NEW
Phase 1B**: Add upload/edit capabilities

---

## Decisions Summary

Based on our discussion, Phase 1 will implement:

✅ **Image Display**: Max 600px width in detail modal (BOTH view and edit modes)
✅ **NO Thumbnails**: Deferred to Phase 3 (faster implementation) ✅
**Placeholder**: Wine emoji 🍷 when no image ✅ **Existing Images**: Display
~220 images already downloaded ✅ **Upload Location**: Only available in edit
mode (Phase 1B) ✅ **Testing**: Comprehensive (80%+ coverage) ✅ **Storage**:
Local file system (assets/wine-labels) ✅ **Database**: Simple imageUrl field on
Wine model

---

## Phase 1A Scope - Display Existing Images (PRIORITY)

### What's Included ✅

- Database field to store image filename
- Migration script to populate imageUrl from existing files
- Image serving endpoint (GET /wines/:id/image)
- Display images in Wine Detail modal (view mode)
- Display images in Wine Detail modal (edit mode)
- Graceful handling of missing images
- Basic tests

### Estimated Time: 1 day

---

## Phase 1B Scope - Upload & Edit

### What's Included ✅

- Upload single image per wine (JPEG, PNG, WebP)
- Delete/replace images with confirmation
- Local file system storage
- Image optimization (resize to 1200px max, compress)
- File validation (size, type, magic numbers)
- Comprehensive testing
- Error handling

### What's NOT Included (Deferred) ⏸️

- Thumbnails in wine table (Phase 3)
- AWS S3 production storage (Phase 4)
- CloudFront CDN (Phase 4)
- Multiple images per wine (Phase 5)
- Image editing (crop, rotate) (Phase 5)
- Drag-and-drop upload (Phase 5)

### Estimated Time: 2-3 days

---

## Implementation Tasks

---

## PHASE 1A: DISPLAY EXISTING IMAGES (PRIORITY)

### 1A-1. Database Schema Changes

**File**: `packages/database/prisma/schema.prisma`

- [ ] Add imageUrl field to Wine model:

  ```prisma
  model Wine {
    // ... existing fields ...

    // Image field (stores filename from assets/wine-labels)
    imageUrl      String?   // e.g., "cmjx1sc6s0000yr445n60tinv.jpg"

    // Future fields for Phase 1B (upload functionality)
    // imageMimeType String?
    // imageSize     Int?
    // imageUploadedAt DateTime?

    // ... rest of fields ...
  }
  ```

- [ ] Generate Prisma client: `npm run db:generate`
- [ ] Create migration: `npx prisma migrate dev --name add_wine_image_url`
- [ ] Test migration in development database
- [ ] Commit schema changes

**Estimated Time**: 20 minutes

---

### 1A-2. Migration Script to Populate imageUrl

**File**: `scripts/populate-wine-images.ts` (NEW)

- [ ] Create script to read existing images from `assets/wine-labels/`
- [ ] For each image file:
  - [ ] Extract wine ID from filename (without extension)
  - [ ] Find wine in database by ID
  - [ ] Update wine.imageUrl with the filename
  - [ ] Log results (updated vs. not found)

- [ ] Run script: `npx tsx scripts/populate-wine-images.ts`
- [ ] Verify in Prisma Studio that wines have imageUrl populated
- [ ] Commit script

**Estimated Time**: 30 minutes

---

### 1A-3. Image Serving Endpoint

**File**: `apps/api/src/routes/wines.ts` (MODIFY)

- [ ] Add GET endpoint to serve images:

  ```typescript
  router.get('/wines/:id/image', async (req, res, next) => {
    // 1. Find wine by ID
    // 2. Check if wine.imageUrl exists
    // 3. Construct path to assets/wine-labels/{imageUrl}
    // 4. Check if file exists
    // 5. Determine MIME type from extension
    // 6. Set caching headers (Cache-Control: public, max-age=31536000)
    // 7. Send file with res.sendFile()
  });
  ```

- [ ] Add error handling:
  - [ ] 404 if wine not found
  - [ ] 404 if wine has no image
  - [ ] 404 if image file doesn't exist on disk

- [ ] Test endpoint with curl or browser
- [ ] Commit endpoint

**Estimated Time**: 1 hour

---

### 1A-4. Frontend - Update Wine Type

**File**: `apps/web/src/types/wine.ts` (NEW or MODIFY)

- [ ] Add imageUrl field to Wine type:

  ```typescript
  export interface Wine {
    id: string;
    name: string;
    vintage: number;
    // ... existing fields ...

    // New image field
    imageUrl?: string | null;
  }
  ```

- [ ] Commit type changes

**Estimated Time**: 5 minutes

---

### 1A-5. Frontend - Display Image in Detail Modal (View Mode)

**File**: `apps/web/src/components/WineDetailModal.tsx` (MODIFY)

- [ ] Add image display section in view mode:
  - [ ] Check if `wine.imageUrl` exists
  - [ ] If exists, display image:
    ```tsx
    <img
      src={`/api/wines/${wine.id}/image`}
      alt={`${wine.name} label`}
      style={{ maxWidth: '600px', width: '100%', borderRadius: '8px' }}
      loading="lazy"
    />
    ```
  - [ ] If no image, show placeholder (wine emoji 🍷)
  - [ ] Handle image load errors (broken images)

- [ ] Style appropriately with wine-themed colors
- [ ] Test with wines that have images
- [ ] Test with wines that don't have images
- [ ] Commit changes

**Estimated Time**: 1 hour

---

### 1A-6. Frontend - Display Image in Detail Modal (Edit Mode)

**File**: `apps/web/src/components/WineDetailModal.tsx` (MODIFY)

- [ ] Add image display section in edit mode:
  - [ ] Same display logic as view mode
  - [ ] Show image if exists
  - [ ] Show placeholder if no image
  - [ ] Note: Upload/delete functionality comes in Phase 1B

- [ ] Test in edit mode
- [ ] Commit changes

**Estimated Time**: 30 minutes

---

### 1A-7. Basic Tests for Image Display

**File**: `apps/api/__tests__/wine-images.test.ts` (NEW)

- [ ] Test GET `/wines/:id/image`:
  - [ ] Returns 200 and image for wine with imageUrl
  - [ ] Returns 404 for wine without imageUrl
  - [ ] Returns 404 for non-existent wine
  - [ ] Sets correct Content-Type header
  - [ ] Sets correct Cache-Control header

**File**: `apps/web/__tests__/WineDetailModal.test.tsx` (MODIFY)

- [ ] Test image display:
  - [ ] Shows image when wine.imageUrl exists
  - [ ] Shows placeholder when no imageUrl
  - [ ] Image has correct src attribute
  - [ ] Image has correct alt text

**Estimated Time**: 1.5 hours

---

### 1A-8. Manual Testing & Documentation

- [ ] Manual testing:
  - [ ] View wine with image in detail modal
  - [ ] View wine without image (shows placeholder)
  - [ ] Check browser network tab (images cached correctly)
  - [ ] Test in both view and edit modes

- [ ] Update README or docs with new feature

**Estimated Time**: 30 minutes

---

**Total Phase 1A Time**: ~5.5 hours (half a day to full day)

---

## PHASE 1B: UPLOAD & EDIT CAPABILITIES

### 1B-1. Install Dependencies

**File**: `apps/api/package.json`

**Note**: Only needed for Phase 1B (upload functionality)

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

### 1B-2. Configuration

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

### 1B-3. Storage Service Interface

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

### 1B-4. Local Storage Service Implementation

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

### 1B-5. Storage Service Factory

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

### 1B-6. Image Validation Utilities

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

### 1B-7. Image Processing Utilities

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

### 1B-8. Upload Endpoint

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

### 1B-9. Delete Endpoint

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

### 1B-10. Image Serving Endpoint

**Note**: This should already be complete from Phase 1A (task 1A-3). Skip this
task if already implemented.

**File**: `apps/api/src/routes/wines.ts` (MODIFY)

- [ ] Add GET endpoint (or skip if done in Phase 1A):

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

### 1B-11. Update Wine Deletion to Clean Up Images

**File**: `apps/api/src/routes/wines.ts` (MODIFY)

- [ ] Modify DELETE `/wines/:id` endpoint:
  - [ ] Check if wine has image
  - [ ] Delete image from storage before deleting wine
  - [ ] Handle errors gracefully

- [ ] Test cascade deletion works

**Estimated Time**: 30 minutes

---

### 1B-12. Backend Unit Tests - Storage Service

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

### 1B-13. Backend Integration Tests - API Endpoints

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

### 1B-14. Frontend - Update Wine Type

**Note**: This should already be complete from Phase 1A (task 1A-4). This step
is to add the ADDITIONAL fields for upload metadata.

**File**: `apps/web/src/types/wine.ts` (MODIFY)

- [ ] Add additional image metadata fields to Wine type:

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

### 1B-15. Frontend - Image Upload in Detail Modal

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

### 1B-16. Frontend - Display Image in Detail Modal

**Note**: This should already be complete from Phase 1A (tasks 1A-5 and 1A-6).
Skip if already implemented.

**File**: `apps/web/src/components/WineDetailModal.tsx` (MODIFY)

- [ ] Verify image display in view mode (should already be done):
  - [ ] Show image at max 600px width
  - [ ] Preserve aspect ratio
  - [ ] Alt text for accessibility
  - [ ] Wine emoji 🍷 placeholder if no image
  - [ ] Rounded corners (8px border-radius)

- [ ] Add loading state for image
- [ ] Handle broken image (fallback to placeholder)

**Estimated Time**: 1 hour

---

### 1B-17. Frontend - Update API Utilities

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

### 1B-18. Frontend Unit Tests - WineDetailModal Image Upload

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

### 1B-19. Error Handling

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

### 1B-20. Logging

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

### 1B-21. Documentation

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

### 1B-22. Manual Testing

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

### 1B-23. Code Review & Cleanup

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

### 1B-24. Final Testing

- [ ] Run all tests: `npm test`
- [ ] Verify 80%+ coverage for new code: `npm run test:coverage`
- [ ] Fix any failing tests
- [ ] Verify no console errors in browser
- [ ] Check network tab for proper requests/responses
- [ ] Test with database reset (fresh state)

**Estimated Time**: 1 hour

---

## Total Estimated Time

### Phase 1A (Display Existing Images)

- **Backend**: ~1.5 hours
- **Frontend**: ~1.5 hours
- **Testing**: ~1.5 hours
- **Documentation**: ~0.5 hour
- **Total Phase 1A**: ~5.5 hours (half to full day)

### Phase 1B (Upload & Edit)

- **Backend**: ~10 hours
- **Frontend**: ~4.5 hours
- **Testing**: ~7.5 hours
- **Documentation & Review**: ~3 hours
- **Total Phase 1B**: ~25 hours (2-3 days)

**Grand Total**: ~30.5 hours (2-4 days total, but Phase 1A can ship in < 1 day)

---

## Definition of Done

### Phase 1A is complete when:

✅ Database has imageUrl field ✅ Existing images (~220) are linked to wines in
database ✅ Images are displayed in Wine Detail modals (both view and edit
modes) ✅ Images display at max 600px width ✅ Missing images show wine emoji 🍷
placeholder ✅ Image serving endpoint works with proper caching ✅ Basic tests
pass ✅ No console errors or warnings ✅ Linting and formatting clean

### Phase 1B is complete when:

✅ Users can upload wine label images (JPEG, PNG, WebP) ✅ Users can delete
images with confirmation ✅ Users can replace images with confirmation ✅ Upload
only available in edit mode ✅ File size validation (5MB max) ✅ File type
validation (magic number check) ✅ Images optimized (resized to 1200px,
compressed) ✅ Comprehensive tests (80%+ coverage) ✅ All existing tests still
pass ✅ No console errors or warnings ✅ Linting and formatting clean ✅
Documentation updated ✅ Manual testing checklist complete

---

## Future Phases Preview

### Phase 3: Thumbnails in Table View

- Thumbnails in wine table (200x200px)
- Lazy loading optimization
- Performance improvements

### Phase 4: Production Readiness

- AWS S3 storage with CloudFront CDN
- Professional placeholder images
- Production deployment

### Phase 5: Enhancements

- Multiple images per wine
- Image editing (crop, rotate)
- Drag-and-drop upload
- OCR label reading

---

## Notes

- Keep commits small and focused
- Test frequently as you build
- Ask questions if anything is unclear
- Document any deviations from this plan
- Update this checklist as you complete tasks
- **Phase 1A can be completed and shipped independently before starting Phase
  1B**

---

## Getting Started

**Ready to begin!**

1. Start with **Phase 1A** tasks (1A-1 through 1A-8) to get existing images
   displaying ASAP
2. Ship Phase 1A to production once complete and tested
3. Then proceed with **Phase 1B** tasks (1B-1 through 1B-24) for upload/edit
   functionality
4. Each phase is independently valuable and can be deployed separately

**First task**: 1A-1 (Database Schema Changes) - Add the imageUrl field
