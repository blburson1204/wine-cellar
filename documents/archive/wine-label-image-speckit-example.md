# SpecKit Conversion: Wine Label Image Feature

**Purpose**: Retrospective example showing what the Wine Label Image feature
planning documents would look like using the SpecKit v2 methodology.

**Original Document**:
[wine-label-image-feature-plan.md](wine-label-image-feature-plan.md)

---

# Part 1: Feature Specification (spec.md)

```yaml
---
meta:
  spec_id: 002
  spec_name: wine-label-images
  status: completed
  phase: completed
  created: 2025-12-31
  updated: 2026-01-20

summary:
  goals:
    - {
        id: G1,
        description: 'Display wine label images in detail modal',
        priority: HIGH,
      }
    - {
        id: G2,
        description: 'Upload images during wine creation',
        priority: HIGH,
      }
    - {
        id: G3,
        description: 'Upload/replace/delete images for existing wines',
        priority: HIGH,
      }
    - { id: G4, description: 'Preview images before saving', priority: MEDIUM }
  constraints:
    - { id: C1, description: 'File size limit 5MB', type: TECHNICAL }
    - {
        id: C2,
        description: 'Supported formats: JPEG, PNG, WebP',
        type: TECHNICAL,
      }
    - {
        id: C3,
        description: 'Local storage for development phase',
        type: INFRASTRUCTURE,
      }
  decisions:
    - {
        id: D1,
        decision: 'Sharp library for image processing',
        rationale: 'Fast, efficient, well-maintained',
      }
    - {
        id: D2,
        decision: 'Staged upload pattern for new wines',
        rationale: 'Preview before wine exists',
      }
    - {
        id: D3,
        decision: 'Defer thumbnails to Phase 2',
        rationale: 'Faster MVP delivery',
      }
    - {
        id: D4,
        decision: 'Defer S3 to Phase 3',
        rationale: 'Local storage sufficient for dev',
      }

critical_requirements:
  type: feature-major
  ui_changes: moderate
---
```

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

## Clarifications

_Required for feature-major specs before /plan_

### Session 1

**Q**: Should image upload be synchronous (blocking) or asynchronous? **A**:
Synchronous for simplicity — user waits for upload to complete before
proceeding.

**Q**: Should images be served directly or via presigned URLs? **A**: Direct
serving for Phase 1 (local storage). Presigned URLs deferred to Phase 3 (S3).

**Q**: Should we support image editing (crop/rotate) in Phase 1? **A**: No —
defer to Phase 4. Phase 1 focuses on upload/display/delete only.

---

## Review Checklist (Gate)

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Test strategy defined
- [x] Error handling defined
- [x] UI complexity classified

---

# Part 2: Implementation Plan (plan.md)

```yaml
---
meta:
  spec_id: 002
  spec_name: wine-label-images
  phase: completed
  updated: 2026-01-20

summary:
  tech_stack: [TypeScript, React, Express, Prisma, Sharp, Multer]
  external_deps: []
  test_strategy: { unit: 40, integration: 60, e2e: 0 }
  deployment: immediate
---
```

# Implementation Plan: Wine Label Images

**Branch**: `002-wine-label-images` | **Date**: 2025-12-31 | **Spec**:
specs/002-wine-label-images/spec.md

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

_MANDATORY_

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

_MANDATORY_

### Codebase Pattern Discovery

| Pattern Area    | Finding                                 |
| --------------- | --------------------------------------- |
| File uploads    | New pattern (first file upload feature) |
| Service layer   | Interface-based (StorageService)        |
| Error handling  | AppError class, specific error types    |
| Response format | `{ success, data, error }`              |

### Code Reuse

**Skill**: `code-reuse-analysis`

| Pattern Needed   | Existing Code | Decision |
| ---------------- | ------------- | -------- |
| Storage service  | None          | NEW      |
| Image validation | None          | NEW      |
| Image processing | None          | NEW      |
| Error classes    | AppError      | EXTEND   |

### Architecture Decisions

**Skill**: `arch-decisions`

| Decision             | Rationale                              |
| -------------------- | -------------------------------------- |
| Storage abstraction  | Interface for local/S3 swap in Phase 3 |
| Validation utilities | Reusable for future upload features    |
| Processing utilities | Sharp pipeline as separate module      |

---

## Phase 0.4: Design Pre-flight

