---
# Context Optimization Metadata
meta:
  spec_id: 001-mobile-responsive-phase
  spec_name: Mobile Responsive Phase 1 - Foundation Setup
  phase: plan
  updated: 2026-01-28

# Quick Reference (for checkpoint resume)
summary:
  tech_stack: [TypeScript, Next.js 15, React 18, Tailwind CSS, Vitest]
  external_deps: []
  test_strategy: { unit: 70, integration: 20, manual: 10 }
  deployment: immediate
---

# Implementation Plan: Mobile Responsive Phase 1 - Foundation Setup

**Branch**: `001-mobile-responsive-phase` | **Date**: 2026-01-28 | **Spec**:
[spec.md](./spec.md) **Input**: Feature specification from
`/specs/001-mobile-responsive-phase/spec.md`

## Summary

Install and configure Tailwind CSS in the Next.js 15 web app to establish a
responsive styling foundation. This includes design tokens matching the existing
color scheme, viewport meta configuration, and a useMediaQuery hook for
responsive component logic. No visual changes to existing components -
foundation only.

## Technical Context

**Language/Version**: TypeScript 5.6+ **Primary Dependencies**: Next.js 15,
React 18, Tailwind CSS 3.4+, PostCSS, Autoprefixer **Storage**: N/A (no data
changes) **Testing**: Vitest, React Testing Library **Target Platform**: Web
(all modern browsers) **Project Type**: Monorepo web application (apps/web)
**Performance Goals**: No build time regression >10% **Constraints**: Zero
visual regression on existing components **Scale/Scope**: 6 files to
create/modify

## Constitution Check

_GATE: Must pass before Phase 0 research._

| Principle                           | Applies | Status                               |
| ----------------------------------- | ------- | ------------------------------------ |
| I. Test-First Development           | Yes     | Will write useMediaQuery tests first |
| II. Specification-Driven            | Yes     | Using SpecKit workflow               |
| III. Verification Before Completion | Yes     | Build + test verification required   |
| IV. Skills Before Action            | Yes     | Checked applicable skills            |
| V. Code Review Compliance           | Yes     | Will run lint/type-check             |

**AI/ML**: No - Skip AI section

**Result**: PASS

## Project Structure

### Documentation (this feature)

```
specs/001-mobile-responsive-phase/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 research output
└── quickstart.md        # Validation guide
```

### Source Code (repository root)

```
apps/web/
├── tailwind.config.js      # NEW - Tailwind configuration
├── postcss.config.js       # NEW - PostCSS configuration
├── src/
│   ├── app/
│   │   ├── globals.css     # NEW - Tailwind directives
│   │   └── layout.tsx      # MODIFY - Import CSS, add viewport
│   └── hooks/
│       ├── useMediaQuery.ts      # NEW - Responsive hook
│       └── useMediaQuery.test.ts # NEW - Hook tests
└── vitest.setup.ts         # MODIFY - Add matchMedia mock
```

**Structure Decision**: Monorepo web app structure. All changes in `apps/web/`.

## Phase 0.1: Research & Testing Strategy

_COMPLETE - See [research.md](./research.md)_

### Key Findings

1. **Tailwind CSS v3.4+** with Next.js 15 App Router - standard installation
2. **Viewport meta** via Next.js metadata export
3. **useMediaQuery** requires 'use client' directive and SSR-safe pattern
4. **vitest.setup.ts** needs matchMedia mock added

### Testing Strategy

| Check            | Output                                |
| ---------------- | ------------------------------------- |
| External APIs    | None → Risk: NONE                     |
| Test types       | Unit, Integration                     |
| E2E permitted?   | N/A (config feature)                  |
| Mocking strategy | window.matchMedia via vitest.setup.ts |

**Testing Summary**:

```
Feature type: Config/Infrastructure
Quota risks: None
Estimated tests: 6-8
Distribution: Unit 70%, Integration 20%, Manual 10%
```

**Output**: [research.md](./research.md) ✓

## Phase 0.2: Permissions Design

_SKIPPED - No roles/permissions in spec_

## Phase 0.3: Integration Analysis

_COMPLETE_

### Codebase Pattern Discovery

| Pattern Area      | Finding                                              |
| ----------------- | ---------------------------------------------------- |
| Hook location     | No existing hooks dir - create `src/hooks/`          |
| Client components | Use 'use client' directive (page.tsx pattern)        |
| CSS approach      | 100% inline styles currently - Tailwind will coexist |
| Test setup        | vitest.setup.ts exists, needs matchMedia mock        |

