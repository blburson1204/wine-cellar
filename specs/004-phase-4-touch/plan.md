---
# Context Optimization Metadata
meta:
  spec_id: '004'
  spec_name: 'Phase 4: Touch & Interaction Optimization'
  phase: plan
  updated: 2026-01-29

# Quick Reference (for checkpoint resume)
summary:
  tech_stack: [TypeScript, React 18, Next.js 15, TailwindCSS, Vitest]
  external_deps: []
  test_strategy: { unit: 20, contract: 0, e2e: 0 }
  deployment: immediate
---

# Implementation Plan: Phase 4 — Touch & Interaction Optimization

**Branch**: `004-phase-4-touch` | **Date**: 2026-01-29 | **Spec**:
[spec.md](spec.md) **Input**: Feature specification from
`specs/004-phase-4-touch/spec.md`

## Summary

Bring all mobile interactive elements to WCAG 44x44px touch target compliance,
add ESC key and swipe-to-close gestures to FilterDrawer, and replace plain-text
loading states with skeleton placeholders and inline spinners. Pure frontend
changes — no API or database modifications.

## Technical Context

**Language/Version**: TypeScript 5.6, React 18.3, Next.js 15.5 **Primary
Dependencies**: @headlessui/react 2.2, TailwindCSS 3.4 **Storage**: N/A (no data
changes) **Testing**: Vitest 4.0 + React Testing Library 16.3 + userEvent 14.6
**Target Platform**: Web (mobile-first: iOS Safari, Android Chrome) **Project
Type**: Web monorepo (apps/web) **Constraints**: Must not break desktop layout;
maintain 625 existing tests

## Constitution Check

_GATE: Pass_

- [x] **TDD**: Tests written before implementation (per constitution principle
      I)
- [x] **Verification**: Run full test suite before any commit (principle III)
- [x] **Skills check**: ui-accessibility applicable; no AI/ML involved
- [x] **No AI/ML**: Skip XAI section

## Project Structure

### Documentation (this feature)

```
specs/004-phase-4-touch/
├── plan.md              # This file
├── research.md          # Phase 0.1 output (audit + decisions)
├── quickstart.md        # Verification steps
└── tasks.md             # Phase 2 output (created by /tasks)
```

### Source Code (files affected)

```
apps/web/src/
├── components/
│   ├── FilterDrawer.tsx        # MODIFY: Add ESC key + swipe gesture
│   ├── WineFilters.tsx         # MODIFY: Touch target fixes (close btn, checkboxes, selects, inputs, clear btn)
│   ├── WineDetailModal.tsx     # MODIFY: Favorite span→button, link padding, spinner in buttons
│   ├── LoadingSpinner.tsx      # NEW: Reusable inline spinner
│   └── WineListSkeleton.tsx    # NEW: Skeleton placeholder for wine list
├── app/
│   └── page.tsx                # MODIFY: Replace loading text with WineListSkeleton
└── __tests__/components/
    ├── FilterDrawer.gesture.test.tsx         # NEW: ESC + swipe tests
    ├── WineFilters.touchTargets.test.tsx     # NEW: Touch target assertions
    ├── WineDetailModal.touchTargets.test.tsx # NEW: Favorite btn + link tests
    ├── LoadingSpinner.test.tsx               # NEW: Spinner render + animation
    └── WineListSkeleton.test.tsx             # NEW: Skeleton render tests
```

## Phase 0.1: Research & Testing Strategy

_COMPLETE — See [research.md](research.md)_

### Key Findings

- ~70% of interactive elements already meet 44px standard
- 7 elements need touch target fixes (all in WineFilters + WineDetailModal)
- No touch events or swipe handlers exist yet
- No skeleton/spinner components exist
- Tailwind `animate-pulse` and `animate-spin` available out of the box

### Testing Strategy

| Check            | Output                                         |
| ---------------- | ---------------------------------------------- |
| External APIs    | None — Risk: NONE                              |
| Test types       | Unit only                                      |
| E2E permitted?   | N/A (pure UI)                                  |
| Mocking strategy | useMediaQuery via vi.mock; touch via fireEvent |

```
Feature type: Frontend-heavy
Quota risks: None
Estimated tests: ~20
Distribution: Unit 100%
```

**Output**: [research.md](research.md) ✓

