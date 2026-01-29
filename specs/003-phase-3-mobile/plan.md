---
# Context Optimization Metadata
meta:
  spec_id: 003-phase-3-mobile
  spec_name: Phase 3 Mobile Responsive Components
  phase: plan
  updated: 2026-01-28

# Quick Reference (for checkpoint resume)
summary:
  tech_stack: [TypeScript, React 18, Next.js 15, Tailwind CSS, @headlessui/react]
  external_deps: [@headlessui/react (new)]
  test_strategy: {unit: 40%, integration: 50%, e2e: 10%}
  deployment: immediate
---

# Implementation Plan: Phase 3 Mobile Responsive Components

**Branch**: `003-phase-3-mobile` | **Date**: 2026-01-28 | **Spec**:
[spec.md](./spec.md) **Input**: Feature specification from
`/specs/003-phase-3-mobile/spec.md`

## Summary

Make wine collection display and forms mobile-friendly by:

1. Creating WineCard component for mobile card layout
2. Adding MobileSortSelector for sorting on mobile
3. Replacing 5 datalist fields with accessible Headless UI Combobox
4. Making WineDetailModal full-screen with single-column layout on mobile
5. Ensuring all touch targets meet 44px minimum

Technical approach: Use existing `useMediaQuery` hook for responsive switching,
add `@headlessui/react` for Combobox components.

## Technical Context

**Language/Version**: TypeScript 5.6, React 18.3.1, Next.js 15.5.9 **Primary
Dependencies**: React, Next.js, Tailwind CSS 3.4, @headlessui/react (new)
**Storage**: N/A (no database changes) **Testing**: Vitest + React Testing
Library **Target Platform**: Web (responsive: mobile < 768px, desktop >= 768px)
**Project Type**: Web monorepo (apps/web, apps/api, packages/database)
**Performance Goals**: Smooth 60fps transitions, no layout shift
**Constraints**: Must use existing Tailwind setup, useMediaQuery hook from Phase
1 **Scale/Scope**: Frontend-only, 3 new components, 2 modified components

## Constitution Check

_GATE: Must pass before Phase 0 research._

| Principle                           | Status        | Notes                           |
| ----------------------------------- | ------------- | ------------------------------- |
| I. Test-First Development           | ✓ Will follow | TDD for all new components      |
| II. Specification-Driven            | ✓ Following   | SpecKit workflow in progress    |
| III. Verification Before Completion | ✓ Will follow | Run tests + visual verification |
| IV. Skills Before Action            | ✓ Applied     | Checked skills before planning  |
| V. Code Review Compliance           | ✓ Will follow | Review before commit            |

### AI & Machine Learning

**Does this feature involve AI/ML?**

- [x] **No** - Skip this section

## Project Structure

### Documentation (this feature)

```
specs/003-phase-3-mobile/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research output
├── data-model.md        # Component specifications
├── quickstart.md        # Development guide
└── tasks.md             # Phase 2 output (/tasks command)
```

### Source Code (repository root)

```
apps/web/
├── src/
│   ├── components/
│   │   ├── WineCard.tsx              # NEW: Mobile wine card
│   │   ├── Combobox.tsx              # NEW: Accessible autocomplete
│   │   ├── MobileSortSelector.tsx    # NEW: Mobile sort dropdown
│   │   ├── WineTable.tsx             # MODIFIED: Responsive switch
│   │   └── WineDetailModal.tsx       # MODIFIED: Mobile layout + combobox
│   └── hooks/
│       └── useMediaQuery.ts          # EXISTING: From Phase 1
└── src/__tests__/
    └── components/
        ├── WineCard.test.tsx         # NEW
        ├── Combobox.test.tsx         # NEW
        └── MobileSortSelector.test.tsx # NEW
```

**Structure Decision**: Monorepo with apps/web for frontend. All new components
go in `apps/web/src/components/`.

## Phase 0.1: Research & Testing Strategy

