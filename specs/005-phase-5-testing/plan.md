---
# Context Optimization Metadata
meta:
  spec_id: 005-phase-5-testing
  spec_name: Phase 5 Testing & Refinement
  phase: plan
  updated: 2026-01-29

# Quick Reference (for checkpoint resume)
summary:
  tech_stack:
    [
      TypeScript,
      React 18,
      Next.js 15,
      Vitest,
      React Testing Library,
      vitest-axe,
    ]
  external_deps: [vitest-axe (new devDependency)]
  test_strategy: { unit: 40, integration: 50, build: 10 }
  deployment: immediate
---

# Implementation Plan: Phase 5 Testing & Refinement

**Branch**: `005-phase-5-testing` | **Date**: 2026-01-29 | **Spec**:
[spec.md](spec.md) **Input**: Feature specification from
`/specs/005-phase-5-testing/spec.md`

## Summary

Add automated accessibility testing (vitest-axe/axe-core) across all 10
responsive components, fix focus management gaps (FilterDrawer missing focus
trap, both modal and drawer missing focus restoration), add cross-viewport
integration tests at 4 device sizes, and document bundle size baseline.
Estimated 35-45 new tests with fixes to 2-3 source components.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18, Next.js 15 **Primary
Dependencies**: Vitest, React Testing Library, @testing-library/user-event,
vitest-axe (new) **Storage**: N/A (testing phase) **Testing**: Vitest + jsdom +
React Testing Library **Target Platform**: Web (tested in jsdom) **Project
Type**: Web monorepo (apps/web) **Performance Goals**: Zero critical/serious axe
violations, all tests passing **Constraints**: jsdom cannot compute CSS — mock
useMediaQuery, assert on inline styles/classNames **Scale/Scope**: 35-45 new
tests, 2-3 source file fixes

## Constitution Check

| Principle                           | Status | Notes                                     |
| ----------------------------------- | ------ | ----------------------------------------- |
| I. Test-First Development           | PASS   | This IS the testing phase. Fixes use TDD. |
| II. Specification-Driven            | PASS   | Using SpecKit workflow                    |
| III. Verification Before Completion | PASS   | Full test suite + build as final gate     |
| IV. Skills Before Action            | PASS   | Testing skill applicable                  |
| V. Code Review Compliance           | PASS   | Fixes reviewed via existing patterns      |
| AI/ML                               | N/A    | No AI/ML involvement                      |

**Constitution Check: PASS**

## Project Structure

### Documentation (this feature)

```
specs/005-phase-5-testing/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 research output
├── quickstart.md        # Phase 1 quickstart
└── tasks.md             # Phase 2 output (created by /tasks)
```

### Source Code (repository root)

```
apps/web/
├── vitest.setup.ts                          # ADD: vitest-axe matchers
├── vitest-axe.d.ts                          # ADD: type declarations
├── src/
│   ├── components/
│   │   ├── FilterDrawer.tsx                 # MODIFY: add focus trap + restoration
│   │   └── WineDetailModal.tsx              # MODIFY: add focus restoration on close
│   └── __tests__/
│       ├── accessibility/                   # ADD: new directory
│       │   ├── WineCard.a11y.test.tsx
│       │   ├── WineTable.a11y.test.tsx
│       │   ├── WineDetailModal.a11y.test.tsx
│       │   ├── WineFilters.a11y.test.tsx
│       │   ├── FilterDrawer.a11y.test.tsx
│       │   ├── Combobox.a11y.test.tsx
│       │   └── SmallComponents.a11y.test.tsx
│       ├── focus/                           # ADD: new directory
│       │   ├── WineDetailModal.focus.test.tsx
│       │   ├── FilterDrawer.focus.test.tsx
│       │   └── Combobox.focus.test.tsx
│       └── integration/
│           ├── responsive-layout.test.tsx    # EXISTING (no change)
│           └── viewport-devices.test.tsx     # ADD: cross-viewport tests
```

**Structure Decision**: New test files organized in `accessibility/` and
`focus/` subdirectories under existing `__tests__/` structure. Source fixes in
existing component files.

## Phase 0.1: Research & Testing Strategy

**Output**: [research.md](research.md)

### Research Summary

| Topic                   | Decision                          | Rationale                                                           |
| ----------------------- | --------------------------------- | ------------------------------------------------------------------- |
| a11y testing tool       | vitest-axe                        | Direct Vitest integration, jsdom compatible, 242k+ weekly downloads |
| Cross-viewport approach | Mock useMediaQuery per breakpoint | jsdom can't compute CSS; matches existing test patterns             |
| Bundle analysis         | `next build` output               | No additional tools needed                                          |
| Color contrast          | axe-core rules on inline styles   | Tailwind classes not computed in jsdom                              |

### Testing Strategy

| Check            | Output                                    |
| ---------------- | ----------------------------------------- |
| External APIs    | None → Risk: NONE                         |
| Test types       | Unit + Integration                        |
| E2E permitted?   | N/A (no external APIs)                    |
| Mocking strategy | useMediaQuery mock, fetch mock (existing) |

**Testing Summary**:

```
Feature type: Frontend-heavy (testing phase)
Quota risks: None
Estimated tests: 35-45 new
Distribution: Unit 40%, Integration 50%, Build 10%
```

## Phase 0.3: Integration Analysis

### Codebase Pattern Discovery