## Phase 0.2: Permissions Design

_SKIPPED — No roles/permissions in spec_

## Phase 0.3: Integration Analysis

### Codebase Pattern Discovery

| Pattern Area      | Finding                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------- |
| Touch targets     | 44px via inline `style={{ minWidth: '44px', minHeight: '44px' }}`                       |
| Animations        | Tailwind classes (`transition-colors duration-200`) + inline (`transition: 'all 0.2s'`) |
| Component exports | `export default function ComponentName()`                                               |
| Test structure    | `__tests__/components/ComponentName.test.tsx`                                           |
| User events       | `const user = userEvent.setup(); await user.click()`                                    |
| Style assertions  | `expect(el).toHaveStyle({ minHeight: '44px' })`                                         |
| Keyboard tests    | `await user.keyboard('{Enter}')`                                                        |
| Hook mocking      | `vi.mock('../hooks/useMediaQuery', ...)`                                                |

### Code Reuse Analysis

| Pattern Needed         | Exists?                                    | Decision            |
| ---------------------- | ------------------------------------------ | ------------------- |
| Touch target sizing    | Yes — MobileFilterToggle uses 44px pattern | REUSE pattern       |
| Keyboard handler (ESC) | Yes — WineDetailModal has ESC handler      | REUSE pattern       |
| Transition animations  | Yes — FilterDrawer uses duration-300       | REUSE pattern       |
| Skeleton animation     | Tailwind `animate-pulse` built-in          | USE built-in        |
| Spin animation         | Tailwind `animate-spin` built-in           | USE built-in        |
| Loading state          | Yes — isSaving/isUploadingImage pattern    | EXTEND with spinner |

No new contracts or interfaces needed — all changes are internal to existing
components or create small self-contained UI components.

**Output**: Integration analysis documented ✓

## Phase 0.4: Design Pre-flight

_INCLUDED — Moderate UI classification_

### Component Inventory

| FR     | UI Element             | Existing Component          | Strategy                 |
| ------ | ---------------------- | --------------------------- | ------------------------ |
| FR-001 | Close button 44px      | WineFilters close btn       | Modify style             |
| FR-002 | Checkbox 44px hit area | WineFilters checkbox labels | Expand label padding     |
| FR-003 | Select 44px            | WineFilters select elements | Add minHeight            |
| FR-004 | Input 44px             | WineFilters price inputs    | Add minHeight            |
| FR-005 | Clear button 44px      | WineFilters clear btn       | Add minHeight            |
| FR-006 | Favorite button        | WineDetailModal span→button | Convert element          |
| FR-007 | Wine link padding      | WineDetailModal link        | Add padding              |
| FR-008 | ESC key handler        | FilterDrawer                | Add useEffect            |
| FR-009 | Swipe-to-close         | FilterDrawer                | Add touch handlers       |
| FR-010 | Swipe snap-back        | FilterDrawer                | Threshold logic          |
| FR-011 | Skeleton loader        | NEW: WineListSkeleton       | Build                    |
| FR-012 | Loading spinner        | NEW: LoadingSpinner         | Build                    |
| FR-013 | Spinner in buttons     | WineDetailModal buttons     | Integrate LoadingSpinner |

### New Components

| Component        | Complexity | Notes                                               |
| ---------------- | ---------- | --------------------------------------------------- |
| LoadingSpinner   | Low        | ~20 lines, border-based CSS spinner, `animate-spin` |
| WineListSkeleton | Low        | ~50 lines, pulse bars mimicking card/table layout   |

### Design Token Compliance

- [x] All colors use wine-\* design tokens
- [x] Spacing uses Tailwind standards (p-2, p-3, gap-2, etc.)
- [x] Typography follows existing scale (text-sm, text-base)

**Output**: Component inventory documented ✓

## Phase 0.5: Infrastructure & Migrations

_SKIPPED — No env vars, migrations, or deprecations_

## Phase 1: Design & Contracts

_No data model or API contracts for this feature (frontend-only)._

### Component Design

#### LoadingSpinner

```
Props: { size?: 'sm' | 'md' (default 'sm'), className?: string }
Renders: <span> with border-based CSS circle, animate-spin
sm = 16px, md = 24px
Color: wine-burgundy (#7C2D3C) border with transparent top
```

