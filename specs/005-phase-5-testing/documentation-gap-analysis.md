# Documentation Gap Analysis

**Spec:** 005-phase-5-testing **Feature:** Phase 5 Testing & Refinement
**Date:** 2026-01-29

## Changes Summary

Phase 5 added comprehensive accessibility testing, focus management
improvements, and cross-viewport tests:

### Code Changes

1. **FilterDrawer.tsx** - Added focus trap, auto-focus on open, focus
   restoration on close
2. **WineDetailModal.tsx** - Added focus restoration on close
3. **Combobox.tsx** - Focus management validation
4. **vitest.setup.ts** - Added vitest-axe matchers
5. **vitest-axe.d.ts** - Type declarations for vitest-axe

### New Test Files

- **apps/web/src/**tests**/accessibility/** (7 files, 36 tests)
  - WineCard.a11y.test.tsx
  - WineTable.a11y.test.tsx
  - WineDetailModal.a11y.test.tsx
  - WineFilters.a11y.test.tsx
  - FilterDrawer.a11y.test.tsx
  - Combobox.a11y.test.tsx
  - SmallComponents.a11y.test.tsx

- **apps/web/src/**tests**/focus/** (3 files)
  - FilterDrawer.focus.test.tsx
  - WineDetailModal.focus.test.tsx
  - Combobox.focus.test.tsx

- **apps/web/src/**tests**/integration/viewport-devices.test.tsx** (21
  cross-viewport tests)

### Test Count Change

- **Before:** 675 tests (466 web + 209 API)
- **After:** 752 tests (543 web + 209 API)
- **Increase:** +77 tests

### Accessibility Fixes (11 total)

- Added ARIA attributes across components
- Added labels for interactive elements
- Added proper roles for semantic HTML
- Fixed focus management in modals and drawers

---

## Gap Analysis Using doc-gate Methodology

### HIGH Priority - DOCUMENT

#### 1. Test Count Update (FOUNDATIONAL)

**What changed:** Test count increased from 675 to 752 tests (+77 tests, +11.4%)

**Why HIGH:** Test counts are referenced in multiple docs as key quality
metrics. Outdated numbers reduce project credibility.

**Affected docs:**

- `CLAUDE.md` - Line 9: "npm test # Run all tests (479 tests)"
- `README.md` - Line 25: "479 tests, 80%+ coverage"
- `README.md` - Line 88: "Run all tests (479 tests)"
- `documents/project-summary.md` - Multiple references to 675, 466, 270, 209
- `documents/test-summary.md` - Entire file based on 479 test count

**Impact:** Multiple documentation files contain stale test counts that
contradict actual test results.

---

#### 2. New Test Infrastructure - vitest-axe (ARCHITECTURAL)

**What changed:** Added vitest-axe dependency for automated accessibility
testing

**Why HIGH:** New testing infrastructure represents a shift in testing strategy
(axe-core integration)

**Affected docs:**

- `CLAUDE.md` - Tech Stack section should mention vitest-axe
- `documents/project-summary.md` - Testing section should reference axe-core
- `documents/test-summary.md` - Dependencies section should list vitest-axe

**Impact:** Documentation doesn't reflect new testing capabilities for
accessibility validation.

---

#### 3. Focus Management Pattern (BEHAVIORAL CHANGE)

**What changed:** FilterDrawer and WineDetailModal now have focus restoration on
close

**Why HIGH:** Behavior change in existing components affects user experience

**Affected docs:**

- `documents/project-summary.md` - Accessibility section (lines 373-400)
- `.claude/skills/ui-accessibility/SKILL.md` - Already has focus trap
  requirements

**Impact:** Project summary documents old focus trap behavior but not focus
restoration.

---

#### 4. New Test File Organization Pattern (ARCHITECTURAL)

**What changed:** Created `__tests__/accessibility/` and `__tests__/focus/`
subdirectories

**Why HIGH:** New test organization pattern for categorizing test types

**Affected docs:**

- `documents/test-summary.md` - Test file listing should show new structure
- `documents/project-summary.md` - Project structure section

**Impact:** Test documentation doesn't show the new test organization pattern.

---

### MEDIUM Priority - DOCUMENT

#### 5. Accessibility Testing Coverage (PUBLIC API)

**What changed:** 36 new accessibility tests using axe-core across 7 components

**Why MEDIUM:** Demonstrates compliance approach but doesn't change external API

**Affected docs:**

- `documents/test-summary.md` - Should add accessibility test section
- `documents/project-summary.md` - Accessibility section could mention automated
  testing

**Impact:** Missing documentation of automated accessibility validation
strategy.

---

#### 6. Cross-Viewport Integration Tests (INTEGRATION POINT)

**What changed:** Added viewport-devices.test.tsx with tests at 4 device sizes

**Why MEDIUM:** New integration test category validating responsive behavior

**Affected docs:**

- `documents/test-summary.md` - Integration test section

**Impact:** Integration tests section doesn't mention cross-viewport testing
strategy.

---

### SKIP - Implementation Details

#### ❌ Individual test cases for each component

**Reason:** Implementation detail - test case specifics don't belong in
high-level docs

#### ❌ vitest.setup.ts modification details

**Reason:** Setup file changes are internal test configuration

#### ❌ vitest-axe.d.ts type declarations

**Reason:** Type declaration file is infrastructure detail

#### ❌ Specific ARIA attributes added

**Reason:** Component-level implementation details, not architectural

#### ❌ Focus trap implementation logic

**Reason:** Code pattern detail - behavior documented, not implementation

---

## Summary

**Items Identified:** 11 total

- **HIGH Priority:** 4 items (test counts, vitest-axe, focus restoration, test
  organization)
- **MEDIUM Priority:** 2 items (a11y testing coverage, cross-viewport tests)
- **SKIP:** 5 items (implementation details)

**Primary Documentation Targets:**

1. `CLAUDE.md` - Test count, tech stack
2. `README.md` - Test count
3. `documents/project-summary.md` - Test counts, accessibility section, test
   structure
4. `documents/test-summary.md` - Comprehensive update for new tests, structure,
   dependencies

---

**Next Phase:** Documentation Search - Locate specific sections in each doc that
need updates.
