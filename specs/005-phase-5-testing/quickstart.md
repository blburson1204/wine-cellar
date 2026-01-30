# Quickstart: Phase 5 Testing & Refinement

**Spec**: 005-phase-5-testing **Date**: 2026-01-29

## What This Phase Does

Adds automated accessibility testing (axe-core), focus management tests and
fixes, cross-viewport integration tests, and bundle size baseline documentation
for the completed mobile-responsive implementation (Phases 1-4).

## Prerequisites

```bash
# Install vitest-axe in the web app
cd apps/web && npm install --save-dev vitest-axe
```

## Setup: vitest-axe

Add to `apps/web/vitest.setup.ts`:

```typescript
import * as matchers from 'vitest-axe/matchers';
expect.extend(matchers);
```

Add type declaration to `apps/web/vitest-axe.d.ts`:

```typescript
import 'vitest-axe/extend-expect';
```

## New Test Files

| File                                          | Purpose                                                                               | FR Coverage    |
| --------------------------------------------- | ------------------------------------------------------------------------------------- | -------------- |
| `accessibility/WineCard.a11y.test.tsx`        | axe-core audit of WineCard                                                            | FR-001, FR-002 |
| `accessibility/WineTable.a11y.test.tsx`       | axe-core audit of WineTable (both layouts)                                            | FR-001, FR-002 |
| `accessibility/WineDetailModal.a11y.test.tsx` | axe-core audit of modal (view + edit)                                                 | FR-001, FR-002 |
| `accessibility/WineFilters.a11y.test.tsx`     | axe-core audit of filters                                                             | FR-001, FR-002 |
| `accessibility/FilterDrawer.a11y.test.tsx`    | axe-core audit of drawer                                                              | FR-001, FR-002 |
| `accessibility/Combobox.a11y.test.tsx`        | axe-core audit of combobox                                                            | FR-001, FR-002 |
| `accessibility/SmallComponents.a11y.test.tsx` | axe-core for MobileFilterToggle, MobileSortSelector, LoadingSpinner, WineListSkeleton | FR-001, FR-002 |
| `focus/WineDetailModal.focus.test.tsx`        | Focus trap + restoration                                                              | FR-004, FR-006 |
| `focus/FilterDrawer.focus.test.tsx`           | Focus trap + restoration                                                              | FR-005, FR-007 |
| `focus/Combobox.focus.test.tsx`               | Focus management in dropdown                                                          | FR-008         |
| `integration/viewport-devices.test.tsx`       | Cross-viewport at 375/393/768/1024px                                                  | FR-009–FR-014  |

## Source Files Modified (Fixes)

| File                              | Change                                 | FR     |
| --------------------------------- | -------------------------------------- | ------ |
| `FilterDrawer.tsx`                | Add focus trap (Tab/Shift+Tab cycling) | FR-005 |
| `FilterDrawer.tsx`                | Add auto-focus on open                 | FR-005 |
| `WineDetailModal.tsx`             | Add focus restoration on close         | FR-006 |
| `FilterDrawer.tsx`                | Add focus restoration on close         | FR-007 |
| Any component with axe violations | Fix violations                         | FR-003 |

## Verification Commands

```bash
# Run all tests (must be 675+ with no regressions)
npm test

# Run only new accessibility tests
cd apps/web && npx vitest run src/__tests__/accessibility/

# Run only focus management tests
cd apps/web && npx vitest run src/__tests__/focus/

# Run only viewport integration tests
cd apps/web && npx vitest run src/__tests__/integration/viewport-devices.test.tsx

# Bundle size analysis
cd apps/web && npx next build

# Full quality gate
npm run type-check && npm run lint && npm run format:check && npm test
```

## Expected Outcomes

- **35-45 new tests** all passing
- **Zero axe-core critical/serious violations**
- **Focus trapping** works in WineDetailModal and FilterDrawer
- **Focus restoration** works when modal/drawer closes
- **Bundle size baseline** documented
- **All 675+ existing tests** still passing
