---
# Context Optimization Metadata
meta:
  spec_id: 005-phase-5-testing
  spec_name: Phase 5 Testing & Refinement
  status: draft
  phase: specify
  created: 2026-01-29
  updated: 2026-01-29

# Quick Reference (for checkpoint resume)
summary:
  goals:
    - id: G1
      description:
        'Add automated accessibility testing with axe-core across all responsive
        components'
      priority: HIGH
    - id: G2
      description:
        'Verify focus management and keyboard trapping in modals and drawers'
      priority: HIGH
    - id: G3
      description: 'Add cross-viewport integration tests at key device sizes'
      priority: HIGH
    - id: G4
      description: 'Validate color contrast meets WCAG AA standards'
      priority: MEDIUM
    - id: G5
      description: 'Analyze bundle size impact of Phases 1-4 additions'
      priority: MEDIUM
    - id: G6
      description: 'Fix any issues discovered during testing and auditing'
      priority: HIGH
  constraints:
    - id: C1
      description:
        'Must use existing Vitest + React Testing Library infrastructure'
      type: TECHNICAL
    - id: C2
      description: 'Must not break any of the existing 675 tests'
      type: FUNCTIONAL
    - id: C3
      description: 'No UI changes unless required to fix discovered issues'
      type: FUNCTIONAL
    - id: C4
      description:
        'jsdom limitation: cannot compute CSS — tests must assert on className
        strings, inline styles, or ARIA attributes'
      type: TECHNICAL
  decisions:
    - id: D1
      decision:
        'Use vitest-axe (axe-core wrapper) for automated accessibility testing'
      rationale:
        'Integrates directly with existing Vitest + RTL setup, no additional
        test runner needed'
    - id: D2
      decision: 'Test at 4 key viewport widths: 375px, 393px, 768px, 1024px'
      rationale:
        'Covers iPhone SE, iPhone 14 Pro, iPad, and the desktop breakpoint
        boundary'
    - id: D3
      decision: 'Bundle analysis via next build output, not a separate tool'
      rationale:
        'Next.js already reports bundle sizes — no new dependency needed'

# CRITICAL REQUIREMENTS - Must verify during implementation
critical_requirements:
  type: feature-minor
  ui_changes: none
---

# Feature Specification: Phase 5 Testing & Refinement

**Feature Branch**: `005-phase-5-testing` **Created**: 2026-01-29 **Status**:
Draft **Input**: User description: "Phase 5 Testing & Refinement - Comprehensive
testing and refinement of mobile-responsive implementation across all phases
(1-4). Includes automated accessibility audits, cross-viewport tests, focus
management validation, color contrast checks, bundle size analysis, and fixing
any discovered issues."

---

## Context

This is Phase 5 of the Mobile Responsive project. Phases 1-4 are complete:

- **Phase 1**: Tailwind CSS configured, viewport meta tag, design tokens,
  useMediaQuery hook
- **Phase 2**: MobileFilterToggle, FilterDrawer with backdrop, responsive layout
  (1024px breakpoint)
- **Phase 3**: WineCard, WineTable responsive switching, WineDetailModal mobile
  layout, Combobox replacing datalist, MobileSortSelector, 44px touch targets
- **Phase 4**: Loading states (LoadingSpinner, WineListSkeleton), gestures (ESC
  key, swipe-to-close on FilterDrawer), touch target refinements

**Current test state**: 675 tests passing (466 web + 209 API). Existing tests
cover component rendering, responsive layout switching, touch target sizes,
keyboard interactions, and gesture handling.

**Phase 5 focus**: Fill testing gaps — automated accessibility auditing, focus
management validation, cross-viewport integration tests, color contrast checks,
bundle size analysis, and fix any issues found.

---

## User Scenarios & Testing

### Primary User Story

As a developer maintaining the wine cellar app, I want comprehensive automated
tests verifying accessibility, responsive behavior across real device sizes, and
focus management in interactive components, so I can confidently ship the
mobile-responsive implementation knowing it meets WCAG 2.1 AA standards and
works correctly across devices.

### Acceptance Scenarios

1. **Given** the full test suite runs, **When** axe-core accessibility checks
   execute against each major component, **Then** zero critical or serious
   accessibility violations are reported
2. **Given** WineDetailModal is open on mobile, **When** the user presses Tab
   repeatedly, **Then** focus remains trapped within the modal and does not
   escape to background content
3. **Given** FilterDrawer is open, **When** the user presses Tab repeatedly,
   **Then** focus remains trapped within the drawer
4. **Given** the app renders at 375px viewport width, **When** the responsive
   layout test runs, **Then** mobile layout (cards, mobile sort selector, filter
   toggle) is active
5. **Given** the app renders at 1024px viewport width, **When** the responsive
   layout test runs, **Then** desktop layout (table, sidebar filters) is active
6. **Given** a production build completes, **When** bundle sizes are checked,
   **Then** the total JS bundle is documented as a baseline for future
   comparison
7. **Given** all new tests run alongside existing tests, **When** the full suite
   executes, **Then** all 675+ tests pass with no regressions

### Edge Cases

- What if axe-core reports violations in third-party Headless UI components?
  Document as known issues if unfixable without upstream changes.
- What if focus trap testing reveals missing focus management? Fix as part of
  this phase (refinement scope).
- What if bundle size exceeds reasonable thresholds? Document findings and
  create follow-up tasks if optimization is needed.

