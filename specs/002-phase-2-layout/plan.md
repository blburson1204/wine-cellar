---
# Context Optimization Metadata
meta:
  spec_id: 002-phase-2-layout
  spec_name: Mobile Layout Restructuring
  phase: plan
  updated: 2025-01-28

# Quick Reference (for checkpoint resume)
summary:
  tech_stack: [TypeScript, React 18, Next.js 15, Tailwind CSS]
  external_deps: []
  test_strategy: { unit: 25, integration: 65, e2e: 10 }
  deployment: immediate
---

# Implementation Plan: Mobile Layout Restructuring (Phase 2)

**Branch**: `002-phase-2-layout` | **Date**: 2025-01-28 | **Spec**:
[spec.md](spec.md) **Input**: Feature specification from
`/specs/002-phase-2-layout/spec.md`

## Summary

Convert the wine cellar's fixed 25%/75% desktop layout to a responsive design
that works on mobile, tablet, and desktop. On screens < 1024px, the filter
sidebar becomes a slide-out drawer (80% width, 300ms animation) triggered by a
filter/funnel icon. Desktop layout remains unchanged.

**Key Deliverables**:

- FilterDrawer component (new) - wraps WineFilters in slide-out drawer
- MobileFilterToggle component (new) - filter/funnel icon button
- Backdrop component (new) - semi-transparent overlay
- Responsive layout logic in page.tsx using useMediaQuery hook

## Technical Context

**Language/Version**: TypeScript 5.x, React 18, Next.js 15 **Primary
Dependencies**: React, Next.js, Tailwind CSS (installed Phase 1) **Storage**:
N/A - UI state only (drawer open/closed) **Testing**: Vitest + React Testing
Library **Target Platform**: Web (mobile < 1024px, desktop >= 1024px) **Project
Type**: Monorepo (apps/web) **Performance Goals**: 60fps animations, < 100ms
interaction response **Constraints**: Desktop layout unchanged, use existing
useMediaQuery hook

## Constitution Check

_GATE: PASSED_

| Principle                           | Applicable | Status                                 |
| ----------------------------------- | ---------- | -------------------------------------- |
| I. Test-First Development           | Yes        | Will write tests before implementation |
| II. Specification-Driven            | Yes        | Using SpecKit workflow                 |
| III. Verification Before Completion | Yes        | Will run tests + manual verification   |
| IV. Skills Before Action            | N/A        | No AI/ML involved                      |
| V. Code Review Compliance           | Yes        | Will review before commit              |

**AI/ML**: [X] No - Skip XAI section

## Project Structure

### Documentation (this feature)

```
specs/002-phase-2-layout/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Phase 0.1 output (complete)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/tasks command)
```

### Source Code

```
apps/web/src/
├── app/
│   └── page.tsx                    # MODIFY: Add responsive layout logic
├── components/
│   ├── FilterDrawer.tsx            # NEW: Slide-out drawer wrapper
│   ├── MobileFilterToggle.tsx      # NEW: Filter icon button
│   ├── Backdrop.tsx                # NEW: Semi-transparent overlay
│   └── WineFilters.tsx             # MODIFY: Add close button prop
├── hooks/
│   └── useMediaQuery.ts            # EXISTS: Use for breakpoint detection
└── __tests__/
    ├── components/
    │   ├── FilterDrawer.test.tsx   # NEW
    │   ├── MobileFilterToggle.test.tsx # NEW
    │   └── Backdrop.test.tsx       # NEW
    └── integration/
        └── responsive-layout.test.tsx # NEW
```

## Phase 0.1: Research & Testing Strategy

_COMPLETE - See [research.md](research.md)_

### Testing Summary

```
Feature type: Frontend-heavy
Quota risks: None
Estimated tests: 12-15
Distribution: Unit 25%, Integration 65%, E2E 10%
```

| Check            | Output                                         |
| ---------------- | ---------------------------------------------- |
| External APIs    | None → Risk: LOW                               |
| Test types       | Unit, Integration, E2E (optional)              |
| E2E permitted?   | Yes (no API risk)                              |
| Mocking strategy | Mock window.matchMedia for viewport simulation |

