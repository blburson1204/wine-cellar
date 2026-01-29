---
# Context Optimization Metadata
meta:
  spec_id: 003-phase-3-mobile
  spec_name: Phase 3 Mobile Responsive Components
  status: draft
  phase: specify
  created: 2026-01-28
  updated: 2026-01-28

# Quick Reference (for checkpoint resume)
summary:
  goals:
    - id: G1
      description: 'Display wines as cards on mobile, table on desktop'
      priority: HIGH
    - id: G2
      description: 'Make modals full-screen and single-column on mobile'
      priority: HIGH
    - id: G3
      description: 'Ensure all touch targets meet 44px minimum'
      priority: HIGH
    - id: G4
      description: 'Replace datalist with accessible Headless UI Combobox'
      priority: MEDIUM
  constraints:
    - id: C1
      description: 'Must use existing Tailwind CSS setup from Phase 1'
      type: TECHNICAL
    - id: C2
      description: 'Must maintain all existing functionality'
      type: FUNCTIONAL
    - id: C3
      description: 'Must use useMediaQuery hook for responsive behavior'
      type: TECHNICAL
  decisions:
    - id: D1
      decision: 'Use card layout on mobile (<768px), table on tablet+'
      rationale: 'Tables with 11 columns unusable on mobile screens'
    - id: D2
      decision: 'Use Headless UI Combobox for autocomplete fields'
      rationale:
        'Same company as Tailwind, designed to work together, fully accessible'

# CRITICAL REQUIREMENTS - Must verify during implementation
critical_requirements:
  type: feature-major
  ui_changes: major
---

# Feature Specification: Phase 3 Mobile Responsive Components

**Feature Branch**: `003-phase-3-mobile` **Created**: 2026-01-28 **Status**:
Draft **Input**: User description: "Phase 3 Mobile Responsive Components -
Create WineCard component for mobile view, update WineTable to switch between
card layout (mobile) and table layout (desktop), make WineDetailModal and
AddWineModal full-screen on mobile with single-column layouts, ensure 44px+
touch targets on all form elements, and upgrade datalist fields to Headless UI
Combobox components"

---

## Context

This is Phase 3 of the Mobile Responsive project. Phases 1 and 2 are complete:

- **Phase 1**: Tailwind CSS configured, viewport meta tag verified, design
  tokens created, useMediaQuery hook implemented
- **Phase 2**: Mobile navigation (MobileFilterToggle), FilterDrawer with
  backdrop, responsive main layout (1024px breakpoint), WineFilters updated with
  onClose prop

Phase 3 focuses on making the core data display and input components
mobile-friendly.

---

## Clarifications

### Session 2026-01-28

- Q: How should mobile sort controls work? → A: Dropdown selector above card
  list (e.g., "Sort by: Name ▼") with direction toggle, mirroring desktop column
  header behavior
- Q: What fields should WineCard display? → A: 8 fields in 4-line layout:
  favorite + name, vintage + producer, type + grape variety, region + country
- Q: What is explicitly out of scope for Phase 3? → A: Swipe gestures,
  pull-to-refresh, skeleton loaders, swipe card actions (all deferred to
  Phase 4)
- Q: Combobox behavior when field receives focus? → A: Show all options
  immediately on focus (iterate to require 1 character if lists prove too long
  on mobile)

---

## User Scenarios & Testing

### Primary User Story

As a wine collector using my phone, I want to browse my wine collection in a
mobile-friendly card format, view and edit wine details in a full-screen modal,
and easily enter wine information using touch-friendly autocomplete fields, so I
can manage my cellar on any device.

### Acceptance Scenarios

1. **Given** I am viewing my wine collection on a mobile device (< 768px),
   **When** the page loads, **Then** I see wines displayed as cards instead of a
   table
2. **Given** I am viewing my wine collection on a tablet or desktop (>= 768px),
   **When** the page loads, **Then** I see wines displayed as a traditional
   table
3. **Given** I am on mobile and tap a wine card, **When** the detail modal
   opens, **Then** it displays full-screen with single-column layout
4. **Given** I am editing a wine on mobile, **When** I tap the Producer field,
   **Then** I see a touch-friendly combobox dropdown (not native datalist)
5. **Given** I am on mobile, **When** I interact with any button or form
   control, **Then** the touch target is at least 44x44 pixels

### Edge Cases

- What happens when switching orientation while modal is open? Modal should
  adapt layout.
- How does the card layout handle wines with very long names? Text should
  truncate with ellipsis.
- What happens when the combobox has no matching options? Show "No results"
  message and allow free text entry.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST display wines as cards on viewports < 768px wide
- **FR-002**: System MUST display wines as a table on viewports >= 768px wide
- **FR-003**: WineCard MUST display 8 fields in 4-line layout: (1) favorite +
  name, (2) vintage + producer, (3) type + grape variety, (4) region + country
- **FR-004**: WineCard MUST be tappable to open the wine detail modal
- **FR-005**: WineCard MUST allow toggling favorite status without opening modal
- **FR-006**: WineDetailModal MUST display full-screen on mobile (< 768px)
- **FR-007**: WineDetailModal MUST use single-column layout on mobile
- **FR-008**: WineDetailModal MUST use two-column layout on desktop (current
  behavior)