_MANDATORY - Completed_

### Research

See [research.md](./research.md) for full details.

**Key Findings**: | Item | Resolution | |------|------------| | useMediaQuery |
Already implemented with `useSyncExternalStore` | | Tailwind | Configured with
wine-\* color tokens | | @headlessui/react | NOT installed - add as dependency |
| Breakpoint | 768px for mobile/desktop (from spec) |

### Testing Strategy

| Check            | Output                                   |
| ---------------- | ---------------------------------------- |
| External APIs    | None - frontend only                     |
| Test types       | Unit + Integration (no E2E needed)       |
| E2E permitted?   | Yes but not required for UI-only         |
| Mocking strategy | Mock `window.matchMedia` for breakpoints |

**Testing Summary**:

```
Feature type: Frontend-heavy
Quota risks: None
Estimated tests: 38-48
Distribution: Unit 40%, Contract 0%, Integration 50%, E2E 10%
```

**Output**: [research.md](./research.md) ✓

## Phase 0.2: Permissions Design

_CONDITIONAL - SKIPPED_

**Skip reason**: No roles/permissions in spec. This is a UI-only feature.

## Phase 0.3: Integration Analysis

_MANDATORY - Completed_

### Codebase Pattern Discovery

| Pattern Area        | Finding                                          |
| ------------------- | ------------------------------------------------ |
| Touch targets       | 44x44px established in MobileFilterToggle        |
| Responsive          | useMediaQuery hook with useSyncExternalStore     |
| Styling             | Tailwind classes + inline styles hybrid          |
| Component structure | Functional components with TypeScript interfaces |

### Existing Patterns to Reuse

| Pattern                 | Source                 | Reuse In                   |
| ----------------------- | ---------------------- | -------------------------- |
| 44px touch target       | MobileFilterToggle     | All buttons, inputs        |
| useMediaQuery           | hooks/useMediaQuery.ts | WineTable, WineDetailModal |
| Wine interface          | WineTable.tsx          | WineCard                   |
| COLOR_LABELS            | WineTable.tsx          | WineCard                   |
| Tailwind wine-\* colors | tailwind.config.js     | All new components         |

### Code Interconnectedness

| Pattern Needed  | Existing Code          | Decision                 |
| --------------- | ---------------------- | ------------------------ |
| Wine type       | WineTable.tsx:5-26     | REUSE                    |
| SortColumn type | WineTable.tsx:28-38    | REUSE                    |
| COLOR_LABELS    | WineTable.tsx:50-57    | REUSE (export if needed) |
| useMediaQuery   | hooks/useMediaQuery.ts | REUSE                    |

**Output**: Integration patterns documented ✓

## Phase 0.4: Design Pre-flight

_CONDITIONAL - Required (Major UI)_

### Mockup Review

| FR     | UI Element              | Mockup?    | Existing Component      |
| ------ | ----------------------- | ---------- | ----------------------- |
| FR-001 | Card layout on mobile   | Yes (spec) | GAP: WineCard           |
| FR-003 | Card content (8 fields) | Yes (spec) | GAP: WineCard           |
| FR-006 | Full-screen modal       | Yes (spec) | Modify WineDetailModal  |
| FR-011 | Combobox dropdown       | No visual  | GAP: Combobox           |
| FR-017 | Sort selector           | Yes (spec) | GAP: MobileSortSelector |

### Component Gaps

| Gap Component      | Build Effort | Strategy                  |
| ------------------ | ------------ | ------------------------- |
| WineCard           | Medium       | Build new                 |
| Combobox           | Medium       | Build (wraps @headlessui) |
| MobileSortSelector | Small        | Build new                 |

### Design Token Compliance

- [x] All colors use wine-\* tokens (Tailwind config)
- [x] All spacing uses Tailwind standards (p-_, m-_, gap-\*)
- [x] All typography uses text scale (text-sm, text-base, etc.)

