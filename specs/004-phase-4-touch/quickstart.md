# Quickstart: Phase 4 — Touch & Interaction Optimization

**Branch**: 004-phase-4-touch | **Date**: 2026-01-29

## Verification Steps

### 1. Touch Targets (FR-001 to FR-007)

Run touch target tests:

```bash
npm run test:web -- --run --reporter=verbose FilterDrawer WineFilters.touchTargets WineDetailModal.touchTargets
```

**Manual check** (browser DevTools, mobile viewport):

- Open filter drawer → close button should be visibly larger (44px)
- All checkboxes, selects, inputs should be easy to tap
- Wine detail modal → favorite star should be a proper button
- Wine detail modal → "Wine Details" link should have generous tap area

### 2. Gestures (FR-008 to FR-010)

Run gesture tests:

```bash
npm run test:web -- --run --reporter=verbose FilterDrawer.gesture
```

**Manual check** (mobile device or touch simulation):

- Open filter drawer → press Escape → drawer closes
- Open filter drawer → swipe left → drawer closes
- Open filter drawer → start swipe but reverse → drawer stays open

### 3. Loading States (FR-011 to FR-013)

Run loading state tests:

```bash
npm run test:web -- --run --reporter=verbose LoadingSpinner WineListSkeleton
```

**Manual check**:

- Hard refresh page → should see skeleton placeholder (not text)
- Open wine detail → save changes → should see spinner in button
- Upload image → should see spinner in upload button

### 4. Full Verification

```bash
npm test              # All tests pass (625+ existing + ~20 new)
npm run type-check    # TypeScript clean
npm run lint          # ESLint clean
npm run format:check  # Prettier clean
```

### 5. Regression Check

- Desktop layout unchanged (verify at 1280px+ viewport)
- Existing filter functionality works
- Modal open/close/save flows unchanged
- Mobile card/table switching still works