- **FR-009**: All form buttons MUST have minimum 44x44px touch target
- **FR-010**: All form inputs MUST have minimum 44px height
- **FR-011**: Combobox fields MUST replace datalist for: Producer, Country,
  Region, Grape Variety, Where Purchased
- **FR-012**: Combobox MUST support keyboard navigation (arrow keys, enter,
  escape)
- **FR-013**: Combobox MUST support touch interaction with proper target sizes
- **FR-014**: Combobox MUST filter options as user types
- **FR-015**: Combobox MUST allow free text entry (not restricted to options)
- **FR-018**: Combobox MUST show all available options immediately when field
  receives focus (filterable as user types)
- **FR-016**: WineTable sort functionality MUST be preserved on desktop
- **FR-017**: Mobile view MUST include dropdown sort selector above card list
  (e.g., "Sort by: Name ▼") with ascending/descending toggle, mirroring desktop
  column header behavior

### Key Entities

- **WineCard**: New component displaying a single wine as a card with 8 fields:
  favorite, name, vintage, producer, type, grape variety, region, country
- **Combobox**: Reusable autocomplete component wrapping Headless UI, used for 5
  fields (shows all options on focus)
- **MobileSortSelector**: Dropdown component for selecting sort field and
  direction on mobile view

### Out of Scope (Phase 4)

- Swipe gestures (swipe to dismiss modals)
- Pull-to-refresh for wine list
- Skeleton loaders for loading states
- Swipe actions on cards (favorite, delete)

### Test Strategy

**Test Type Classification**: | FR | Primary Test Type | Reason |
|----|-------------------|--------| | FR-001, FR-002 | Integration | Tests
responsive behavior with useMediaQuery | | FR-003-005 | Unit + Integration |
Component rendering and click handlers | | FR-006-008 | Integration | Modal
behavior at different breakpoints | | FR-009-010 | Unit | CSS/style verification
| | FR-011-015, FR-018 | Unit + Integration | Combobox component functionality |
| FR-016-017 | Integration | Sorting behavior preservation (desktop table +
mobile selector) |

**This Feature**:

- Feature type: [X] Frontend-heavy
- Unit: 40% | Integration: 50% | E2E: 10%

**Estimated Test Count**: 38-48 tests based on 18 functional requirements

### Error Handling & Recovery

**Error Scenarios**: | Error Scenario | Type | User Message | Recovery Action |
|----------------|------|--------------|-----------------| | Combobox options
fail to load | Transient | (silent) | Show empty dropdown, allow free text | |
Wine update fails | Transient | "Failed to save changes. Please try again." |
Keep modal open, preserve edits |

**Resumability**:

- [x] Operation can resume from last checkpoint? (modal preserves form state)
- [x] Idempotency guaranteed? (PUT operations are idempotent)

### UI/Design Reference

**Feature Classification**:

- [ ] **Backend-only** (no UI changes) - Skip design sections
- [ ] **Minor UI** (< 3 components, existing patterns only)
- [ ] **Moderate UI** (3-7 components, some custom work)
- [x] **Major UI** (8+ components, new views/pages, complex flows)

**Design Reference**:

- Mockup/Design Source: See `documents/mobile-responsive-plan.md` wireframes
- Design Components:
  - WineCard (new)
  - Combobox (new, wrapping @headlessui/react)
  - WineTable (modified for responsive switching)
  - WineDetailModal (modified for mobile layout)
- Mockup covers ALL functional requirements: [X] Yes

**Mobile Card Layout**:

```
┌─────────────────────────────┐
│ ★  Château Margaux          │  ← favorite + name
│    2019 · Château Margaux   │  ← vintage + producer
│    Red · Cabernet Sauvignon │  ← type + grape variety
│    Margaux, France          │  ← region + country
└─────────────────────────────┘
```

**Mobile Sort Selector** (above card list):

```
┌─────────────────────────────┐
│  Sort by: Vintage ▼   ↑↓   │  ← dropdown + direction toggle
└─────────────────────────────┘
```

**Mobile Modal Layout**:

- Full viewport height and width
- Fixed header with close button (X)
- Scrollable content area
- Fixed bottom action buttons (Save/Cancel)

---

## Technical Notes

### Dependencies to Install

- `@headlessui/react` - For accessible Combobox component

### Breakpoint Strategy

- Mobile: < 768px (cards, full-screen modals)
- Tablet+: >= 768px (table, standard modals)
- Use existing `useMediaQuery` hook from Phase 1

### Component Architecture

```
WineTable.tsx
  └── renders WineCard[] on mobile
  └── renders <table> on desktop

Combobox.tsx (new)
  └── wraps @headlessui/react Combobox
  └── used by WineDetailModal for 5 fields

WineDetailModal.tsx
  └── uses useMediaQuery for layout switching
  └── uses Combobox for autocomplete fields
```

---

## Review Checklist (Gate)

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Test strategy defined
- [x] Error handling defined (if can fail)
- [x] UI complexity classified (if has UI)

---

## Next Steps

1. ~~Run `/clarify` (MANDATORY for feature-major) to validate spec
   completeness~~ ✅ Done
2. Run `/plan` to generate implementation plan
3. Run `/tasks` to generate task breakdown
4. Run `/implement` to execute tasks