### Integration Points

| File            | Integration                           |
| --------------- | ------------------------------------- |
| layout.tsx      | Import globals.css, metadata.viewport |
| vitest.setup.ts | Add matchMedia mock for hook tests    |

### Code Reuse Decision

| Pattern Needed  | Existing?     | Decision               |
| --------------- | ------------- | ---------------------- |
| Custom hooks    | No hooks/ dir | CREATE new directory   |
| CSS imports     | No global CSS | CREATE globals.css     |
| matchMedia mock | Not present   | ADD to vitest.setup.ts |

**Output**: Integration patterns documented ✓

## Phase 0.4: Design Pre-flight

_SKIPPED - Backend-only/Config feature (no UI changes)_

## Phase 0.5: Infrastructure & Migrations

_SKIPPED - No env vars, migrations, or deprecations_

## Phase 1: Design & Contracts

_COMPLETE_

### Design Tokens (Tailwind Config)

| Token           | Tailwind Class     | Hex Value | Usage                    |
| --------------- | ------------------ | --------- | ------------------------ |
| wine-dark       | bg-wine-dark       | #3d010b   | Headers, primary buttons |
| wine-burgundy   | bg-wine-burgundy   | #7C2D3C   | Accent, selected states  |
| wine-background | bg-wine-background | #221a13   | Component backgrounds    |
| wine-surface    | bg-wine-surface    | #282f20   | Body background          |
| wine-header     | bg-wine-header     | #09040a   | Header background        |
| wine-input      | bg-wine-input      | #443326   | Input field backgrounds  |
| wine-hover      | bg-wine-hover      | #5a0210   | Hover states             |

### Breakpoints (Tailwind Defaults)

| Name   | Min Width | CSS Media Query            |
| ------ | --------- | -------------------------- |
| (base) | 0px       | Mobile-first default       |
| sm     | 640px     | @media (min-width: 640px)  |
| md     | 768px     | @media (min-width: 768px)  |
| lg     | 1024px    | @media (min-width: 1024px) |
| xl     | 1280px    | @media (min-width: 1280px) |
| 2xl    | 1536px    | @media (min-width: 1536px) |

### API Contracts

N/A - No API changes for this feature.

### Test Scenarios

| Scenario                    | Test Type   | Description                           |
| --------------------------- | ----------- | ------------------------------------- |
| useMediaQuery initial state | Unit        | Returns false on SSR                  |
| useMediaQuery updates       | Unit        | Returns true when query matches       |
| useMediaQuery cleanup       | Unit        | Removes event listener on unmount     |
| Tailwind build              | Integration | Build completes without errors        |
| Design tokens available     | Integration | Custom classes produce correct colors |

**Output**: [quickstart.md](./quickstart.md) ✓

## Phase 2: Task Planning Approach

_Executed by /tasks command, NOT /plan_

**Strategy**: TDD approach - write hook tests first, then implementation

| Order | Task Type | Description                                   |
| ----- | --------- | --------------------------------------------- |
| 1     | Setup     | Install Tailwind dependencies                 |
| 2     | Config    | Create tailwind.config.js with design tokens  |
| 3     | Config    | Create postcss.config.js                      |
| 4     | Config    | Create globals.css with Tailwind directives   |
| 5     | Modify    | Update layout.tsx (import CSS, viewport meta) |
| 6     | Test      | Add matchMedia mock to vitest.setup.ts        |
| 7     | Test      | Write useMediaQuery tests (TDD - red)         |
| 8     | Implement | Create useMediaQuery hook (TDD - green)       |
| 9     | Verify    | Run build, tests, type-check, lint            |

**Constraints**: Tests must fail before implementation (TDD red phase)

## Progress Tracking

| Phase                  | Status         | Skip If             |
| ---------------------- | -------------- | ------------------- |
| 0.1 Research + Testing | [X] Complete   | Never               |
| 0.2 Permissions        | [X] Skipped    | No roles in spec    |
| 0.3 Integration        | [X] Complete   | Never               |
| 0.4 Design Pre-flight  | [X] Skipped    | Backend-only/Config |
| 0.5 Infrastructure     | [X] Skipped    | No env/migrations   |
| 1 Design & Contracts   | [X] Complete   | -                   |
| 2 Task Planning        | [X] Documented | -                   |

**Gates**: Constitution Check PASS ✓, All phases complete ✓

---

**Ready for**: `/tasks` command to generate tasks.md

---

_Based on Constitution v2.1.1_
