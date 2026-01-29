# Research: Phase 4 — Touch & Interaction Optimization

**Date**: 2026-01-29 | **Spec**: 004-phase-4-touch

## Touch Target Audit Results

### Current State (WCAG 44x44px Compliance)

| Component           | Element                  | Current Size           | Compliant | Fix Needed |
| ------------------- | ------------------------ | ---------------------- | --------- | ---------- |
| WineCard            | Favorite button          | 44x44px                | Yes       | None       |
| WineCard            | Card click area          | 44px min-height        | Yes       | None       |
| MobileFilterToggle  | Filter button            | 44x44px                | Yes       | None       |
| MobileSortSelector  | Sort toggle              | 44x44px                | Yes       | None       |
| MobileSortSelector  | Sort dropdown            | 44px min-height        | Yes       | None       |
| WineDetailModal     | Close button             | 44px min-height        | Yes       | None       |
| WineDetailModal     | Edit/Save/Cancel buttons | 44px min-height        | Yes       | None       |
| Combobox            | Input + Options          | 44px min-height        | Yes       | None       |
| **WineFilters**     | **Close button**         | **32x32px**            | **No**    | **FR-001** |
| **WineFilters**     | **Checkbox indicators**  | **16x16px**            | **No**    | **FR-002** |
| **WineFilters**     | **Select dropdowns**     | **8px padding**        | **No**    | **FR-003** |
| **WineFilters**     | **Price inputs**         | **6px padding**        | **No**    | **FR-004** |
| **WineFilters**     | **Clear All button**     | **No explicit height** | **No**    | **FR-005** |
| **WineDetailModal** | **Favorite star**        | **24px span**          | **No**    | **FR-006** |
| **WineDetailModal** | **Wine link**            | **16px text**          | **No**    | **FR-007** |

### Gesture Support Audit

- **Touch events (onTouchStart/End/Move)**: None found in codebase
- **Swipe detection**: Not implemented
- **FilterDrawer**: Has `_onClose` param ready for future use (line 9 comment)
- **Escape key on FilterDrawer**: Not implemented (WineDetailModal has it)
- **Backdrop**: Exists as separate component, click-to-close works

### Loading State Audit

- **Initial page load**: Plain text "Loading your collection..." (page.tsx
  line 382)
- **Save/Upload**: Text-only feedback ("Saving...", "Uploading...",
  "Deleting...")
- **Skeleton loaders**: None exist
- **Spinner components**: None exist
- **Existing transitions**: 200ms standard (inline), 300ms for drawer slide
  (Tailwind)

## Technology Decisions

### Swipe Gesture Implementation

**Decision**: Custom touch event handler in FilterDrawer (no library)

**Rationale**:

- Only one swipe target (FilterDrawer left-to-close)
- Adding a gesture library (e.g., react-use-gesture) is overkill for one use
  case
- Touch events are straightforward: track touchStart X, touchMove deltaX,
  touchEnd threshold check
- Threshold: 50px horizontal + velocity check prevents accidental triggers

**Alternatives considered**:

- `react-use-gesture` / `@use-gesture/react`: Too heavy for one gesture
- CSS scroll-snap: Not applicable to drawer close

### Skeleton Loader Implementation

**Decision**: Custom WineListSkeleton component using Tailwind `animate-pulse`

**Rationale**:

- Tailwind includes `animate-pulse` out of the box (no config changes needed)
- Matches existing pattern of using Tailwind utilities for animations
- Skeleton shape mimics WineCard layout on mobile, table rows on desktop

### Loading Spinner Implementation

**Decision**: Custom LoadingSpinner component using CSS `@keyframes` spin

**Rationale**:

- Tailwind's `animate-spin` is available by default
- Small inline spinner (16px) sits next to button text
- Consistent with wine-burgundy color theme

## Testing Strategy

**Feature type**: Frontend-heavy **External APIs**: None (existing fetch
patterns unchanged) **E2E**: Not needed (pure UI changes)

| Test Type   | Count | Approach                                           |
| ----------- | ----- | -------------------------------------------------- |
| Unit        | ~20   | RTL render + assert styles/attributes/interactions |
| Integration | 0     | No cross-component flows added                     |
| E2E         | 0     | Not applicable                                     |

**Mocking strategy**:

- useMediaQuery: vi.mock for responsive tests
- Touch events: fireEvent.touchStart/touchMove/touchEnd
- No new API mocks needed

**Test file locations** (following existing pattern):

- `apps/web/src/__tests__/components/FilterDrawer.gesture.test.tsx`
- `apps/web/src/__tests__/components/WineFilters.touchTargets.test.tsx`
- `apps/web/src/__tests__/components/WineDetailModal.touchTargets.test.tsx`
- `apps/web/src/__tests__/components/LoadingSpinner.test.tsx`
- `apps/web/src/__tests__/components/WineListSkeleton.test.tsx`
