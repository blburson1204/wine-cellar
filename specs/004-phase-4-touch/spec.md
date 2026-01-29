---
# Context Optimization Metadata
meta:
  spec_id: '004'
  spec_name: 'Phase 4: Touch & Interaction Optimization'
  status: draft
  phase: specify
  created: 2026-01-29
  updated: 2026-01-29

# Quick Reference (for checkpoint resume)
summary:
  goals:
    - {
        id: G1,
        description:
          'All interactive elements meet 44x44px WCAG touch target minimum',
        priority: HIGH,
      }
    - {
        id: G2,
        description:
          'FilterDrawer supports ESC key and swipe-to-close gestures',
        priority: HIGH,
      }
    - {
        id: G3,
        description:
          'Initial page load uses skeleton loader instead of plain text',
        priority: MEDIUM,
      }
    - {
        id: G4,
        description:
          'Loading actions show visual spinner instead of text-only feedback',
        priority: MEDIUM,
      }
  constraints:
    - {
        id: C1,
        description: 'Must not break existing desktop layout or behavior',
        type: TECHNICAL,
      }
    - {
        id: C2,
        description:
          'Touch improvements apply at mobile breakpoint (< 768px) where
          layout-sensitive',
        type: TECHNICAL,
      }
    - {
        id: C3,
        description: 'Must maintain existing test suite (625 tests passing)',
        type: TECHNICAL,
      }
  decisions:
    - {
        id: D1,
        decision:
          'Scope gestures to FilterDrawer swipe-to-close and ESC key only',
        rationale:
          'Card swipe actions and pull-to-refresh add complexity with limited
          value for a personal wine app',
      }
    - {
        id: D2,
        decision: 'Use inline styles consistent with existing codebase',
        rationale:
          'All existing components use inline styles; Tailwind only used for
          layout utilities',
      }

# CRITICAL REQUIREMENTS - Must verify during implementation
critical_requirements:
  type: feature-minor
  ui_changes: moderate
---

# Feature Specification: Phase 4 — Touch & Interaction Optimization

**Feature Branch**: `004-phase-4-touch` **Created**: 2026-01-29 **Status**:
Draft **Input**: User description: "Phase 4: Touch & Interaction Optimization —
ensure all interactive elements meet 44x44px WCAG touch targets, add swipe/ESC
gestures to FilterDrawer and modals, add loading spinner and skeleton loaders
for initial data fetch."

---

## User Scenarios & Testing

### Primary User Story

A user browsing their wine collection on a mobile phone can comfortably tap all
buttons, checkboxes, and controls without accidentally hitting the wrong target.
When opening the filter drawer, they can swipe it closed or press Escape. While
the wine list loads, they see a visual skeleton placeholder instead of a bare
text message.

### Acceptance Scenarios

1. **Given** a mobile user viewing the wine list, **When** they tap any
   interactive element (button, checkbox, link, select), **Then** the touch
   target is at least 44x44px with adequate spacing from adjacent targets.

2. **Given** a mobile user with the FilterDrawer open, **When** they swipe left
   on the drawer, **Then** the drawer closes with its existing 300ms slide
   animation.

3. **Given** a mobile user with the FilterDrawer open, **When** they press the
   Escape key (external keyboard), **Then** the drawer closes.

4. **Given** a user loading the app for the first time, **When** the wine data
   is being fetched, **Then** they see an animated skeleton placeholder (not
   plain text).

5. **Given** a user saving a wine or uploading an image, **When** the operation
   is in progress, **Then** they see a visual spinner alongside the status text.

### Edge Cases

- What happens when a user starts swiping the FilterDrawer but reverses
  direction? The drawer snaps back to its open position.
- What happens when touch targets are enlarged on desktop? Desktop layout must
  not break; size increases should use padding that doesn't disrupt desktop
  alignment.
- What happens if the skeleton loader renders but the fetch fails? Existing
  error handling still applies; skeleton is only for the loading state.

---

## Requirements

### Functional Requirements

#### Touch Targets (4.1)

- **FR-001**: FilterDrawer close button MUST be at least 44x44px (currently
  32x32px in WineFilters.tsx).
