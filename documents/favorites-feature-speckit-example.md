# SpecKit Conversion: Favorites Feature

**Purpose**: Retrospective example showing what the Favorites feature planning
documents would look like using the SpecKit v2 methodology.

**Original Document**: [favorites-feature-plan.md](favorites-feature-plan.md)

---

# Part 1: Feature Specification (spec.md)

```yaml
---
meta:
  spec_id: 001
  spec_name: wine-favorites
  status: completed
  phase: completed
  created: 2026-01-11
  updated: 2026-01-11

summary:
  goals:
    - {
        id: G1,
        description: 'Allow users to mark wines as favorites',
        priority: HIGH,
      }
    - {
        id: G2,
        description: 'Visual identification of favorites in list',
        priority: HIGH,
      }
    - {
        id: G3,
        description: 'Filter wine list to show only favorites',
        priority: MEDIUM,
      }
  constraints:
    - {
        id: C1,
        description: 'Must integrate with existing wine table UI',
        type: TECHNICAL,
      }
    - {
        id: C2,
        description: 'Star icons must match wine-themed color palette',
        type: DESIGN,
      }
  decisions:
    - {
        id: D1,
        decision: 'Use star icon for favorite indicator',
        rationale: 'Universal recognition',
      }
    - {
        id: D2,
        decision: 'Ruby red (#E63946) for filled star',
        rationale: 'Matches app theme',
      }

critical_requirements:
  type: feature-minor
  ui_changes: minor
---
```

# Feature Specification: Wine Favorites

**Feature Branch**: `001-wine-favorites` | **Created**: 2026-01-11 | **Status**:
Completed **Input**: User description: "Add ability to mark wines as favorites"

---

## User Scenarios & Testing

### Primary User Story

A wine collector wants to mark certain wines as "favorites" so they can quickly
identify and filter to their preferred bottles without scrolling through their
entire collection.

### Acceptance Scenarios

1. **Given** I'm viewing my wine list, **When** I click the star icon on a wine
   row, **Then** the star fills with ruby red and the wine is marked as favorite

2. **Given** a wine is marked as favorite, **When** I click the star icon again,
   **Then** the star becomes outlined and the wine is no longer a favorite

3. **Given** I have several wines marked as favorites, **When** I enable the
   "Favorites" filter, **Then** only my favorite wines are displayed

4. **Given** I'm viewing wine details, **When** I click the star in the modal
   header, **Then** the favorite status toggles without closing the modal

5. **Given** the favorites filter is active, **When** I click "Clear Filters",
   **Then** the favorites filter is reset and all wines are shown

### Edge Cases

- What happens when toggling favorite fails? → Optimistic update reverts
- Can I favorite a wine while creating it? → No, favorites only for existing
  wines

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST persist favorite status to database
- **FR-002**: System MUST display filled star for favorites, outline for
  non-favorites
- **FR-003**: Users MUST be able to toggle favorite from wine table row
- **FR-004**: Users MUST be able to toggle favorite from wine detail modal
- **FR-005**: System MUST provide filter to show only favorite wines
- **FR-006**: Star click in table MUST NOT open the wine detail modal
- **FR-007**: System MUST use optimistic updates for immediate UI feedback
- **FR-008**: System MUST revert optimistic update if API call fails

### Key Entities

- **Wine.favorite**: Boolean field indicating favorite status (default: false)

### Test Strategy

**Test Type Classification**:

| FR     | Primary Test Type | Reason                             |
| ------ | ----------------- | ---------------------------------- |
| FR-001 | Integration       | Database persistence               |
| FR-002 | Unit              | Component rendering logic          |
| FR-003 | Unit              | Click handler and state management |
| FR-004 | Unit              | Modal interaction                  |
| FR-005 | Unit              | Filter logic in useMemo            |
| FR-006 | Unit              | Event propagation handling         |
| FR-007 | Integration       | Optimistic update pattern          |
| FR-008 | Integration       | Error handling and rollback        |

**This Feature**:

- Feature type: [X] Mixed (Backend + Frontend)
- Unit: 60% | Integration: 40% | E2E: 0%

**Estimated Test Count**: 8-12 tests

### Error Handling & Recovery

| Error Scenario   | Type      | User Message    | Recovery Action |
| ---------------- | --------- | --------------- | --------------- |
| Toggle API fails | Transient | (silent revert) | Revert UI state |
| Network timeout  | Transient | (silent revert) | Revert UI state |

**Resumability**: N/A (simple toggle operation)

### UI/Design Reference

