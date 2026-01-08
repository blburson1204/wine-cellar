# Wine Label Image Feature - Implementation Plan

**Date**: December 31, 2025 (Updated January 8, 2026) **Status**: Phase 1A & 1B
COMPLETED ✅ **Author**: Brian (with Claude)

---

## Executive Summary

**PHASE 1 COMPLETE!** 🎉

Wine label image support has been successfully implemented in the Wine Cellar
application. Users can now:

- ✅ View wine label images in detail modals (217 pre-existing images)
- ✅ Upload new wine label images during wine creation
- ✅ Upload, replace, and delete images for existing wines
- ✅ See image previews before committing changes
- ✅ Enjoy fast image loading with proper caching

This document outlines the completed implementation and future enhancement
phases.

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [✅ Completed: Phase 1A - Display Existing Images](#completed-phase-1a---display-existing-images)
3. [✅ Completed: Phase 1B - Upload & Edit](#completed-phase-1b---upload--edit)
4. [Database Design](#database-design)
5. [Storage Strategy](#storage-strategy)
6. [Image Processing](#image-processing)
7. [Security Considerations](#security-considerations)
8. [Testing Strategy](#testing-strategy)
9. [Future Phases](#future-phases)
   - [Phase 2: Thumbnails & Component Tests](#phase-2-thumbnails--component-tests)
   - [Phase 3: Production Storage (AWS)](#phase-3-production-storage-aws)
   - [Phase 4: Advanced Features](#phase-4-advanced-features)
10. [Performance & Optimization](#performance--optimization)
11. [Success Metrics](#success-metrics)

---

## Feature Overview

### Goals

- ✅ Display pre-downloaded wine label images (217 wines)
- ✅ Allow users to upload wine label photos
- ✅ Support upload during wine creation
- ✅ Provide proper image optimization and validation
- ⏸️ Display thumbnail images in the wine table/list view (Phase 2)
- ⏸️ Support cloud storage for production (Phase 3)
- ⏸️ Support multiple images per wine (Phase 4)

### User Stories (Implemented)

1. ✅ As a user, I want to see wine label images in the detail modal so I can
   visually identify wines
2. ✅ As a user, I want to upload a photo when creating a new wine
3. ✅ As a user, I want to upload/replace/delete wine label images in edit mode
4. ✅ As a user, I want to preview images before saving changes
5. ✅ As a user, I want images to load quickly with proper optimization

### User Stories (Future)

6. ⏸️ As a user, I want to see wine label thumbnails in the wine list (Phase 2)
7. ⏸️ As a user, I want my images stored reliably in cloud storage (Phase 3)
8. ⏸️ As a user, I want to add multiple photos per wine (Phase 4)
9. ⏸️ As a user, I want to crop/rotate images (Phase 4)

---

## ✅ Completed: Phase 1A - Display Existing Images

**Implementation Date**: January 4-5, 2026 **Status**: COMPLETE ✅

### What Was Built

1. **Database Schema**
   - Added `imageUrl` field to Wine model
   - Migration created and applied
   - 217 wines populated with existing images

2. **Backend API**
   - GET /api/wines/:id/image endpoint
   - Serves images from assets/wine-labels directory
   - Implements 1-year cache headers for performance
   - Graceful 404 handling for missing images

3. **Frontend Display**
   - Images displayed in Wine Detail modal (view & edit modes)
   - 300px fixed width image on right side
   - Details section on left with flex layout
   - Tasting Notes span full width at bottom
   - Wine emoji 🍷 placeholder with "Image not available" text

### Technical Decisions

- **Image Size**: 300px fixed width in modal (good balance)
- **Placeholder**: Wine emoji 🍷 with explanatory text
- **Thumbnails**: Deferred to Phase 2 (faster MVP delivery)
- **Layout**: Side-by-side design (details left, image right)

### Files Modified

- `packages/database/prisma/schema.prisma`
- `apps/api/src/app.ts`
- `apps/web/src/app/page.tsx`
- `apps/web/src/components/WineDetailModal.tsx`
- `scripts/populate-wine-images.ts` (one-time migration)

---

## ✅ Completed: Phase 1B - Upload & Edit

**Implementation Date**: January 5-8, 2026 **Status**: COMPLETE ✅

### What Was Built

#### Backend Implementation

1. **Storage Service**
   - LocalStorageService for file uploads
   - Storage interface abstraction (ready for S3 in Phase 3)
   - File organization: uploads/wines/{wineId}.jpg

2. **Image Processing**
   - Sharp library for optimization
   - Resize to max 1200px width
   - Compress to 85% JPEG quality
   - Strip EXIF metadata
   - Convert all formats to JPEG

3. **Validation & Security**
   - File type validation (JPEG, PNG, WebP)
   - Magic number validation (prevents spoofed files)
   - File size limit (5 MB max)
   - Comprehensive error handling
   - Rate limiting (planned but not critical for MVP)

4. **API Endpoints**
   - POST /api/wines/:id/image - Upload/replace image
   - DELETE /api/wines/:id/image - Delete image
   - Image cleanup on wine deletion

#### Frontend Implementation

1. **Upload UI (Edit Mode)**
   - File picker with accept filter
   - Image preview display
   - Upload/Delete buttons
   - Delete confirmation dialog
   - Loading states during upload
   - Error message display

2. **Upload UI (Add Mode)** - Phase 1B Enhancement
   - Staged image selection before wine exists
   - Live image preview
   - File validation feedback
   - Sequential flow: create wine → upload image → refresh list
   - Graceful error handling if image upload fails

3. **Validation**
   - Client-side file type check
   - Client-side file size check
   - User-friendly error messages
   - Browser's built-in file type filtering

#### Testing

1. **Backend Tests** (270 tests passing)
   - Upload endpoint tests (JPEG, PNG, WebP)
   - Delete endpoint tests
   - File validation tests
   - Image optimization tests
   - Error handling tests
   - Concurrent upload tests
   - Security tests (file type spoofing, etc.)

2. **Manual Testing** (7 scenarios)
   - Create wine with image ✅
   - Replace staged image before saving ✅
   - Remove staged image before saving ✅
   - Cancel with staged image ✅
   - Validation still works ✅
   - File type validation ✅
   - File size validation ✅

### Technical Achievements

- **Staged Upload Pattern**: Innovative approach allowing image preview before
  wine creation
- **Double Validation**: Client + server validation for robust security
- **Optimized Processing**: Fast, efficient image optimization with Sharp
- **Error Resilience**: Graceful degradation if image upload fails
- **Clean Architecture**: Storage abstraction ready for cloud migration

### Files Modified

**Backend**:

- `apps/api/package.json`
- `apps/api/src/app.ts`
- `apps/api/src/services/storage/local-storage.service.ts` (NEW)
- `apps/api/src/services/storage/storage.interface.ts` (NEW)
- `apps/api/src/utils/image-validation.ts` (NEW)
- `apps/api/src/utils/image-processing.ts` (NEW)
- `apps/api/src/errors/AppError.ts`

**Frontend**:

- `apps/web/src/app/page.tsx`
- `apps/web/src/components/WineDetailModal.tsx`

**Tests**:

- `apps/api/__tests__/routes/wine-image.integration.test.ts` (NEW -
  comprehensive)

---

## Database Design

### Current Schema (Phase 1)

```prisma
model Wine {
  id            String    @id @default(cuid())
  name          String
  vintage       Int
  producer      String
  region        String?
  country       String
  grapeVariety  String?
  blendDetail   String?
  color         WineColor
  quantity      Int       @default(1)
  purchasePrice Float?
  purchaseDate  DateTime?
  rating        Float?
  notes         String?

  // Image field (Phase 1)
  imageUrl      String?   // Path to wine label image

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Future Schema (Phase 2 - Thumbnails)

```prisma
model Wine {
  // ... existing fields ...

  imageUrl      String?   // Full-size image
  thumbnailUrl  String?   // Thumbnail (200x200px)

  // ... existing fields ...
}
```

### Future Schema (Phase 4 - Multiple Images)

```prisma
model Wine {
  // ... existing fields ...
  images        WineImage[]
}

model WineImage {
  id           String   @id @default(cuid())
  wineId       String
  wine         Wine     @relation(fields: [wineId], references: [id], onDelete: Cascade)
  imageUrl     String
  thumbnailUrl String
  isPrimary    Boolean  @default(false)
  uploadedAt   DateTime @default(now())

  @@index([wineId])
}
```

---

## Storage Strategy

### Current: Local File System (Development)

**Location**: `uploads/wines/{wineId}.jpg`

**Pros**:

- ✅ Simple to implement
- ✅ No external dependencies
- ✅ Fast for local development
- ✅ No costs

**Cons**:

- ❌ Not suitable for production deployment
- ❌ Doesn't work with multiple server instances
- ❌ No CDN benefits

### Phase 3: AWS S3 (Production)

**Bucket Structure**:

```
wine-cellar-production/
  wines/
    {wineId}/original.jpg
    {wineId}/thumbnail.jpg
```

**Benefits**:

- Highly scalable and durable
- Works with multiple server instances
- CDN integration via CloudFront
- Automatic backup and versioning
- Pay-as-you-go pricing

**Cost Estimate**:

- S3 Storage: ~$0.023 per GB/month
- Typical usage (100 wines, 1 MB each): ~$0.002/month
- CloudFront: First 1 TB free tier

---

## Image Processing

### Current Implementation

**Library**: Sharp (fast, efficient, well-maintained)

**Processing Pipeline**:

1. Validate file type (magic number check)
2. Resize to max 1200px width (preserves aspect ratio)
3. Compress to 85% JPEG quality
4. Strip EXIF metadata (privacy + size reduction)
5. Convert all formats to JPEG

**Sample Code**:

```typescript
await sharp(buffer)
  .resize(1200, null, {
    fit: 'inside',
    withoutEnlargement: true,
  })
  .jpeg({ quality: 85 })
  .toFile(outputPath);
```

### Future: Thumbnail Generation (Phase 2)

```typescript
await sharp(buffer)
  .resize(200, 200, {
    fit: 'cover',
    position: 'center',
  })
  .jpeg({ quality: 80 })
  .toFile(thumbnailPath);
```

---

## Security Considerations

### Implemented (Phase 1B)

1. ✅ **File Validation**
   - MIME type check
   - Magic number validation (prevents spoofing)
   - File size limit (5 MB max)
   - File extension validation

2. ✅ **Path Traversal Prevention**
   - Never use user-provided filenames
   - Filenames based on wine ID only

3. ✅ **Error Handling**
   - Custom error classes
   - Clear error messages
   - Graceful degradation

### Planned (Phase 3)

- ⏸️ Rate limiting (10 uploads per 15 minutes)
- ⏸️ AWS S3 private bucket with presigned URLs
- ⏸️ Content Security Policy updates
- ⏸️ Per-user access control

---

## Testing Strategy

### Completed (Phase 1B)

**Backend Integration Tests** (270 tests passing):

- ✅ Upload JPEG successfully
- ✅ Upload PNG successfully
- ✅ Upload WebP successfully
- ✅ Reject files > 5MB
- ✅ Reject invalid file types
- ✅ Validate magic numbers
- ✅ Handle concurrent uploads
- ✅ Delete images successfully
- ✅ Cascade deletion (delete wine → delete image)
- ✅ Image optimization

**Manual Testing** (All scenarios passing):

- ✅ 7 user scenarios tested and validated

### Planned (Phase 2)

**Frontend Component Tests**:

- ⏸️ Image upload UI in add mode
- ⏸️ Staged image preview
- ⏸️ Replace/delete staged images
- ⏸️ File validation in add mode
- ⏸️ Error handling in add mode

---

## Future Phases

### Phase 2: Thumbnails & Component Tests

**Goal**: Add thumbnail images to wine table and complete frontend test coverage

**Priority**: MEDIUM

**Tasks**:

1. Generate 200x200px thumbnails on upload
2. Store thumbnailUrl in database
3. Display thumbnails in wine table (40x40px display size)
4. Implement lazy loading for thumbnails
5. Add component tests for image upload in add mode
6. Add integration tests for create-with-image flow

**Success Criteria**:

- Thumbnails appear in wine table
- Fast loading with lazy loading
- All frontend component tests passing
- No regression in existing 270 tests

**Estimated Time**: 2-3 days

---

### Phase 3: Production Storage (AWS)

**Goal**: Move to AWS S3 storage with CloudFront CDN for production deployment

**Priority**: HIGH (for production deployment)

**Tasks**:

1. Implement S3StorageService
2. Create AWS S3 bucket with proper security
3. Set up CloudFront CDN distribution
4. Configure environment variables
5. Create migration script to move images to S3
6. Update storage service factory to use S3 in production
7. Implement presigned URLs for private images
8. Add monitoring and logging

**Success Criteria**:

- Images stored in S3 with CloudFront delivery
- Fast image loading (< 500ms globally)
- Proper security (private bucket, presigned URLs)
- All tests passing in production environment
- Minimal monthly costs

**Estimated Time**: 3-4 days

**Prerequisites**:

- AWS account setup
- CloudFront configuration
- Environment variable management

---

### Phase 4: Advanced Features

**Goal**: Enhanced user experience with multiple images, editing, and
drag-and-drop

**Priority**: LOW (nice-to-have enhancements)

**Tasks**:

1. **Multiple Images per Wine**
   - Migrate to WineImage table
   - Primary image designation
   - Image gallery view
   - Image ordering/reordering

2. **Image Editing**
   - Crop functionality
   - Rotate functionality
   - Zoom/pan preview

3. **Enhanced Upload UX**
   - Drag-and-drop upload
   - Batch upload multiple images
   - Progress bars for large uploads

4. **Advanced Features**
   - OCR to read wine label text
   - Auto-populate wine details from label
   - Image search/filtering
   - Similar wine detection by label

**Success Criteria**:

- Users can upload multiple images per wine
- Intuitive image editing tools
- Drag-and-drop works smoothly
- OCR accurately reads label text (>80% accuracy)

**Estimated Time**: 2-3 weeks (depending on scope)

---

## Performance & Optimization

### Current Optimizations

1. ✅ **Image Optimization**
   - Resize to max 1200px (reduces bandwidth)
   - JPEG compression at 85% quality
   - EXIF metadata stripped

2. ✅ **Caching**
   - 1-year cache headers on images
   - Browser caching enabled
   - Immutable images (versioned URLs if needed)

3. ✅ **Lazy Loading**
   - Native lazy loading attribute
   - Deferred image loading in modals

### Future Optimizations (Phase 2+)

- ⏸️ Thumbnail generation (200x200px)
- ⏸️ WebP format for better compression
- ⏸️ Progressive JPEG for faster perceived loading
- ⏸️ Blur placeholder while loading
- ⏸️ CloudFront CDN for global delivery
- ⏸️ Responsive images (multiple sizes for different viewports)

---

## Success Metrics

### Phase 1 Achievements ✅

**Functionality**:

- ✅ 100% of valid image uploads succeed
- ✅ Images display in all detail modals
- ✅ File validation prevents bad uploads
- ✅ Image upload works during wine creation

**Performance**:

- ✅ Images load quickly with proper caching
- ✅ Optimized images reduce bandwidth
- ✅ Fast upload processing

**Quality**:

- ✅ All 270 tests passing
- ✅ Comprehensive error handling
- ✅ Clean, maintainable code

**User Experience**:

- ✅ Intuitive upload process
- ✅ Clear error messages
- ✅ Image preview before saving
- ✅ Graceful handling of missing images

### Phase 2 Targets ⏸️

- Thumbnails load in < 200ms
- Thumbnail file size < 30KB average
- Frontend test coverage > 80%

### Phase 3 Targets ⏸️

- Images load in < 500ms globally (with CDN)
- 99.9% uptime for image service
- < $10/month AWS costs for typical usage

---

## Lessons Learned

1. **Staged Upload Pattern Works Exceptionally Well**
   - Allowing image selection before wine creation dramatically improves UX
   - Users can preview exactly what they're saving
   - Prevents orphaned images

2. **Client + Server Validation is Essential**
   - Double validation catches all edge cases
   - Client validation provides instant feedback
   - Server validation ensures security

3. **Sharp is the Right Choice**
   - Fast, efficient image processing
   - Excellent documentation
   - Wide format support

4. **Local Storage Sufficient for Development**
   - No need to rush to S3
   - Can defer cloud setup until production deployment
   - Keeps development simple and fast

5. **Error Handling is Crucial**
   - Graceful degradation improves reliability
   - Clear error messages help users understand issues
   - Partial success (wine created, image failed) is better than total failure

---

## Related Documentation

- [Phase-1-Implementation-Checklist.md](Phase-1-Implementation-Checklist.md) -
  Detailed task checklist
- [NEXT-SESSION-TODO.md](NEXT-SESSION-TODO.md) - Next session planning
- [Code-Review-Standards-Summary.md](Code-Review-Standards-Summary.md)
- [ERROR-HANDLING-SUMMARY.md](ERROR-HANDLING-SUMMARY.md)
- [Test-Summary.md](Test-Summary.md)

---

## Next Steps

✅ **Phase 1A & 1B: COMPLETE**

**Immediate Next (Optional)**:

1. Add component tests for image upload in add mode (deferred but valuable)
2. Consider Phase 2 implementation (thumbnails in table view)

**Production Deployment**:

- Phase 3 (AWS S3 + CloudFront) required before deploying to production
- Can deploy Phase 1 to development/staging environment now

**Timeline**:

- Phase 2: Optional, 2-3 days
- Phase 3: Required for production, 3-4 days
- Phase 4: Future enhancements, TBD based on user feedback

---

**Document Status**: Updated January 8, 2026 **Phase 1 Status**: COMPLETE ✅
**Next Phase**: Phase 2 - Thumbnails & Tests (optional)