- **FR-002**: WineFilters checkbox indicators MUST have a tappable area of at
  least 44x44px (currently 16x16px visual indicator with small label hit area).
- **FR-003**: WineFilters select dropdowns (Grape Variety, Country, Min Rating)
  MUST have minHeight of 44px (currently relying on 8px padding only).
- **FR-004**: WineFilters price range inputs MUST have minHeight of 44px
  (currently 6px padding only).
- **FR-005**: WineFilters "Clear All Filters" button MUST have minHeight of 44px
  (currently no explicit height).
- **FR-006**: WineDetailModal favorite star MUST be a `<button>` element with
  44x44px minimum touch target and proper aria attributes (currently a `<span>`
  with 24px font size only).
- **FR-007**: WineDetailModal "Wine Details" link MUST have adequate touch
  target padding to reach 44px effective height (currently 16px font with no
  padding).

#### Gestures (4.2)

- **FR-008**: FilterDrawer MUST close when the user presses the Escape key.
- **FR-009**: FilterDrawer MUST close when the user swipes left with a
  horizontal distance exceeding 50px and velocity indicating intentional
  gesture.
- **FR-010**: If a swipe gesture starts but reverses or doesn't meet the
  threshold, the drawer MUST snap back to its open position.

#### Loading States (4.3)

- **FR-011**: Initial wine list loading MUST display an animated skeleton
  placeholder instead of the current "Loading your collection..." text.
- **FR-012**: A reusable LoadingSpinner component MUST be created for use across
  save/upload/delete operations.
- **FR-013**: WineDetailModal save and image upload buttons MUST show the
  LoadingSpinner alongside their existing text feedback ("Saving...",
  "Uploading...").

### Test Strategy

**Test Type Classification**:

| FR               | Primary Test Type | Reason                                                         |
| ---------------- | ----------------- | -------------------------------------------------------------- |
| FR-001 to FR-005 | Unit              | Render WineFilters, assert minHeight/minWidth in styles        |
| FR-006           | Unit              | Verify button element, aria attributes, click handler          |
| FR-007           | Unit              | Render modal view mode, assert link padding/minHeight          |
| FR-008           | Unit              | Simulate Escape keydown on FilterDrawer, verify onClose called |
| FR-009           | Unit              | Simulate touch events on FilterDrawer, verify onClose called   |
| FR-010           | Unit              | Simulate partial swipe, verify drawer stays open               |
| FR-011           | Unit              | Render page in loading state, assert skeleton elements present |
| FR-012           | Unit              | Render LoadingSpinner, verify animation class/style            |
| FR-013           | Unit              | Render modal in saving state, verify spinner present           |

**This Feature**:

- Feature type: [X] Frontend-heavy
- Unit: 90% | Integration: 10% | E2E: 0%

**Estimated Test Count**: ~18-22 tests based on 13 functional requirements

### Error Handling & Recovery

No new error scenarios introduced. Touch target and gesture changes are purely
UI. Loading states use existing fetch error handling — the skeleton simply
replaces the text shown during the loading phase.

### UI/Design Reference

**Feature Classification**:

- [x] **Moderate UI** (3-7 components, some custom work)

**Components affected**:

| Component                  | Change Type                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| WineFilters.tsx            | Style updates: close button 44px, checkbox hit areas, select/input minHeight, clear button minHeight |
| WineDetailModal.tsx        | Convert favorite span to button (44px), add link padding, add spinner to save/upload buttons         |
| FilterDrawer.tsx           | Add Escape key handler, add swipe-to-close touch event handling                                      |
| page.tsx                   | Replace loading text with skeleton component                                                         |
| LoadingSpinner.tsx (new)   | Small reusable animated spinner                                                                      |
| WineListSkeleton.tsx (new) | Skeleton placeholder for wine list loading state                                                     |

**Design tokens in use**: wine-burgundy (#7C2D3C), wine-dark (#3d010b),
wine-background (#221a13), wine-hover (#5a0210). Main breakpoint: 768px.

---

## Review Checklist (Gate)

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Test strategy defined
- [x] Error handling defined (if can fail)
- [x] UI complexity classified (if has UI)

---