**Feature Classification**: [X] Minor UI (< 3 components, existing patterns)

**Design Elements**:

- Star icon: First column in wine table (40px width)
- Colors: Filled `#E63946`, Outline `rgba(255,255,255,0.3)`, Hover
  `rgba(230,57,70,0.6)`
- Checkbox: "Favorites" in filter section

---

## Review Checklist (Gate)

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Test strategy defined
- [x] Error handling defined
- [x] UI complexity classified

---

# Part 2: Implementation Plan (plan.md)

```yaml
---
meta:
  spec_id: 001
  spec_name: wine-favorites
  phase: completed
  updated: 2026-01-11

summary:
  tech_stack: [TypeScript, React, Express, Prisma, SQLite]
  external_deps: []
  test_strategy: { unit: 60, integration: 40, e2e: 0 }
  deployment: immediate
---
```

# Implementation Plan: Wine Favorites

**Branch**: `001-wine-favorites` | **Date**: 2026-01-11 | **Spec**:
specs/001-wine-favorites/spec.md

## Summary

Add favorite functionality to wines with toggle from table and modal, filter
support, and optimistic updates. Simple boolean field addition with UI
integration.

## Technical Context

**Language/Version**: TypeScript 5.x **Primary Dependencies**: React 18,
Express, Prisma, Zod **Storage**: SQLite (development) **Testing**: Vitest,
React Testing Library **Target Platform**: Web browser **Project Type**:
Monorepo (apps/api, apps/web, packages/database) **Performance Goals**: Instant
UI feedback (optimistic updates) **Constraints**: None significant
**Scale/Scope**: Single-user application

## Constitution Check

- [x] TDD: Tests written before implementation
- [x] Verification: Fresh verification before completion claims
- [x] Skills: Checked for applicable skills

---

## Phase 0.1: Research & Testing Strategy

_MANDATORY_

### Research

No research needed — straightforward boolean field addition with existing
patterns.

### Testing Strategy

| Check            | Output                    |
| ---------------- | ------------------------- |
| External APIs    | None                      |
| Test types       | Unit, Integration         |
| E2E permitted?   | Yes (no external APIs)    |
| Mocking strategy | API calls mocked in tests |

**Testing Summary**:

```
Feature type: Mixed
Quota risks: None
Estimated tests: 10
Distribution: Unit 60%, Integration 40%
```

---

## Phase 0.3: Integration Analysis

_MANDATORY_

### Codebase Pattern Discovery

| Pattern Area    | Finding                               |
| --------------- | ------------------------------------- |
| State updates   | Optimistic with revert on error       |
| Response format | `{ success, data, error }`            |
| Zod schemas     | createWineSchema, updateWineSchema    |
| Component props | Callbacks for parent state management |

### Code Reuse

**Skill**: `code-reuse-analysis`

| Pattern Needed | Existing Code                  | Decision |
| -------------- | ------------------------------ | -------- |
| Toggle handler | handleToggleFavorite           | NEW      |
| Filter logic   | filteredAndSortedWines useMemo | EXTEND   |
| Star icon      | Lucide icons library           | REUSE    |

---

## Phase 0.5: Infrastructure & Migrations

_CONDITIONAL — Included because this feature adds a database field_

### Migrations

| Migration      | Type     | Risk | Rollback      |
| -------------- | -------- | ---- | ------------- |
| Add `favorite` | Additive | LOW  | Remove column |

**Migration Risk**: LOW (additive, nullable boolean with default)

---

## Phase 1: Design & Contracts

### Data Model

```prisma
model Wine {
  // ... existing fields ...
  favorite Boolean @default(false)  // NEW
}
```

### API Contracts

**Update Wine** (existing endpoint extended):

```
PUT /api/wines/:id
Body: { favorite?: boolean, ...otherFields }
Response: { success: true, data: Wine }
```

### Component Changes

1. **WineTable.tsx**: Add star column, onToggleFavorite prop
2. **WineDetailModal.tsx**: Add star in header
3. **WineFilters.tsx**: Add showOnlyFavorites checkbox
4. **page.tsx**: Add state and handler for favorites

---

## Phase 2: Task Planning Approach

_Executed by /tasks command, NOT /plan_

**Strategy**: Generate from Phase 1 contracts, constrain by Phase 0.1 testing
estimates

| From       | Task Type                        | Order |
| ---------- | -------------------------------- | ----- |
| Data model | Schema migration                 | 1st   |
| Contracts  | Zod schema updates               | 2nd   |
| Components | UI components (star, filter)     | 3rd   |
| Stories    | Integration (optimistic updates) | 4th   |

