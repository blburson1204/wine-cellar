---
# Context Optimization Metadata
meta:
  spec_id: 001-mobile-responsive-phase
  spec_name: Mobile Responsive Phase 1 - Foundation Setup
  status: draft
  phase: specify
  created: 2026-01-28
  updated: 2026-01-28

# Quick Reference (for checkpoint resume)
summary:
  goals:
    - id: G1
      description: Install and configure Tailwind CSS for responsive styling
      priority: HIGH
    - id: G2
      description: Establish design tokens matching existing color scheme
      priority: HIGH
    - id: G3
      description: Add viewport meta tag for proper mobile rendering
      priority: HIGH
    - id: G4
      description: Create useMediaQuery hook for responsive component logic
      priority: MEDIUM
  constraints:
    - id: C1
      description: Must not change existing visual appearance
      type: VISUAL
    - id: C2
      description: Must maintain all existing test coverage
      type: TECHNICAL
    - id: C3
      description: Foundation only - no component refactoring in this phase
      type: SCOPE
  decisions:
    - id: D1
      decision: Use Tailwind CSS over CSS Modules
      rationale:
        Better responsive utilities, consistent spacing/colors, rapid
        development for subsequent phases
    - id: D2
      decision: Mobile-first breakpoints matching Tailwind defaults
      rationale:
        Industry standard, well-documented, aligns with
        mobile-responsive-plan.md

# CRITICAL REQUIREMENTS - Must verify during implementation
critical_requirements:
  type: config
  ui_changes: none
---

# Feature Specification: Mobile Responsive Phase 1 - Foundation Setup

**Feature Branch**: `001-mobile-responsive-phase` **Created**: 2026-01-28
**Status**: Draft **Input**: User description: "Install and configure Tailwind
CSS, verify viewport meta tag, create design tokens/CSS variables for the wine
cellar theme colors, and set up responsive utility hooks (useMediaQuery).
Foundation phase before component updates."

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a developer working on the Wine Cellar application, I need a responsive
styling foundation so that I can efficiently implement mobile-friendly layouts
in subsequent phases without changing the current desktop appearance.

### Acceptance Scenarios

1. **Given** Tailwind CSS is installed, **When** I run `npm run dev` in
   apps/web, **Then** the application builds successfully with no errors
2. **Given** Tailwind CSS is configured, **When** I add a Tailwind utility class
   to a component, **Then** the style is applied correctly
3. **Given** design tokens are defined, **When** I use `bg-wine-dark` or similar
   custom classes, **Then** the correct color (#3d010b) is applied
4. **Given** the viewport meta tag is present, **When** I view the app on a
   mobile device, **Then** the page renders at device width without requiring
   zoom
5. **Given** useMediaQuery hook exists, **When** I call
   `useMediaQuery('(max-width: 767px)')`, **Then** it returns true on mobile
   viewports and false on desktop

### Edge Cases

- What happens when Tailwind purges unused styles? Custom design tokens must
  remain available regardless of usage.
- How does the build handle both inline styles (existing) and Tailwind classes
  (new) coexisting? Both must work simultaneously.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST have Tailwind CSS installed and configured in apps/web
- **FR-002**: System MUST include viewport meta tag
  `<meta name="viewport" content="width=device-width, initial-scale=1" />` in
  the root layout
- **FR-003**: System MUST define custom color design tokens matching existing
  theme:
  - `wine-dark`: #3d010b (deep burgundy - headers, buttons)
  - `wine-burgundy`: #7C2D3C (accent color - selected states)
  - `wine-background`: #221a13 (component backgrounds)
  - `wine-surface`: #282f20 (body background)
  - `wine-header`: #09040a (header background)
  - `wine-input`: #443326 (input field backgrounds)
  - `wine-hover`: #5a0210 (hover states)
- **FR-004**: System MUST provide a `useMediaQuery` hook that returns boolean
  for responsive breakpoint detection
- **FR-005**: System MUST configure Tailwind content paths to scan all TSX files
  in apps/web
- **FR-006**: System MUST NOT alter the current visual appearance of any
  component (zero visual regression)
- **FR-007**: System MUST define standard responsive breakpoints (sm: 640px, md:
  768px, lg: 1024px, xl: 1280px, 2xl: 1536px)

### Key Entities

- **Design Tokens**: Color values extracted from existing inline styles,
  centralized in Tailwind config
- **Breakpoints**: Standard Tailwind breakpoints for responsive behavior
- **useMediaQuery Hook**: React hook for JavaScript-based responsive logic

### Test Strategy _(mandatory)_

**Test Type Classification**:

| FR     | Primary Test Type | Reason                                               |
| ------ | ----------------- | ---------------------------------------------------- |
| FR-001 | Integration       | Build must complete successfully                     |
| FR-002 | Unit              | Can verify meta tag presence in layout               |
| FR-003 | Unit              | Can verify Tailwind config exports correct values    |
| FR-004 | Unit              | Hook behavior can be tested with mocked matchMedia   |
| FR-005 | Integration       | Build must process TSX files                         |
| FR-006 | Manual            | Visual verification - no automated visual regression |
| FR-007 | Unit              | Can verify Tailwind config breakpoints               |

**This Feature**:

- Feature type: [X] Config/Infrastructure [ ] Frontend-heavy [ ] Mixed
- Unit: 60% | Integration: 30% | Manual: 10%

**Estimated Test Count**: 6-8 tests

- useMediaQuery hook tests (3-4 tests: initial state, updates on resize,
  cleanup, SSR safety)
- Tailwind config validation (2-3 tests: colors exist, breakpoints defined)
- Build integration verification (1 test)

### Error Handling & Recovery _(mandatory if feature can fail)_

| Error Scenario          | Type      | User Message           | Recovery Action                         |
| ----------------------- | --------- | ---------------------- | --------------------------------------- |
| Tailwind build fails    | Permanent | Build error in console | Fix config, re-run build                |
| PostCSS config missing  | Permanent | Module not found error | Install postcss, autoprefixer           |
| Content paths incorrect | Permanent | Styles not applied     | Update tailwind.config.js content array |

**Resumability**: N/A - configuration changes are atomic

### UI/Design Reference

**Feature Classification**:

- [x] **Backend-only** (no UI changes) - Skip design sections

This phase establishes infrastructure only. Visual changes occur in Phase 2+.

---

## Implementation Notes

### Files to Create/Modify

1. `apps/web/tailwind.config.js` - New Tailwind configuration
2. `apps/web/postcss.config.js` - PostCSS configuration for Tailwind
3. `apps/web/src/app/globals.css` - Tailwind directives (@tailwind base,
   components, utilities)
4. `apps/web/src/app/layout.tsx` - Import globals.css, add viewport meta
5. `apps/web/src/hooks/useMediaQuery.ts` - New responsive hook
6. `apps/web/src/hooks/useMediaQuery.test.ts` - Hook tests

### Reference Document

Full mobile responsive plan:
[documents/mobile-responsive-plan.md](../../documents/mobile-responsive-plan.md)

---

## Review Checklist (Gate)

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Test strategy defined
- [x] Error handling defined (if can fail)
- [x] UI complexity classified (if has UI)

---