---

## Requirements

### Functional Requirements

#### Accessibility Auditing

- **FR-001**: Test suite MUST include automated axe-core accessibility checks
  for WineCard, WineTable (both mobile and desktop layouts), WineDetailModal,
  WineFilters, FilterDrawer, Combobox, MobileFilterToggle, MobileSortSelector,
  LoadingSpinner, and WineListSkeleton
- **FR-002**: Axe-core checks MUST report zero critical or serious violations
  (level A and AA) for each component
- **FR-003**: Any accessibility violations found MUST be fixed in source
  components as part of this phase

#### Focus Management

- **FR-004**: WineDetailModal MUST trap focus when open — Tab and Shift+Tab must
  cycle within the modal without escaping to background content
- **FR-005**: FilterDrawer MUST trap focus when open — Tab and Shift+Tab must
  cycle within the drawer
- **FR-006**: When WineDetailModal closes, focus MUST return to the element that
  triggered it (the wine row/card)
- **FR-007**: When FilterDrawer closes, focus MUST return to the
  MobileFilterToggle button
- **FR-008**: Combobox dropdown MUST manage focus correctly — arrow keys
  navigate options, Escape closes dropdown and returns focus to input

#### Cross-Viewport Testing

- **FR-009**: Integration tests MUST verify correct layout rendering at 375px
  width (iPhone SE)
- **FR-010**: Integration tests MUST verify correct layout rendering at 393px
  width (iPhone 14 Pro)
- **FR-011**: Integration tests MUST verify correct layout rendering at 768px
  width (iPad)
- **FR-012**: Integration tests MUST verify correct layout rendering at 1024px
  width (desktop breakpoint)
- **FR-013**: At mobile viewports (< 768px), tests MUST confirm: WineCard layout
  active, MobileSortSelector visible, MobileFilterToggle visible, sidebar
  filters hidden
- **FR-014**: At desktop viewports (>= 1024px), tests MUST confirm: table layout
  active, sidebar filters visible, MobileFilterToggle hidden

#### Color Contrast

- **FR-015**: All text content MUST meet WCAG AA contrast ratio (4.5:1 for
  normal text, 3:1 for large text) — verified via axe-core rules
- **FR-016**: Interactive element focus indicators MUST be visible against the
  dark wine-themed background

#### Performance / Bundle Analysis

- **FR-017**: A production build (`next build`) MUST complete successfully and
  output bundle size metrics
- **FR-018**: Bundle size metrics MUST be documented as a baseline in the spec's
  research.md or a dedicated analysis file
- **FR-019**: No individual page JS bundle SHOULD exceed 200kB gzipped (soft
  target — document if exceeded with rationale)

#### Regression Safety

- **FR-020**: All existing 675 tests MUST continue to pass after adding new
  tests
- **FR-021**: New tests MUST follow existing test patterns (Vitest + RTL +
  user-event, useMediaQuery mocking for responsive tests)

### Test Strategy

**Test Type Classification**:

| FR         | Primary Test Type | Reason                                                             |
| ---------- | ----------------- | ------------------------------------------------------------------ |
| FR-001–003 | Unit              | axe-core runs against rendered component output                    |
| FR-004–008 | Integration       | Focus management requires simulating user Tab sequences across DOM |
| FR-009–014 | Integration       | Cross-viewport tests verify multiple components rendering together |
| FR-015–016 | Unit              | Color contrast validated by axe-core rules                         |
| FR-017–019 | Build script      | Production build output analysis                                   |
| FR-020–021 | Regression        | Running existing suite alongside new tests                         |

**This Feature**:

- Feature type: [X] Frontend-heavy
- Unit: 40% | Integration: 50% | Build: 10%

**Estimated Test Count**: 35-45 new tests based on 21 functional requirements

### Error Handling & Recovery

**Error Scenarios**:

| Error Scenario              | Type      | User Message          | Recovery Action                                      |
| --------------------------- | --------- | --------------------- | ---------------------------------------------------- |
| axe-core reports violations | Permanent | (test failure output) | Fix source component, re-run tests                   |
| Focus escapes modal/drawer  | Permanent | (test failure output) | Add/fix focus trap logic, re-run tests               |
| Bundle size exceeds target  | Permanent | (build output)        | Document finding, create optimization task if needed |

---

## Technical Notes

### Dependencies to Install

- `vitest-axe` — axe-core matcher for Vitest (provides `toHaveNoViolations`)

### jsdom Limitations

- jsdom cannot calculate computed CSS (Tailwind classes, media queries)
- Responsive tests mock `useMediaQuery` return values, not actual viewport
- Touch target tests assert on inline `style` attributes or `className` strings
- Color contrast is validated by axe-core against rendered DOM attributes, not
  computed pixels

### Existing Test Infrastructure

- `window.matchMedia` already mocked in `vitest.setup.ts`
- `ResizeObserver` already mocked for Headless UI
- `useMediaQuery` hook mocked per-test for responsive behavior switching
- 27 existing test files with 466 web tests provide the baseline

---

## Review Checklist (Gate)

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Test strategy defined
- [x] Error handling defined (if can fail)
- [x] UI complexity classified — none (testing-only phase, fixes if needed)

---

## Next Steps

1. Run `/plan` to generate implementation plan
2. Run `/tasks` to generate task breakdown
3. Run `/implement` to execute tasks