---

## Progress Tracking

| Phase                  | Status | Skip If                        |
| ---------------------- | ------ | ------------------------------ |
| 0.1 Research + Testing | [x]    | Never                          |
| 0.2 Permissions        | SKIP   | No roles in spec               |
| 0.3 Integration        | [x]    | Never                          |
| 0.4 Design Pre-flight  | SKIP   | Minor UI                       |
| 0.5 Infrastructure     | [x]    | No env/migrations/deprecations |
| 1 Design & Contracts   | [x]    | —                              |
| 2 Task Planning        | [x]    | —                              |

---

# Part 3: Tasks (tasks.json)

```json
{
  "spec_id": "001",
  "spec_name": "wine-favorites",
  "generated": "2026-01-11",
  "tasks": [
    {
      "id": "T001",
      "phase": "setup",
      "description": "Add favorite Boolean field to Prisma schema and run migration",
      "status": "completed",
      "parallel": false,
      "target_file": "packages/database/prisma/schema.prisma"
    },
    {
      "id": "T002",
      "phase": "setup",
      "description": "Update Zod schemas (createWineSchema, updateWineSchema) with favorite field",
      "status": "completed",
      "parallel": false,
      "target_file": "apps/api/src/schemas/wine.schema.ts"
    },
    {
      "id": "T003",
      "phase": "core",
      "description": "Add star column to WineTable with toggle handler and click propagation stop",
      "status": "completed",
      "parallel": true,
      "target_file": "apps/web/src/components/WineTable.tsx"
    },
    {
      "id": "T004",
      "phase": "core",
      "description": "Add star icon to WineDetailModal header with toggle in view mode",
      "status": "completed",
      "parallel": true,
      "target_file": "apps/web/src/components/WineDetailModal.tsx"
    },
    {
      "id": "T005",
      "phase": "core",
      "description": "Add showOnlyFavorites checkbox to WineFilters component",
      "status": "completed",
      "parallel": true,
      "target_file": "apps/web/src/components/WineFilters.tsx"
    },
    {
      "id": "T006",
      "phase": "integration",
      "description": "Add handleToggleFavorite with optimistic updates and favorites filter to page.tsx",
      "status": "completed",
      "parallel": false,
      "target_file": "apps/web/src/app/page.tsx"
    },
    {
      "id": "T007",
      "phase": "polish",
      "description": "Update test mock data with favorite field in WineTable and WineFilters tests",
      "status": "completed",
      "parallel": true,
      "target_file": "apps/web/__tests__/WineTable.test.tsx"
    },
    {
      "id": "T-DOC-GATE",
      "phase": "verify",
      "description": "Documentation reconciliation - identify and update affected docs",
      "status": "completed",
      "parallel": false,
      "agent": "documentation-reconciliation",
      "gate": "T007",
      "verify": "documentation-update-report.md generated with Status: PASS",
      "block_on": "Status: DRIFT_DETECTED in report"
    },
    {
      "id": "T-FINAL",
      "phase": "verify",
      "description": "All verification gates passed",
      "status": "completed",
      "parallel": false,
      "gate": "T-DOC-GATE",
      "composed_of": [
        {
          "check": "typecheck",
          "always": true,
          "command": "npm run type-check"
        },
        { "check": "lint", "always": true, "command": "npm run lint" },
        { "check": "unit", "always": true, "command": "npm test" },
        { "check": "integration", "always": true, "command": "npm test" },
        { "check": "security", "always": true, "agent": "code-reviewer" },
        { "check": "code-review", "always": true, "agent": "code-reviewer" }
      ]
    }
  ]
}
```

---

## Outcome

**Status**: COMPLETED **Tests**: All 146 passing **Time**: Single session
**Clarification gate**: Passed (type = feature-minor, clarification not
required)

---

## Files Modified (Actual)

### Database

- `packages/database/prisma/schema.prisma`

### API

- `apps/api/src/schemas/wine.schema.ts`

### Frontend

- `apps/web/src/app/page.tsx`
- `apps/web/src/components/WineTable.tsx`
- `apps/web/src/components/WineDetailModal.tsx`
- `apps/web/src/components/WineFilters.tsx`

### Tests

- `apps/web/__tests__/WineTable.test.tsx`
- `apps/web/__tests__/WineFilters.test.tsx`

---

_This is a retrospective conversion showing SpecKit v2 format. The actual
implementation used conventional Claude planning._
