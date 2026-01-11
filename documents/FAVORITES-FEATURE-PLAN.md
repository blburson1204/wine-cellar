# Wine Favorites Feature - Implementation Plan

**Date**: January 11, 2026 **Status**: COMPLETED **Author**: Brian (with Claude)

---

## Executive Summary

**FEATURE COMPLETE!**

Wine favorites functionality has been successfully implemented in the Wine
Cellar application. Users can now:

- Mark wines as favorites with a star icon in the wine table
- Toggle favorite status from the wine detail modal header
- Filter to show only favorite wines
- See visual distinction between favorite and non-favorite wines

This document outlines the completed implementation.

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Implementation Details](#implementation-details)
3. [Database Design](#database-design)
4. [API Changes](#api-changes)
5. [Frontend Components](#frontend-components)
6. [UI Design](#ui-design)
7. [Testing](#testing)
8. [Files Modified](#files-modified)

---

## Feature Overview

### Goals

- Allow users to mark wines as favorites
- Provide quick visual identification of favorite wines
- Enable filtering to show only favorites
- Support toggling favorites from multiple UI locations

### User Stories (Implemented)

1. As a user, I want to click a star icon in the wine table to mark a wine as
   favorite
2. As a user, I want to see filled stars for favorites and outline stars for
   non-favorites
3. As a user, I want to toggle favorite status from the wine detail modal
4. As a user, I want to filter my wine list to show only favorites
5. As a user, I want the star color to match the app's wine theme (ruby red)

---

## Implementation Details

### Database Layer

**File**: `packages/database/prisma/schema.prisma`

Added `favorite` Boolean field to Wine model:

```prisma
model Wine {
  // ... existing fields ...
  favorite      Boolean   @default(false)
  // ... existing fields ...
}
```

### API Layer

**File**: `apps/api/src/schemas/wine.schema.ts`

- Added `favorite: z.boolean().default(false)` to createWineSchema
- Added `favorite: z.boolean().optional()` to updateWineSchema

### Frontend Implementation

#### State Management

**File**: `apps/web/src/app/page.tsx`

- Added `showOnlyFavorites` state for filter toggle
- Added `handleToggleFavorite` function with optimistic updates
- Integrated favorites filter into `filteredAndSortedWines` useMemo
- Updated `handleClearFilters` to reset favorites filter

#### Wine Table

**File**: `apps/web/src/components/WineTable.tsx`

- Added `favorite: boolean` to Wine interface
- Added `onToggleFavorite: (wine: Wine) => void` prop
- Added star icon column (first column, before Vintage)
- Clicking star toggles favorite status via callback
- Click stops propagation (doesn't open modal)
- Filled star () for favorites, outline star () for non-favorites

#### Wine Detail Modal

**File**: `apps/web/src/components/WineDetailModal.tsx`

- Added `favorite: boolean` to Wine interface
- Added star icon in modal header (next to wine name)
- Clickable in view mode to toggle status
- Visual consistency with table star styling

#### Wine Filters

**File**: `apps/web/src/components/WineFilters.tsx`

- Added `showOnlyFavorites: boolean` prop
- Added `onShowOnlyFavoritesChange: (value: boolean) => void` prop
- Added "Favorites" checkbox in Show Wine container

---

## Database Design

### Schema Addition

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
  drinkByDate   DateTime?
  rating        Float?
  notes         String?
  wineLink      String?
  imageUrl      String?
  favorite      Boolean   @default(false)  // NEW FIELD
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

---

## API Changes

### Create Wine

POST `/api/wines` now accepts optional `favorite` field (defaults to `false`)

### Update Wine

PUT `/api/wines/:id` now accepts optional `favorite` field for toggling

### Response Format

All wine responses now include `favorite: boolean` field.

---

## Frontend Components

### WineTable Component

**Props Added**:

- `onToggleFavorite: (wine: Wine) => void`

**New Column**:

- First column (40px width) contains star icon
- Star click handler stops propagation to prevent row click

**Star Styling**:

- Filled star: `#E63946` (ruby red)
- Outline star: `rgba(255, 255, 255, 0.3)`
- Hover (non-favorite): `rgba(230, 57, 70, 0.6)`

### WineDetailModal Component

**Header Enhancement**:

- Star icon displayed next to wine name
- Clickable in view mode
- Same color scheme as table

### WineFilters Component

**New Filter**:

- "Favorites" checkbox in Show Wine container
- When checked, only shows wines with `favorite: true`

---

## UI Design

### Star Icon Styling

| State                | Color                      | Symbol       |
| -------------------- | -------------------------- | ------------ |
| Favorite             | `#E63946` (Ruby Red)       | Filled star  |
| Not Favorite         | `rgba(255, 255, 255, 0.3)` | Outline star |
| Hover (Not Favorite) | `rgba(230, 57, 70, 0.6)`   | Outline star |

### Design Decisions

1. **Ruby Red Color**: Matches the wine-themed color palette of the application
2. **Star Position**: First column in table for quick access
3. **Click Behavior**: Star click doesn't open modal (stops propagation)
4. **Optimistic Updates**: UI updates immediately, reverts on API failure

---

## Testing

### Test Updates

**File**: `apps/web/__tests__/WineTable.test.tsx`

- Added `favorite: boolean` to all mock wine objects
- Tests pass with new field included

### Manual Testing Scenarios

1. Click star in table row - toggles without opening modal
2. Open modal - star reflects current favorite state
3. Toggle star in modal - updates immediately
4. Enable "Favorites" filter - shows only favorites
5. Clear filters - resets favorites filter
6. New wine creation - defaults to non-favorite

---

## Files Modified

### Database

- `packages/database/prisma/schema.prisma` - Added favorite field

### API

- `apps/api/src/schemas/wine.schema.ts` - Updated Zod schemas

### Frontend

- `apps/web/src/app/page.tsx` - State, handlers, filter logic
- `apps/web/src/components/WineTable.tsx` - Star column, toggle handler
- `apps/web/src/components/WineDetailModal.tsx` - Star in header
- `apps/web/src/components/WineFilters.tsx` - Favorites checkbox

### Tests

- `apps/web/__tests__/WineTable.test.tsx` - Updated mock data
- `apps/web/__tests__/WineFilters.test.tsx` - Updated mock data

---

## Success Metrics

### Functionality

- 100% of favorite toggles persist correctly
- Filter shows only favorites when enabled
- Star icons display correct state

### User Experience

- Immediate visual feedback on toggle
- Intuitive star icon placement
- Consistent styling with app theme

### Quality

- All 146 tests passing
- Type check passes
- No console errors

---

## Related Documentation

- [WINE-LABEL-IMAGE-FEATURE-PLAN.md](WINE-LABEL-IMAGE-FEATURE-PLAN.md) - Image
  feature documentation
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Project overview
- [Test-Summary.md](Test-Summary.md) - Test coverage details

---

**Document Status**: Complete **Feature Status**: COMPLETED **Implementation
Date**: January 11, 2026