## Phase 0.2: Permissions Design

_SKIPPED - No roles/permissions in spec_

## Phase 0.3: Integration Analysis

_COMPLETE_

### Codebase Pattern Discovery

| Pattern Area          | Finding                                                          |
| --------------------- | ---------------------------------------------------------------- |
| Modal/Overlay         | Fixed position, zIndex: 1000, rgba backdrop                      |
| Click-outside dismiss | onClick on backdrop div, stopPropagation on content              |
| Color scheme          | wine-dark (#3d010b), wine-background (#221a13)                   |
| Styling approach      | 100% inline styles (existing), Tailwind classes (new components) |

### Existing Patterns to Reuse

| Pattern                    | Location                                      | Decision                   |
| -------------------------- | --------------------------------------------- | -------------------------- |
| Modal overlay              | page.tsx:360-422, WineDetailModal.tsx:571-606 | REUSE pattern              |
| useMediaQuery hook         | hooks/useMediaQuery.ts                        | REUSE directly             |
| Wine color palette         | tailwind.config.js                            | REUSE via Tailwind classes |
| Focus/accessibility styles | WineFilters.tsx:80-97                         | REUSE pattern              |

### Overlay Pattern (from existing code)

```typescript
// Existing pattern in page.tsx and WineDetailModal.tsx
<div style={{
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1000,
}} onClick={onClose}>
  <div onClick={(e) => e.stopPropagation()}>
    {/* content */}
  </div>
</div>
```

**Decision**: New FilterDrawer/Backdrop components will follow this exact
pattern for consistency.

### z-index Strategy

| Layer                   | z-index | Component              |
| ----------------------- | ------- | ---------------------- |
| Header                  | 100     | layout.tsx             |
| Table header (sticky)   | 10      | WineTable.tsx          |
| Filter drawer backdrop  | 900     | Backdrop.tsx (new)     |
| Filter drawer           | 950     | FilterDrawer.tsx (new) |
| Modals (delete, detail) | 1000    | Existing modals        |

## Phase 0.4: Design Pre-flight

_REQUIRED - Major UI classification_

### Component Inventory

| FR     | UI Element                 | Exists? | Strategy                  |
| ------ | -------------------------- | ------- | ------------------------- |
| FR-001 | Full-width layout (mobile) | No      | Conditional in page.tsx   |
| FR-002 | Filter toggle button       | No      | NEW: MobileFilterToggle   |
| FR-003 | Slide-out drawer           | No      | NEW: FilterDrawer         |
| FR-004 | Backdrop overlay           | No      | NEW: Backdrop             |
| FR-005 | Close button in drawer     | No      | MODIFY: WineFilters prop  |
| FR-011 | 80% width drawer           | No      | CSS in FilterDrawer       |
| FR-012 | Filter/funnel icon         | No      | SVG in MobileFilterToggle |
| FR-013 | 300ms animation            | No      | CSS transition            |

### New Components

| Component          | Props                      | Responsibility                      |
| ------------------ | -------------------------- | ----------------------------------- |
| FilterDrawer       | isOpen, onClose, children  | Positions drawer, handles animation |
| MobileFilterToggle | onClick, hasActiveFilters? | Renders filter icon, handles click  |
| Backdrop           | isOpen, onClick            | Renders overlay, handles click      |

### Design Token Compliance

- [x] Colors: Use Tailwind `wine-*` classes or existing inline hex values
- [x] Spacing: Use Tailwind spacing scale (p-4, gap-4, etc.)
- [x] Touch targets: Minimum 44x44px (w-11 h-11 in Tailwind)

### Component Specifications

**FilterDrawer**:

```
- Width: 80vw (w-[80vw])
- Position: fixed, left-0, top-0, bottom-0
- Background: wine-background (#221a13)
- Animation: transform translateX, 300ms ease-in-out
- Closed: translateX(-100%)
- Open: translateX(0)
- Overflow-y: auto (scrollable)
```

**MobileFilterToggle**:

```
- Size: 44x44px minimum (touch target)
- Icon: Filter/funnel SVG
- Background: wine-dark (#3d010b)
- Position: In header area, visible on mobile only
```

**Backdrop**:

```
- Position: fixed, inset-0
- Background: rgba(0, 0, 0, 0.5)
- z-index: 900 (below drawer)
- Animation: opacity 300ms
```

## Phase 0.5: Infrastructure & Migrations

_SKIPPED - No env vars, migrations, or deprecations_

## Phase 1: Design & Contracts

### Component Interfaces

**FilterDrawer.tsx**:

```typescript
interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
```

**MobileFilterToggle.tsx**:

```typescript
interface MobileFilterToggleProps {
  onClick: () => void;
  activeFilterCount?: number; // Optional badge
}
```

**Backdrop.tsx**:

```typescript
interface BackdropProps {
  isOpen: boolean;
  onClick: () => void;
}
```

**WineFilters.tsx** (modification):

```typescript
interface WineFiltersProps {
  // ... existing props ...
  onClose?: () => void; // NEW: Optional close handler for mobile
  showCloseButton?: boolean; // NEW: Show close button in header
}
```

### Page State Changes

**page.tsx** additions:

```typescript
// New state
const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

// New hook usage
const isMobile = useMediaQuery('(max-width: 1023px)');

// Close drawer on breakpoint change (edge case)
useEffect(() => {
  if (!isMobile) {
    setIsFilterDrawerOpen(false);
  }
}, [isMobile]);
```

### Test Scenarios (from acceptance criteria)

| Scenario | Test Type   | Description                                         |
| -------- | ----------- | --------------------------------------------------- |
| AS-1     | Integration | Mobile: wine list full width, filter button visible |
| AS-2     | Integration | Tap filter icon → drawer slides in from left        |
| AS-3     | Integration | Tap backdrop OR close button → drawer closes        |
| AS-4     | Integration | Tablet behaves same as mobile (< 1024px)            |
| AS-5     | Integration | Desktop: 25%/75% layout unchanged                   |
| AS-6     | Integration | Filter state preserved on drawer close              |
| AS-7     | Integration | Header elements appropriately sized                 |

### Quickstart Validation

See [quickstart.md](quickstart.md) for manual testing checklist.

## Phase 2: Task Planning Approach

_To be executed by /tasks command_

**Task Generation Strategy**:

| Order | Task Type                           | Source                 |
| ----- | ----------------------------------- | ---------------------- |
| 1     | Unit tests for new components       | Component interfaces   |
| 2     | Create Backdrop component           | FR-004, component spec |
| 3     | Create MobileFilterToggle component | FR-002, FR-012         |
| 4     | Create FilterDrawer component       | FR-003, FR-011, FR-013 |
| 5     | Modify WineFilters (close button)   | FR-005                 |
| 6     | Modify page.tsx (responsive layout) | FR-001, FR-006, FR-007 |
| 7     | Integration tests                   | Acceptance scenarios   |
| 8     | Manual testing + fixes              | Quickstart validation  |

**Constraints**:

- TDD: Write tests before implementation
- Desktop regression: Test desktop layout after each change
- Touch targets: Verify 44x44px minimum

## Progress Tracking

| Phase                  | Status | Notes                |
| ---------------------- | ------ | -------------------- |
| 0.1 Research + Testing | [X]    | research.md created  |
| 0.2 Permissions        | [SKIP] | No roles in spec     |
| 0.3 Integration        | [X]    | Patterns documented  |
| 0.4 Design Pre-flight  | [X]    | Components specified |
| 0.5 Infrastructure     | [SKIP] | No infra changes     |
| 1 Design & Contracts   | [X]    | Interfaces defined   |
| 2 Task Planning        | [ ]    | Ready for /tasks     |

**Gates**:

- [x] Constitution Check PASS
- [x] All Technical Context resolved
- [x] Component interfaces defined
- [ ] Ready for /tasks command

---

_Based on Constitution v2.1.1_
