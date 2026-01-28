---
# Context Optimization Metadata
meta:
  spec_id: 002-phase-2-layout
  spec_name: Mobile Layout Restructuring
  status: draft
  phase: tasks
  created: 2025-01-28
  updated: 2025-01-28

# Quick Reference (for checkpoint resume)
summary:
  goals:
    - {
        id: G1,
        description:
          'Convert fixed 25%/75% layout to responsive stacking on mobile',
        priority: HIGH,
      }
    - {
        id: G2,
        description: 'Create mobile navigation with hamburger menu',
        priority: HIGH,
      }
    - {
        id: G3,
        description: 'Convert WineFilters to slide-out drawer on mobile',
        priority: HIGH,
      }
    - {
        id: G4,
        description: 'Update header for mobile responsiveness',
        priority: MEDIUM,
      }
  constraints:
    - {
        id: C1,
        description: 'Must use existing useMediaQuery hook from Phase 1',
        type: TECHNICAL,
      }
    - {
        id: C2,
        description: 'Must use Tailwind CSS classes (installed in Phase 1)',
        type: TECHNICAL,
      }
    - {
        id: C3,
        description: 'Desktop layout must remain unchanged',
        type: FUNCTIONAL,
      }
  decisions:
    - {
        id: D1,
        decision:
          'Use 1024px as single breakpoint (< 1024 = drawer, >= 1024 = sidebar)',
        rationale:
          'Simplified breakpoint strategy - tablet behaves like mobile',
      }
    - {
        id: D2,
        decision: 'Filter drawer slides from left side',
        rationale: 'Matches desktop sidebar position for consistency',
      }
    - {
        id: D3,
        decision: 'Drawer width is 80% of screen with visible backdrop',
        rationale: 'Standard mobile UX pattern, allows tap-to-dismiss',
      }
    - {
        id: D4,
        decision: 'Use filter/funnel icon for toggle button',
        rationale: 'Semantic icon for filtering, universally understood',
      }
    - {
        id: D5,
        decision: 'Drawer animation duration ~300ms',
        rationale: 'Standard animation timing, smooth but not slow',
      }

# CRITICAL REQUIREMENTS - Must verify during implementation
critical_requirements:
  type: feature-major
  ui_changes: major
---

# Feature Specification: Mobile Layout Restructuring (Phase 2)

**Feature Branch**: `002-phase-2-layout` **Created**: 2025-01-28 **Status**:
Draft **Input**: User description: "Phase 2: Layout Restructuring - Convert main
layout from fixed 25%/75% to responsive, create mobile navigation with hamburger
menu, convert WineFilters sidebar to slide-out drawer on mobile, update header
for mobile"

---

## Clarifications

### Session 2025-01-28

- Q: What width should the filter drawer be on mobile? → A: 80% of screen width,
  with 20% visible backdrop
- Q: What icon should represent the filter toggle button? → A: Filter/funnel
  icon (semantic for filtering content)
- Q: How should tablet (768-1024px) behave differently from mobile? → A: Same as
  mobile (drawer overlay) - single breakpoint at 1024px
- Q: Should the drawer have a slide animation, and if so, how fast? → A:
  Standard animation (~300ms)

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a mobile user viewing my wine collection, I want the application to adapt to
my smaller screen so that I can easily browse wines, access filters, and
navigate without horizontal scrolling or cramped UI elements.

### Acceptance Scenarios

1. **Given** I am on a mobile device (< 768px width), **When** I load the wine
   cellar page, **Then** I see the wine list taking full width with no sidebar
   visible, and a filter icon/button is available to access filters.

2. **Given** I am on a mobile device, **When** I tap the filter icon/hamburger
   menu, **Then** a drawer slides in from the left containing all filter
   options.

3. **Given** the filter drawer is open on mobile, **When** I tap outside the
   drawer or tap a close button, **Then** the drawer closes and I return to the
   wine list view.

4. **Given** I am on a tablet (< 1024px), **When** I view the page, **Then** the
   layout behaves the same as mobile (drawer overlay mode).

5. **Given** I am on a desktop (>= 1024px), **When** I view the page, **Then**
   the layout remains the current 25%/75% side-by-side layout with no changes.

6. **Given** I am on mobile with filters applied, **When** I close the filter
   drawer, **Then** the applied filters remain active and the wine list reflects
   the filtered results.

7. **Given** I am on mobile, **When** I view the header area, **Then** the
   bottle count and "Add Wine" button are appropriately sized and positioned for
   touch interaction.

### Edge Cases

- What happens when the drawer is open and the user rotates their device?
  - The drawer should close and layout should adapt to new orientation/size
- What happens when filters are applied and user resizes browser from mobile to
  desktop?
  - Filters remain applied, layout transitions smoothly, no state loss
- What happens when the drawer is animating and user taps rapidly?
  - Animation should complete or be interruptible without breaking state

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display wine list at full width on mobile (< 768px)
  with filters hidden by default
- **FR-002**: System MUST provide a visible filter toggle button on mobile that
  opens the filter drawer