#### WineListSkeleton

```
Props: { isMobile: boolean }
Mobile: 3 pulse card shapes (rounded rect with 4 lines each)
Desktop: 5 pulse table rows (full-width bars)
Color: wine-dark (#3d010b) background, slightly lighter pulse bars
Animation: Tailwind animate-pulse (1.5s ease-in-out infinite)
```

#### FilterDrawer Gesture Logic

```
State: touchStartX, touchCurrentX (tracked via useRef)
onTouchStart: Record initial X position
onTouchMove: Track current X, calculate deltaX
onTouchEnd: If deltaX < -50px (swiped left) → call onClose()
            If deltaX >= -50px → snap back (no action)
Threshold: 50px horizontal distance minimum
```

#### WineDetailModal Favorite Button

```
Convert: <span onClick> → <button onClick>
Add: style={{ minWidth: '44px', minHeight: '44px' }}
Add: aria-label="Toggle favorite", aria-pressed={wine.favorite}
Add: type="button" (prevent form submission)
Keep: Existing star character (★/☆) and color logic
```

### Test Scenarios (from acceptance criteria)

| Scenario                     | Test File                             | Assertions                                           |
| ---------------------------- | ------------------------------------- | ---------------------------------------------------- |
| All filter controls 44px     | WineFilters.touchTargets.test.tsx     | toHaveStyle minHeight/minWidth                       |
| Favorite is button with aria | WineDetailModal.touchTargets.test.tsx | getByRole('button'), toHaveAttribute                 |
| Wine link has touch target   | WineDetailModal.touchTargets.test.tsx | toHaveStyle minHeight                                |
| ESC closes FilterDrawer      | FilterDrawer.gesture.test.tsx         | fireEvent.keyDown, onClose called                    |
| Swipe left closes drawer     | FilterDrawer.gesture.test.tsx         | fireEvent.touchStart/Move/End, onClose called        |
| Partial swipe keeps open     | FilterDrawer.gesture.test.tsx         | fireEvent touch with small delta, onClose NOT called |
| Skeleton renders on load     | WineListSkeleton.test.tsx             | getByTestId, animate-pulse class                     |
| Spinner renders and spins    | LoadingSpinner.test.tsx               | animate-spin class, border styling                   |
| Save button shows spinner    | WineDetailModal.touchTargets.test.tsx | isSaving → spinner visible                           |

**Output**: [quickstart.md](quickstart.md) ✓

## Phase 2: Task Planning Approach

_Executed by /tasks command, NOT /plan_

**Strategy**: TDD — write test files first, then implement to make tests pass.

| Order | Task Group          | Description                                                              |
| ----- | ------------------- | ------------------------------------------------------------------------ |
| 1     | New component tests | LoadingSpinner.test.tsx, WineListSkeleton.test.tsx                       |
| 2     | New components      | LoadingSpinner.tsx, WineListSkeleton.tsx (make tests pass)               |
| 3     | Touch target tests  | WineFilters.touchTargets.test.tsx, WineDetailModal.touchTargets.test.tsx |
| 4     | Touch target fixes  | Modify WineFilters.tsx, WineDetailModal.tsx (make tests pass)            |
| 5     | Gesture tests       | FilterDrawer.gesture.test.tsx                                            |
| 6     | Gesture impl        | Modify FilterDrawer.tsx (make tests pass)                                |
| 7     | Integration         | Wire WineListSkeleton into page.tsx, LoadingSpinner into modal buttons   |
| 8     | Verify              | Full test suite, type-check, lint, format                                |

**Constraints**: TDD order enforced — every impl task depends on its test task.

## Progress Tracking

| Phase                  | Status | Skip If                        |
| ---------------------- | ------ | ------------------------------ |
| 0.1 Research + Testing | [X]    | Never                          |
| 0.2 Permissions        | [SKIP] | No roles in spec               |
| 0.3 Integration        | [X]    | Never                          |
| 0.4 Design Pre-flight  | [X]    | Backend-only/Minor UI          |
| 0.5 Infrastructure     | [SKIP] | No env/migrations/deprecations |
| 1 Design & Contracts   | [X]    | -                              |
| 2 Task Planning        | [X]    | -                              |

**Gates**: Constitution Check PASS, All phases complete.

---

_Ready for `/tasks` command._
