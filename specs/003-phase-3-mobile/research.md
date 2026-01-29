# Phase 0 Research: Phase 3 Mobile Responsive Components

**Date**: 2026-01-28 **Spec**: [spec.md](./spec.md)

## Technical Context Resolution

| Item              | Finding                                              | Source                                |
| ----------------- | ---------------------------------------------------- | ------------------------------------- |
| useMediaQuery     | Already implemented with `useSyncExternalStore`      | `apps/web/src/hooks/useMediaQuery.ts` |
| Tailwind CSS      | Configured with wine-\* color tokens                 | `apps/web/tailwind.config.js`         |
| @headlessui/react | NOT installed - needs to be added                    | `apps/web/package.json`               |
| Testing           | Vitest + RTL, matchMedia mocking pattern established | `responsive-layout.test.tsx`          |
| Breakpoint        | 768px for mobile/desktop switching                   | Spec decision D1                      |

## Existing Pattern Analysis

### Component Patterns (from Phase 2 components)

| Pattern                        | Example                                             | Apply To                     |
| ------------------------------ | --------------------------------------------------- | ---------------------------- |
| 44px touch targets             | MobileFilterToggle uses `width: 44px, height: 44px` | All buttons, form inputs     |
| Tailwind + inline style hybrid | MobileFilterToggle uses both                        | WineCard, MobileSortSelector |
| aria-label for accessibility   | All Phase 2 components                              | New components               |
| SSR-safe useMediaQuery         | useSyncExternalStore with getServerSnapshot         | WineTable responsive switch  |

### Datalist Fields to Replace (5 total)

| Field           | Line in WineDetailModal | Options Source          |
| --------------- | ----------------------- | ----------------------- |
| Producer        | 1362                    | `producerOptions`       |
| Country         | 1404                    | `countryOptions`        |
| Region          | 1448                    | `regionOptions`         |
| Grape Variety   | 1492                    | `grapeVarietyOptions`   |
| Where Purchased | 1831                    | `wherePurchasedOptions` |

## Dependencies Analysis

### @headlessui/react

**Decision**: Use @headlessui/react for Combobox **Rationale**:

- Same company as Tailwind CSS (Tailwind Labs)
- Designed to work with Tailwind utility classes
- Fully accessible out of the box (ARIA compliant)
- Supports keyboard navigation (arrows, enter, escape)
- Supports free text entry with filtering

**Installation**: `npm install @headlessui/react --workspace=@wine-cellar/web`

### Version Compatibility

| Package | Current | Compatible                             |
| ------- | ------- | -------------------------------------- |
| React   | 18.3.1  | @headlessui/react requires React 18+ ✓ |
| Next.js | 15.5.9  | Fully compatible ✓                     |

## Testing Strategy

### Test Distribution (from spec)

- Feature type: Frontend-heavy
- Unit: 40% | Integration: 50% | E2E: 10%
- Estimated tests: 38-48

### Mocking Strategy

| Dependency                 | Mock Approach                                    |
| -------------------------- | ------------------------------------------------ |
| useMediaQuery              | Mock `window.matchMedia` to simulate breakpoints |
| @headlessui/react Combobox | No mock needed - test actual behavior            |
| Wine API                   | Mock fetch for options loading                   |

### Test Categories

| Category                    | Test Count | Focus                                              |
| --------------------------- | ---------- | -------------------------------------------------- |
| WineCard Unit               | 8-10       | Rendering, favorite toggle, click handlers         |
| Combobox Unit               | 10-12      | Keyboard nav, filtering, free text, focus behavior |
| MobileSortSelector Unit     | 4-6        | Dropdown, direction toggle                         |
| WineTable Integration       | 6-8        | Responsive switching, card/table rendering         |
| WineDetailModal Integration | 8-10       | Mobile layout, combobox integration                |
| Responsive Integration      | 4-6        | Breakpoint transitions                             |

### Risk Assessment

| Risk                       | Mitigation                                        |
| -------------------------- | ------------------------------------------------- |
| Combobox focus behavior UX | Start with show-all-on-focus, iterate if too long |
| Modal layout complexity    | Single-column mobile layout is straightforward    |
| Touch target verification  | Use computed styles in tests                      |

## Architecture Decisions

### D1: WineCard within WineTable

Rather than a separate view, WineTable will conditionally render:

- `<table>` on desktop (>= 768px)
- `<WineCard>[]` on mobile (< 768px)

This keeps sorting logic in one place and simplifies state management.

### D2: Reusable Combobox Component

Create `apps/web/src/components/Combobox.tsx` that wraps @headlessui/react:

- Props: `options`, `value`, `onChange`, `placeholder`, `label`, `error`
- Handles filtering, keyboard nav, free text internally
- Used by WineDetailModal for all 5 autocomplete fields

### D3: MobileSortSelector Component

New component `apps/web/src/components/MobileSortSelector.tsx`:

- Props: `sortBy`, `sortDirection`, `onSort`, `sortOptions`
- Renders dropdown + direction toggle button
- Same sort options as desktop table columns
