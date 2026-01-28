# Research: Mobile Layout Restructuring (Phase 2)

**Date**: 2025-01-28 **Spec**: 002-phase-2-layout

## Technical Context Resolution

| Context Item         | Finding                                          |
| -------------------- | ------------------------------------------------ |
| Language/Version     | TypeScript 5.x, React 18, Next.js 15             |
| Primary Dependencies | React, Next.js, Tailwind CSS (installed Phase 1) |
| Storage              | N/A - UI state only (no persistence)             |
| Testing              | Vitest + React Testing Library                   |
| Target Platform      | Web (all viewports: mobile, tablet, desktop)     |
| Project Type         | Monorepo (apps/web for frontend)                 |

## Codebase Analysis

### Current Architecture

**Layout Structure** (`apps/web/src/app/page.tsx`):

- Fixed 25%/75% flex layout via inline styles
- `flex: '0 0 25%'` for filter sidebar
- `flex: '1'` for wine table content
- No responsive breakpoints implemented

**Styling Approach**:

- 100% inline styles (`style={{...}}`)
- Tailwind CSS installed but NOT used for components
- Custom `wine` color palette in Tailwind config
- Focus/accessibility styles via inline `<style>` tags

**Component Architecture**:

- Fully controlled components with props
- State managed in parent (`page.tsx`)
- WineFilters: 23 props for filter state/handlers
- WineTable: Controlled with keyboard navigation
- WineDetailModal: View/edit/add modes

### Existing Responsive Infrastructure

**useMediaQuery Hook** (`apps/web/src/hooks/useMediaQuery.ts`):

```typescript
// Already implemented and tested in Phase 1
const isMobile = useMediaQuery('(max-width: 767px)');
```

- SSR-safe (initializes to false)
- Uses window.matchMedia() API
- Comprehensive tests exist

**Tailwind Breakpoints Available**:

- sm: 640px
- md: 768px
- lg: 1024px (our target breakpoint per spec)
- xl: 1280px
- 2xl: 1536px

### Decision: Styling Approach

**Options Considered**:

1. Convert to Tailwind utility classes
2. Keep inline styles + conditional logic via useMediaQuery
3. Hybrid: Tailwind for new components, inline for existing

**Decision**: Option 3 (Hybrid)

- New components (FilterDrawer, Backdrop, MobileFilterToggle) use Tailwind
  classes
- Existing components get minimal changes via conditional inline styles
- Gradual migration path, avoids large refactoring scope

**Rationale**:

- Spec constraint C2 says "Must use Tailwind CSS classes"
- But full conversion of existing components would expand scope
- New mobile-specific components are ideal candidates for Tailwind
- Keeps Phase 2 focused on layout restructuring

## Testing Strategy

### Feature Classification

- **Type**: Frontend-heavy (UI layout changes only)
- **External APIs**: None
- **Risk Level**: LOW (no data changes, no API changes)

### Test Distribution

| Test Type   | Count | Percentage |
| ----------- | ----- | ---------- |
| Unit        | 3-4   | 25%        |
| Integration | 8-10  | 65%        |
| E2E         | 1-2   | 10%        |

### Test Categories

**Unit Tests** (new components):

- FilterDrawer: Renders with correct width, animates
- MobileFilterToggle: Renders icon, click handler works
- Backdrop: Renders, click handler works

**Integration Tests** (responsive behavior):

- Mobile layout: full-width content, filter button visible
- Desktop layout: 25%/75% sidebar preserved
- Drawer open/close: filter state preserved
- Backdrop dismissal: closes drawer
- Touch targets: minimum 44x44px
- Scroll behavior: drawer scrollable when content overflows

**E2E Tests** (optional):

- Full mobile flow: open drawer → apply filter → close → verify results

### Mocking Strategy

- Mock `window.matchMedia` for viewport simulation
- Use `@testing-library/react` resize utilities
- No API mocks needed (frontend-only changes)

### Test File Locations

```
apps/web/src/__tests__/
├── components/
│   ├── FilterDrawer.test.tsx      # NEW
│   ├── MobileFilterToggle.test.tsx # NEW
│   └── Backdrop.test.tsx          # NEW
└── integration/
    └── responsive-layout.test.tsx  # NEW
```

## Dependencies

### No New Dependencies Required

- Tailwind CSS already installed (Phase 1)
- useMediaQuery hook already exists
- React transition/animation via CSS (no library needed)

### Considered but Rejected

- **Headless UI**: Not needed for simple drawer/backdrop
- **Framer Motion**: CSS transitions sufficient for 300ms animation
- **React Portal**: Not needed, drawer is overlay within same DOM tree

## Risk Assessment

| Risk                | Likelihood | Impact | Mitigation                               |
| ------------------- | ---------- | ------ | ---------------------------------------- |
| Desktop regression  | LOW        | HIGH   | Integration tests for desktop layout     |
| Filter state loss   | LOW        | MEDIUM | Test state preservation on drawer toggle |
| Animation jank      | LOW        | LOW    | Use CSS transitions, not JS animation    |
| Touch target issues | MEDIUM     | LOW    | Manual testing + unit tests              |

## Recommendations

1. **Create new components** for mobile-specific UI (FilterDrawer, Backdrop,
   MobileFilterToggle)
2. **Minimize changes** to existing WineFilters component (wrap in drawer, don't
   restructure)
3. **Add close button** to WineFilters header for mobile (small modification)
4. **Use CSS transitions** for 300ms slide animation
5. **Test desktop regression** as primary risk mitigation