- **FR-003**: System MUST display WineFilters in a slide-out drawer on mobile
  that overlays the main content
- **FR-004**: System MUST include a backdrop/overlay when the filter drawer is
  open that closes the drawer when tapped
- **FR-005**: System MUST include a close button within the filter drawer for
  explicit dismissal
- **FR-006**: System MUST maintain the existing 25%/75% layout on desktop (>=
  1024px)
- **FR-007**: System MUST preserve all filter state when opening/closing the
  drawer
- **FR-008**: Header MUST display bottle count and "Add Wine" button
  appropriately on all screen sizes
- **FR-009**: All interactive elements MUST have minimum 44x44px touch targets
  on mobile
- **FR-010**: Filter drawer MUST be scrollable if content exceeds viewport
  height
- **FR-011**: Filter drawer MUST be 80% of screen width with 20% visible
  backdrop
- **FR-012**: Filter toggle button MUST use a filter/funnel icon
- **FR-013**: Filter drawer MUST animate open/close with ~300ms duration

### Key Entities

- **Filter Drawer State**: Whether the mobile filter drawer is open or closed
  (UI state only, not persisted)
- **Breakpoint**: Single threshold at 1024px (< 1024px = drawer mode, >= 1024px
  = desktop sidebar mode)

### Test Strategy _(mandatory)_

**Test Type Classification**:

| FR     | Primary Test Type | Reason                                              |
| ------ | ----------------- | --------------------------------------------------- |
| FR-001 | Integration       | Tests responsive layout rendering based on viewport |
| FR-002 | Integration       | Tests button presence and click handler             |
| FR-003 | Integration       | Tests drawer component rendering and positioning    |
| FR-004 | Integration       | Tests backdrop click handler                        |
| FR-005 | Unit              | Tests close button functionality                    |
| FR-006 | Integration       | Tests desktop layout preservation                   |
| FR-007 | Integration       | Tests state persistence across drawer toggle        |
| FR-008 | Integration       | Tests header responsive behavior                    |
| FR-009 | Unit              | Tests touch target sizing                           |
| FR-010 | Integration       | Tests drawer scroll behavior                        |

**This Feature**:

- Feature type: [X] Frontend-heavy [ ] Backend-heavy [ ] Mixed
- Unit: 20% | Integration: 70% | E2E: 10%

**Estimated Test Count**: 12-15 tests based on 10 functional requirements

### Error Handling & Recovery

**Error Scenarios**:

| Error Scenario                          | Type      | User Message  | Recovery Action                            |
| --------------------------------------- | --------- | ------------- | ------------------------------------------ |
| Drawer animation interrupted            | Transient | None (silent) | Complete animation to nearest stable state |
| Media query not supported (old browser) | Permanent | None          | Fallback to desktop layout                 |

**Resumability**:

- [x] Operation can resume from last checkpoint? (N/A - UI state only)
- [x] Idempotency guaranteed? (Opening/closing drawer is always safe)

### UI/Design Reference

**Feature Classification**:

- [ ] **Backend-only** (no UI changes)
- [ ] **Minor UI** (< 3 components, existing patterns only)
- [ ] **Moderate UI** (3-7 components, some custom work)
- [x] **Major UI** (8+ components, new views/pages, complex flows)

**Design Reference**:

- Mockup/Design Source: ASCII wireframes in documents/mobile-responsive-plan.md
  (Phase 2 section)
- Design Components:
  - MobileFilterToggle (new) - filter/funnel icon button, minimum 44x44px touch
    target
  - FilterDrawer (new) - 80% width slide-out container wrapping WineFilters,
    ~300ms animation
  - Backdrop (new) - semi-transparent overlay (20% visible), tap to dismiss
  - Updated page.tsx layout - responsive flex/stack, single breakpoint at 1024px
  - Updated Header section - mobile-friendly sizing
- Mockup covers ALL functional requirements: [X] Yes [ ] No

**Layout Wireframes**:

```
Mobile/Tablet (< 1024px) - Drawer Closed:
┌─────────────────┐
│ Header    [⏬]  │ ← Filter/funnel icon (44x44px touch target)
├─────────────────┤
│                 │
│   Wine List     │
│   (Full Width)  │
│                 │
└─────────────────┘

Mobile/Tablet (< 1024px) - Drawer Open (80% width, 300ms slide):
┌────────────┬────┐
│ Filters [X]│░░░░│ ← 80% drawer + 20% backdrop
│            │░░░░│
│ Search...  │░░░░│ ← Tap backdrop to close
│ Wine Type  │░░░░│
│ Country    │░░░░│
│ ...        │░░░░│
└────────────┴────┘

Desktop (>= 1024px) - Unchanged:
┌─────────────────────────────────────┐
│              Header                 │
├──────────┬──────────────────────────┤
│          │                          │
│ Filters  │       Wine Table         │
│  (25%)   │         (75%)            │
│          │                          │
└──────────┴──────────────────────────┘
```

---

## Review Checklist (Gate)

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Test strategy defined
- [x] Error handling defined (if can fail)
- [x] UI complexity classified (if has UI)

---