_CONDITIONAL — Included because UI is classified as Moderate_

### Component Inventory

| FR     | UI Element          | Existing?     | Strategy |
| ------ | ------------------- | ------------- | -------- |
| FR-001 | Image display       | No            | BUILD    |
| FR-002 | Placeholder         | No            | BUILD    |
| FR-003 | Staged upload       | No            | BUILD    |
| FR-006 | Preview display     | No            | BUILD    |
| FR-004 | Upload/replace UI   | No            | BUILD    |
| FR-005 | Delete confirmation | Dialog exists | REUSE    |

### Design Token Compliance

- [x] All colors use design tokens
- [x] All spacing uses Tailwind standards
- [x] All typography uses text scale

---

## Phase 0.5: Infrastructure & Migrations

_CONDITIONAL — Included because this feature adds a database field and new
dependencies_

### Migrations

| Migration      | Type     | Risk | Rollback      |
| -------------- | -------- | ---- | ------------- |
| Add `imageUrl` | Additive | LOW  | Remove column |

**Migration Risk**: LOW (additive, nullable string)

### New Dependencies

| Package | Purpose              | Risk |
| ------- | -------------------- | ---- |
| Sharp   | Image processing     | LOW  |
| Multer  | File upload handling | LOW  |

### File Storage

**Location**: `uploads/wines/{wineId}.jpg` **Directory creation**: Automatic on
first upload

---

## Phase 1: Design & Contracts

### Data Model

```prisma
model Wine {
  // ... existing fields ...
  imageUrl String?  // NEW - path to wine label image
}
```

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

## Phase 2: Task Planning Approach

_Executed by /tasks command, NOT /plan_

**Strategy**: Generate from Phase 1 contracts, split into Phase 1A (display) and
Phase 1B (upload)

| From       | Task Type                             | Order |
| ---------- | ------------------------------------- | ----- |
| Data model | Schema migration                      | 1st   |
| Contracts  | API endpoints (GET, POST, DELETE)     | 2nd   |
| Components | Display UI (modal image, placeholder) | 3rd   |
| Components | Upload UI (picker, preview, delete)   | 4th   |
| Stories    | Integration (staged upload, cascade)  | 5th   |

---

## Progress Tracking

| Phase                  | Status | Skip If                        |
| ---------------------- | ------ | ------------------------------ |
| 0.1 Research + Testing | [x]    | Never                          |
| 0.2 Permissions        | SKIP   | No roles in spec               |
| 0.3 Integration        | [x]    | Never                          |
| 0.4 Design Pre-flight  | [x]    | Backend-only/Minor UI          |
| 0.5 Infrastructure     | [x]    | No env/migrations/deprecations |
| 1 Design & Contracts   | [x]    | —                              |
| 2 Task Planning        | [x]    | —                              |

---

# Part 3: Tasks (tasks.json)