| Pattern Area          | Finding                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| Test file naming      | `ComponentName.{category}.test.tsx` (e.g., `.touchTargets.`, `.gesture.`, `.keyboard.`)        |
| useMediaQuery mock    | `vi.mock('../../hooks/useMediaQuery')` → `vi.mocked(useMediaQuery).mockReturnValue(bool)`      |
| Mock wine fixtures    | Defined per-file (not shared); includes all Wine fields                                        |
| Accessibility testing | Manual ARIA attribute assertions (no axe-core yet)                                             |
| Focus management      | WineDetailModal has focus trap; FilterDrawer does not                                          |
| Setup file            | `vitest.setup.ts` imports `@testing-library/jest-dom`, mocks matchMedia, fetch, ResizeObserver |

### Code Reuse

| Pattern Needed     | Existing Code                 | Decision                       |
| ------------------ | ----------------------------- | ------------------------------ |
| axe-core matchers  | None                          | ADD via vitest-axe             |
| Focus trap logic   | WineDetailModal lines 223-253 | REUSE pattern for FilterDrawer |
| useMediaQuery mock | 8+ test files                 | REUSE existing pattern         |
| Mock wine fixtures | Multiple files                | REUSE existing inline approach |
| Focus restoration  | None                          | ADD to both Modal and Drawer   |

### Focus Trap Pattern (from WineDetailModal.tsx:223-253)

```typescript
// This is the existing pattern to replicate in FilterDrawer
if (e.key === 'Tab' && containerRef.current) {
  const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  if (e.shiftKey && document.activeElement === firstElement) {
    e.preventDefault();
    lastElement?.focus();
  } else if (!e.shiftKey && document.activeElement === lastElement) {
    e.preventDefault();
    firstElement?.focus();
  }
}
```

## Phase 1: Design & Contracts

### Test Architecture

**No new data models** — this phase adds tests and fixes focus management in
existing components.

**No new API contracts** — all testing is frontend-only.

### Implementation Groups

#### Group 1: Setup (vitest-axe)

- Install `vitest-axe` as devDependency in `apps/web`
- Add matchers to `vitest.setup.ts`
- Add type declaration file `vitest-axe.d.ts`
- Verify setup with one smoke test

#### Group 2: Accessibility Tests (FR-001, FR-002, FR-015, FR-016)

Write axe-core tests for each component. Pattern:

```typescript
import { axe } from 'vitest-axe';

it('has no accessibility violations', async () => {
  const { container } = render(<Component {...props} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Components to test** (10 total):

1. WineCard
2. WineTable (mobile layout)
3. WineTable (desktop layout)
4. WineDetailModal (view mode)
5. WineDetailModal (edit mode / add mode)
6. WineFilters
7. FilterDrawer
8. Combobox
9. MobileFilterToggle, MobileSortSelector
10. LoadingSpinner, WineListSkeleton

#### Group 3: Focus Management Fixes (FR-004–FR-008)

**Fix 1: FilterDrawer focus trap** (FR-005)

- Add focus trap logic (reuse WineDetailModal pattern)
- Add auto-focus on first focusable element when drawer opens

**Fix 2: Focus restoration — WineDetailModal** (FR-006)

- Store `document.activeElement` on modal open
- Restore focus to stored element on close

**Fix 3: Focus restoration — FilterDrawer** (FR-007)

- Store `document.activeElement` on drawer open
- Restore focus to stored element on close (MobileFilterToggle button)

#### Group 4: Focus Management Tests (FR-004–FR-008)

Test focus behavior:

- Tab cycles within modal/drawer (doesn't escape)
- Shift+Tab cycles backward
- Focus restores to trigger on close
- Combobox: arrow navigation, Escape returns to input

#### Group 5: Cross-Viewport Integration Tests (FR-009–FR-014)

Test at 4 viewport widths by mocking useMediaQuery:

- 375px (iPhone SE) → mobile layout
- 393px (iPhone 14 Pro) → mobile layout
- 768px (iPad) → desktop layout
- 1024px (Desktop) → desktop layout

Verify at each viewport:

- Correct layout (cards vs table)
- Correct components visible/hidden
- Sort controls appropriate for layout

#### Group 6: Bundle Analysis & Regression (FR-017–FR-021)

- Run `next build` and capture bundle metrics
- Document baseline in research.md
- Run full test suite, verify all 675+ tests pass

### Quickstart

See [quickstart.md](quickstart.md) for setup instructions and verification
commands.

## Phase 2: Task Planning Approach

_Executed by /tasks command, NOT /plan_

**Strategy**: Implementation groups map directly to task groups with TDD
ordering.

| From    | Task Type                                                   | Order |
| ------- | ----------------------------------------------------------- | ----- |
| Group 1 | Setup (vitest-axe install + config)                         | 1st   |
| Group 2 | Accessibility test files (TDD: write tests, fix violations) | 2nd   |
| Group 3 | Source fixes (focus trap + restoration) — TDD               | 3rd   |
| Group 4 | Focus management test files                                 | 4th   |
| Group 5 | Cross-viewport integration tests                            | 5th   |
| Group 6 | Bundle analysis + full regression                           | 6th   |

**TDD for fixes**: Write focus management tests first (expect failure), then
implement fixes, then verify green.

**Constraints**: Group 1 must complete before Groups 2-5. Groups 2-5 can proceed
in parallel. Group 6 runs last.

## Progress Tracking

| Phase                  | Status | Skip If                        |
| ---------------------- | ------ | ------------------------------ |
| 0.1 Research + Testing | [x]    | Never                          |
| 0.2 Permissions        | [SKIP] | No roles in spec               |
| 0.3 Integration        | [x]    | Never                          |
| 0.4 Design Pre-flight  | [SKIP] | ui_changes: none               |
| 0.5 Infrastructure     | [SKIP] | No env/migrations/deprecations |
| 1 Design & Contracts   | [x]    | -                              |
| 2 Task Planning        | [x]    | -                              |

**Gates**: Constitution Check PASS, All phases complete.

---

_Based on Constitution v2.1.1_
