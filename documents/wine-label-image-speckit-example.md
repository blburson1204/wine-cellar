# SpecKit Lite Conversion: Wine Label Image Feature

**Purpose**: Retrospective example showing what the Wine Label Image feature
planning documents would look like using SpecKit Lite methodology.

**Original Document**:
[wine-label-image-feature-plan.md](wine-label-image-feature-plan.md)

---

# Part 1: Feature Specification (spec.md)

---

meta: spec_id: 002 spec_name: wine-label-images status: completed phase:
completed created: 2025-12-31 updated: 2026-01-20

summary: goals: - {id: G1, description: "Display wine label images in detail
modal", priority: HIGH} - {id: G2, description: "Upload images during wine
creation", priority: HIGH} - {id: G3, description: "Upload/replace/delete images
for existing wines", priority: HIGH} - {id: G4, description: "Preview images
before saving", priority: MEDIUM} constraints: - {id: C1, description: "File
size limit 5MB", type: TECHNICAL} - {id: C2, description: "Supported formats:
JPEG, PNG, WebP", type: TECHNICAL} - {id: C3, description: "Local storage for
development phase", type: INFRASTRUCTURE} decisions: - {id: D1, decision: "Sharp
library for image processing", rationale: "Fast, efficient, well-maintained"} -
{id: D2, decision: "Staged upload pattern for new wines", rationale: "Preview
before wine exists"} - {id: D3, decision: "Defer thumbnails to Phase 2",
rationale: "Faster MVP delivery"} - {id: D4, decision: "Defer S3 to Phase 3",
rationale: "Local storage sufficient for dev"}

critical_requirements: type: feature-major ui_changes: moderate

---

# Feature Specification: Wine Label Images

**Feature Branch**: `002-wine-label-images` | **Created**: 2025-12-31 |
**Status**: Phase 1 Complete **Input**: User description: "Add wine label image
support with upload capability"

---

## User Scenarios & Testing

### Primary User Story

A wine collector wants to photograph wine labels and attach them to wine entries
so they can visually identify bottles and remember what the label looks like
when browsing their collection.

### Acceptance Scenarios

1. **Given** I'm viewing a wine with an image, **When** I open the detail modal,
   **Then** I see the wine label image displayed alongside the details

2. **Given** I'm creating a new wine, **When** I select an image file, **Then**
   I see a preview of the image before saving

3. **Given** I'm editing an existing wine, **When** I upload a new image,
   **Then** the new image replaces the old one after saving

4. **Given** I'm editing a wine with an image, **When** I click delete on the
   image, **Then** I'm asked to confirm and the image is removed

5. **Given** I select an image while creating a wine, **When** I save the wine,
   **Then** the wine is created first, then the image is uploaded

6. **Given** I select an invalid file type, **When** I try to upload, **Then** I
   see an error message about supported formats

7. **Given** I select a file over 5MB, **When** I try to upload, **Then** I see
   an error message about the size limit

### Edge Cases

- What if wine creation succeeds but image upload fails? → Wine is created,
  error shown, user can retry image upload
- What if image file is corrupted? → Magic number validation rejects it
- What if multiple users upload simultaneously? → Files named by wineId, no
  conflict

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST display wine label images in detail modal (300px
  width)
- **FR-002**: System MUST show placeholder (wine emoji) when no image exists
- **FR-003**: Users MUST be able to upload images during wine creation (staged)
- **FR-004**: Users MUST be able to upload/replace images in edit mode
- **FR-005**: Users MUST be able to delete images with confirmation
- **FR-006**: System MUST preview images before saving
- **FR-007**: System MUST validate file type (JPEG, PNG, WebP only)
- **FR-008**: System MUST validate file size (5MB maximum)
- **FR-009**: System MUST validate magic numbers (prevent spoofed files)
- **FR-010**: System MUST optimize images (resize to 1200px, compress to 85%
  JPEG)
- **FR-011**: System MUST strip EXIF metadata for privacy
- **FR-012**: System MUST use 1-year cache headers for performance
- **FR-013**: System MUST delete image file when wine is deleted

### Key Entities

- **Wine.imageUrl**: Optional string field storing path to image file
- **Image files**: Stored at `uploads/wines/{wineId}.jpg`

### Test Strategy

**Test Type Classification**:

| FR     | Primary Test Type  | Reason                       |
| ------ | ------------------ | ---------------------------- |
| FR-001 | Unit               | Component rendering          |
| FR-002 | Unit               | Conditional display logic    |
| FR-003 | Integration        | Staged upload flow           |
| FR-004 | Integration        | Upload API endpoint          |
| FR-005 | Integration        | Delete API endpoint          |
| FR-006 | Unit               | Preview state management     |
| FR-007 | Unit + Integration | Client + server validation   |
| FR-008 | Unit + Integration | Client + server validation   |
| FR-009 | Integration        | Magic number checking        |
| FR-010 | Integration        | Sharp processing pipeline    |
| FR-011 | Integration        | EXIF stripping verification  |
| FR-012 | Integration        | Response header verification |
| FR-013 | Integration        | Cascade deletion             |

**This Feature**:

- Feature type: [X] Mixed (significant backend + frontend)
- Unit: 40% | Integration: 60% | E2E: 0%

**Estimated Test Count**: 40-50 tests

### Error Handling & Recovery

| Error Scenario             | Type      | User Message                       | Recovery Action        |
| -------------------------- | --------- | ---------------------------------- | ---------------------- |
| Invalid file type          | Permanent | "Please upload JPEG, PNG, or WebP" | User selects new file  |
| File too large             | Permanent | "Image must be under 5MB"          | User selects new file  |
| Upload fails (wine exists) | Transient | "Image upload failed"              | Retry upload           |
| Upload fails (new wine)    | Transient | "Wine saved, image failed"         | Edit wine to add image |
| Image not found            | Permanent | (show placeholder)                 | N/A                    |

**Resumability**:

- [x] Wine creation proceeds even if image fails
- [x] Image upload is idempotent (re-upload replaces)

### UI/Design Reference

**Feature Classification**: [X] Moderate UI (3-7 components, some custom work)

**Design Elements**:

- Image display: 300px fixed width in modal, right side
- Details section: Left side with flex layout
- Tasting notes: Full width at bottom
- Placeholder: Wine emoji with "Image not available" text
- Upload UI: File picker, preview, upload/delete buttons
- Delete confirmation: Modal dialog

---

## Review Checklist (Gate)

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Test strategy defined
- [x] Error handling defined
- [x] UI complexity classified

---

# Part 2: Implementation Plan (plan.md)

---

meta: spec_id: 002 spec_name: wine-label-images phase: completed updated:
2026-01-20

summary: tech_stack: [TypeScript, React, Express, Prisma, Sharp, Multer]
external_deps: [] test_strategy: {unit: 40, integration: 60, e2e: 0} deployment:
immediate

---

# Implementation Plan: Wine Label Images

**Branch**: `002-wine-label-images` | **Date**: 2025-12-31 | **Spec**:
specs/002-wine-label-images/spec.md

---

## Summary

Add wine label image support with local file storage, image optimization via
Sharp, upload/replace/delete functionality, and staged upload pattern for new
wine creation.

## Technical Context

**Language/Version**: TypeScript 5.x **Primary Dependencies**: React 18,
Express, Prisma, Sharp, Multer **Storage**: Local filesystem (uploads/wines/),
SQLite for metadata **Testing**: Vitest, React Testing Library, Supertest
**Target Platform**: Web browser **Project Type**: Monorepo (apps/api, apps/web,
packages/database) **Performance Goals**: 1-year cache headers, <1200px
optimized images **Constraints**: 5MB upload limit, JPEG/PNG/WebP only
**Scale/Scope**: Single-user, ~200 wines

## Constitution Check

- [x] TDD: Tests written for all API endpoints
- [x] Verification: Fresh verification before completion claims
- [x] Skills: Checked for applicable skills

---

## Phase 0.1: Research & Testing Strategy

### Research

| Topic             | Decision                  | Rationale                    |
| ----------------- | ------------------------- | ---------------------------- |
| Image library     | Sharp                     | Fast, efficient, maintained  |
| Upload middleware | Multer with memoryStorage | Works well with Sharp buffer |
| Storage strategy  | Local filesystem          | Simple for dev, defer S3     |
| Naming convention | `{wineId}.jpg`            | Simple, no conflicts         |

### Testing Strategy

| Check            | Output                                        |
| ---------------- | --------------------------------------------- |
| External APIs    | None                                          |
| Test types       | Unit (components), Integration (API, storage) |
| E2E permitted?   | Yes (no external APIs)                        |
| Mocking strategy | File system mocked, fetch mocked              |

**Testing Summary**:

```
Feature type: Mixed
Quota risks: None
Estimated tests: 45+
Distribution: Unit 40%, Integration 60%
```

---

## Phase 0.3: Integration Analysis

### Codebase Pattern Discovery

| Pattern Area    | Finding                                 |
| --------------- | --------------------------------------- |
| File uploads    | New pattern (first file upload feature) |
| Service layer   | Interface-based (StorageService)        |
| Error handling  | AppError class, specific error types    |
| Response format | `{ success, data, error }`              |

### Architecture Decisions

| Decision             | Rationale                              |
| -------------------- | -------------------------------------- |
| Storage abstraction  | Interface for local/S3 swap in Phase 3 |
| Validation utilities | Reusable for future upload features    |
| Processing utilities | Sharp pipeline as separate module      |

### Code Reuse

| Pattern Needed   | Existing Code | Decision |
| ---------------- | ------------- | -------- |
| Storage service  | None          | NEW      |
| Image validation | None          | NEW      |
| Image processing | None          | NEW      |
| Error classes    | AppError      | EXTEND   |

---

## Phase 0.5: Infrastructure & Migrations

### Database Migration

```prisma
model Wine {
  // ... existing fields ...
  imageUrl String?  // NEW - path to wine label image
}
```

**Migration Risk**: LOW (additive, nullable field)

### File Storage

**Location**: `uploads/wines/{wineId}.jpg`

**Directory creation**: Automatic on first upload

---

## Phase 1: Design & Contracts

### API Contracts

**Get Image**:

```
GET /api/wines/:id/image
Response: Image file (JPEG) with cache headers
404: { success: false, error: "Image not found" }
```

**Upload Image**:

```
POST /api/wines/:id/image
Body: multipart/form-data with "image" field
Response: { success: true, data: { imageUrl: string } }
Errors: 400 (validation), 500 (processing)
```

**Delete Image**:

```
DELETE /api/wines/:id/image
Response: { success: true }
```

### Processing Pipeline

1. Receive file via Multer (memory storage)
2. Validate MIME type
3. Validate magic numbers
4. Validate file size
5. Resize to max 1200px width (preserve aspect ratio)
6. Compress to 85% JPEG quality
7. Strip EXIF metadata
8. Save to `uploads/wines/{wineId}.jpg`
9. Update Wine.imageUrl in database

---

## Phase 2: Tasks

### Phase 1A: Display Existing Images

1. Add imageUrl field to Prisma schema, run migration
2. Create GET /api/wines/:id/image endpoint
3. Add image display to WineDetailModal
4. Add placeholder for missing images
5. Populate existing 217 wines with pre-downloaded images

### Phase 1B: Upload & Edit

1. Create storage service interface and local implementation
2. Create image validation utilities (type, size, magic numbers)
3. Create image processing utilities (Sharp pipeline)
4. Create POST /api/wines/:id/image endpoint
5. Create DELETE /api/wines/:id/image endpoint
6. Add image cascade deletion to wine delete
7. Add upload UI to WineDetailModal (edit mode)
8. Add staged upload to WineDetailModal (add mode)
9. Add client-side validation
10. Write comprehensive integration tests

---

## Files Created/Modified (Actual)

### Backend - New Files

- `apps/api/src/services/storage/storage.interface.ts`
- `apps/api/src/services/storage/local-storage.service.ts`
- `apps/api/src/utils/image-validation.ts`
- `apps/api/src/utils/image-processing.ts`

### Backend - Modified

- `apps/api/package.json` (added Sharp, Multer)
- `apps/api/src/app.ts` (new routes)
- `apps/api/src/errors/AppError.ts` (new error types)

### Database

- `packages/database/prisma/schema.prisma`

### Frontend

- `apps/web/src/app/page.tsx`
- `apps/web/src/components/WineDetailModal.tsx`

### Tests

- `apps/api/__tests__/routes/wine-image.integration.test.ts`
- `apps/web/__tests__/WineDetailModal.test.tsx`

---

## Future Phases (Out of Scope)

### Phase 2: Thumbnails

- Generate 200x200px thumbnails on upload
- Display in wine table
- Lazy loading

### Phase 3: Production Storage (AWS)

- S3StorageService implementation
- CloudFront CDN
- Presigned URLs

### Phase 4: Advanced Features

- Multiple images per wine
- Crop/rotate
- Drag-and-drop
- OCR label reading

---

## Outcome

**Status**: Phase 1A & 1B COMPLETED **Tests**: 343 passing (144 API + 199 Web)
**Time**: Multiple sessions (Dec 31 - Jan 20)

### Lessons Learned

1. Staged upload pattern works exceptionally well for UX
2. Client + server validation is essential
3. Sharp is the right choice for image processing
4. Local storage sufficient for development
5. Graceful error handling improves reliability

---

_This is a retrospective conversion showing SpecKit Lite format. The actual
implementation used conventional Claude planning._