```json
{
  "spec_id": "002",
  "spec_name": "wine-label-images",
  "generated": "2025-12-31",
  "tasks": [
    {
      "id": "T001",
      "phase": "setup",
      "description": "Add imageUrl field to Prisma schema and run migration",
      "status": "completed",
      "parallel": false,
      "target_file": "packages/database/prisma/schema.prisma"
    },
    {
      "id": "T002",
      "phase": "setup",
      "description": "Add Sharp and Multer dependencies to API package",
      "status": "completed",
      "parallel": false,
      "target_file": "apps/api/package.json"
    },
    {
      "id": "T003",
      "phase": "core",
      "description": "Create storage service interface and local implementation",
      "status": "completed",
      "parallel": true,
      "target_file": "apps/api/src/services/storage/local-storage.service.ts"
    },
    {
      "id": "T004",
      "phase": "core",
      "description": "Create image validation utilities (type, size, magic numbers)",
      "status": "completed",
      "parallel": true,
      "target_file": "apps/api/src/utils/image-validation.ts"
    },
    {
      "id": "T005",
      "phase": "core",
      "description": "Create image processing utilities (Sharp resize/compress pipeline)",
      "status": "completed",
      "parallel": true,
      "target_file": "apps/api/src/utils/image-processing.ts"
    },
    {
      "id": "T006",
      "phase": "core",
      "description": "Create GET /api/wines/:id/image endpoint with cache headers",
      "status": "completed",
      "parallel": false,
      "target_file": "apps/api/src/app.ts"
    },
    {
      "id": "T007",
      "phase": "core",
      "description": "Create POST /api/wines/:id/image endpoint with Multer upload",
      "status": "completed",
      "parallel": false,
      "target_file": "apps/api/src/app.ts"
    },
    {
      "id": "T008",
      "phase": "core",
      "description": "Create DELETE /api/wines/:id/image endpoint with file cleanup",
      "status": "completed",
      "parallel": false,
      "target_file": "apps/api/src/app.ts"
    },
    {
      "id": "T009",
      "phase": "core",
      "description": "Add image cascade deletion to wine delete handler",
      "status": "completed",
      "parallel": false,
      "target_file": "apps/api/src/app.ts"
    },
    {
      "id": "T010",
      "phase": "core",
      "description": "Add image display to WineDetailModal (view mode, 300px, placeholder)",
      "status": "completed",
      "parallel": true,
      "target_file": "apps/web/src/components/WineDetailModal.tsx"
    },
    {
      "id": "T011",
      "phase": "core",
      "description": "Add upload/replace/delete UI to WineDetailModal (edit mode)",
      "status": "completed",
      "parallel": false,
      "target_file": "apps/web/src/components/WineDetailModal.tsx"
    },
    {
      "id": "T012",
      "phase": "integration",
      "description": "Add staged image upload flow to WineDetailModal (add mode)",
      "status": "completed",
      "parallel": false,
      "target_file": "apps/web/src/components/WineDetailModal.tsx"
    },
    {
      "id": "T013",
      "phase": "integration",
      "description": "Wire image upload into page.tsx wine creation and edit flows",
      "status": "completed",
      "parallel": false,
      "target_file": "apps/web/src/app/page.tsx"
    },
    {
      "id": "T014",
      "phase": "polish",
      "description": "Write comprehensive integration tests for image API endpoints",
      "status": "completed",
      "parallel": true,
      "target_file": "apps/api/__tests__/routes/wine-image.integration.test.ts"
    },
    {
      "id": "T015",
      "phase": "polish",
      "description": "Write component tests for image display, upload, and validation",
      "status": "completed",
      "parallel": true,
      "target_file": "apps/web/src/__tests__/components/WineDetailModal.image.test.tsx"
    },
    {
      "id": "T-DOC-GATE",
      "phase": "verify",
      "description": "Documentation reconciliation - identify and update affected docs",
      "status": "completed",
      "parallel": false,
      "agent": "documentation-reconciliation",
      "gate": "T015",
      "verify": "documentation-update-report.md generated with Status: PASS",
      "block_on": "Status: DRIFT_DETECTED in report"
    },
    {
      "id": "T-FINAL",
      "phase": "verify",
      "description": "All verification gates passed",
      "status": "completed",
      "parallel": false,
      "gate": "T-DOC-GATE",
      "composed_of": [
        {
          "check": "typecheck",
          "always": true,
          "command": "npm run type-check"
        },
        { "check": "lint", "always": true, "command": "npm run lint" },
        { "check": "unit", "always": true, "command": "npm test" },
        { "check": "integration", "always": true, "command": "npm test" },
        { "check": "security", "always": true, "agent": "code-reviewer" },
        { "check": "code-review", "always": true, "agent": "code-reviewer" },
        {
          "check": "visual",
          "always": false,
          "condition": "ui_changes = moderate"
        }
      ]
    }
  ]
}
```

---

## Outcome

**Status**: Phase 1A & 1B COMPLETED **Tests**: 343 passing (144 API + 199 Web)
**Time**: Multiple sessions (Dec 31 - Jan 20) **Clarification gate**: Required
(type = feature-major) — Session 1 completed

### Lessons Learned

1. Staged upload pattern works exceptionally well for UX
2. Client + server validation is essential
3. Sharp is the right choice for image processing
4. Local storage sufficient for development
5. Graceful error handling improves reliability

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

## Files Created/Modified (Actual)

### Backend — New Files

- `apps/api/src/services/storage/storage.interface.ts`
- `apps/api/src/services/storage/local-storage.service.ts`
- `apps/api/src/utils/image-validation.ts`
- `apps/api/src/utils/image-processing.ts`

### Backend — Modified

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
- `apps/web/src/__tests__/components/WineDetailModal.image.test.tsx`

---

_This is a retrospective conversion showing SpecKit v2 format. The actual
implementation used conventional Claude planning._