**Output**: Component gaps documented ✓

## Phase 0.5: Infrastructure & Migrations

_CONDITIONAL - Required (new dependency)_

### New Dependency

| Package           | Version | Purpose                       |
| ----------------- | ------- | ----------------------------- |
| @headlessui/react | ^2.x    | Accessible Combobox component |

**Installation**:

```bash
npm install @headlessui/react --workspace=@wine-cellar/web
```

### Environment & SSM

No environment variables needed.

### Migrations

No database migrations needed.

### Deployment Order

```
1. Install @headlessui/react dependency
2. Implement components
3. Run tests
4. Deploy web app
```

**Rollout**: [X] Immediate (no feature flag needed)

**Output**: Dependency documented ✓

## Phase 1: Design & Contracts

_Prerequisites: Phases 0.1-0.5 complete ✓_

### 1. Component Specifications

See [data-model.md](./data-model.md) for detailed specifications:

- WineCard: Props, layout, behavior
- Combobox: Props, keyboard handling, filtering
- MobileSortSelector: Props, sort options
- WineTable modifications
- WineDetailModal modifications

### 2. No API Contracts

This feature is frontend-only. No new API endpoints needed.

### 3. Test Scenarios (from user stories)

| Scenario                 | Test Type   | File                     |
| ------------------------ | ----------- | ------------------------ |
| Mobile shows cards       | Integration | WineTable.test.tsx       |
| Desktop shows table      | Integration | WineTable.test.tsx       |
| Card tap opens modal     | Integration | WineCard.test.tsx        |
| Favorite toggle          | Unit        | WineCard.test.tsx        |
| Combobox keyboard nav    | Unit        | Combobox.test.tsx        |
| Combobox filtering       | Unit        | Combobox.test.tsx        |
| Modal full-screen mobile | Integration | WineDetailModal.test.tsx |
| Touch targets 44px       | Unit        | Multiple files           |

### 4. Quickstart

See [quickstart.md](./quickstart.md) for development setup and verification
checklist.

**Output**:

- [data-model.md](./data-model.md) ✓
- [quickstart.md](./quickstart.md) ✓

## Phase 2: Task Planning Approach

_Executed by /tasks command, NOT /plan_

**Strategy**: TDD approach - write tests first, then implement

| Order | Task Category                     | Dependencies                 |
| ----- | --------------------------------- | ---------------------------- |
| 1     | Install @headlessui/react         | None                         |
| 2     | Create Combobox component + tests | @headlessui/react            |
| 3     | Create WineCard component + tests | None                         |
| 4     | Create MobileSortSelector + tests | None                         |
| 5     | Modify WineTable for responsive   | WineCard, MobileSortSelector |
| 6     | Modify WineDetailModal            | Combobox                     |
| 7     | Integration tests                 | All components               |
| 8     | Final verification                | All tests pass               |

**Constraints**:

- TDD: Write failing tests before implementation
- Touch targets: Verify 44px minimum in tests
- Existing tests must continue to pass

## Progress Tracking

| Phase                  | Status               | Skip If                        |
| ---------------------- | -------------------- | ------------------------------ |
| 0.1 Research + Testing | [X] Complete         | Never                          |
| 0.2 Permissions        | [X] Skipped          | No roles in spec ✓             |
| 0.3 Integration        | [X] Complete         | Never                          |
| 0.4 Design Pre-flight  | [X] Complete         | Backend-only/Minor UI          |
| 0.5 Infrastructure     | [X] Complete         | No env/migrations/deprecations |
| 1 Design & Contracts   | [X] Complete         | -                              |
| 2 Task Planning        | [ ] Ready for /tasks | -                              |

**Gates**:

- Constitution Check: PASS ✓
- All NEEDS CLARIFICATION: Resolved ✓

---

## Next Steps

Run `/tasks` to generate the task breakdown with dependencies.

---

_Based on Constitution v2.1.1_
