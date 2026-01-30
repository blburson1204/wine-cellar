# Research: Phase 5 Testing & Refinement

**Date**: 2026-01-29 **Spec**: 005-phase-5-testing

---

## 1. vitest-axe for Automated Accessibility Testing

**Decision**: Use `vitest-axe` (npm package, fork of jest-axe)

**Key Facts**:

- Install: `npm install --save-dev vitest-axe`
- Setup: Import matchers in `vitest.setup.ts`, call `expect.extend(matchers)`
- Usage:
  `const results = await axe(container); expect(results).toHaveNoViolations()`
- Requires `jsdom` environment (which we already use — NOT compatible with
  `happy-dom`)
- 242k+ weekly downloads, well-maintained
- TypeScript types via `vitest-axe/extend-expect` import

**Alternatives Considered**:

- `@sa11y/vitest`: Alternative from Salesforce, uses `toBeAccessible()` API.
  Less adoption.
- `axe-core` directly: Lower-level, would need custom matchers. More setup work.

**Rationale**: vitest-axe integrates directly into our existing Vitest + RTL
setup with minimal configuration. Same jsdom environment, familiar expect-based
assertions.

---

## 2. Focus Management Audit

### WineDetailModal — HAS focus management

- **Focus trap**: Yes (lines 223-253 in WineDetailModal.tsx) — Tab/Shift+Tab
  cycles within modal
- **Auto-focus on open**: Yes — name input (edit mode), close button (view mode)
- **Escape to close**: Yes
- **Focus restoration on close**: NOT IMPLEMENTED — focus does not return to
  triggering element

### FilterDrawer — MISSING focus management

- **Focus trap**: NO — Tab key will escape to background content
- **Auto-focus on open**: NO — no auto-focus logic
- **Escape to close**: Yes (keydown handler)
- **Focus restoration on close**: NOT IMPLEMENTED

### Combobox — Managed by Headless UI

- **Keyboard navigation**: Yes (arrow keys, Enter, Escape handled by
  @headlessui/react)
- **Focus on blur**: Custom handler saves typed query
- **Focus styles**: Tailwind ring classes

### Required Fixes

1. **FilterDrawer**: Add focus trap (Tab/Shift+Tab cycling)
2. **FilterDrawer**: Add auto-focus on open (first focusable element)
3. **WineDetailModal**: Add focus restoration on close
4. **FilterDrawer**: Add focus restoration on close

---

## 3. Cross-Viewport Testing Approach

**Current state**: Existing `responsive-layout.test.tsx` mocks `useMediaQuery`
as boolean (true = mobile, false = desktop). Does not test at specific pixel
widths.

**Approach**: Since jsdom cannot compute CSS media queries, viewport-specific
tests will:

1. Mock `useMediaQuery` return values to simulate specific breakpoint behavior
2. Test at 4 viewports by controlling which breakpoints match:
   - **375px (iPhone SE)**: `useMediaQuery('(max-width: 767px)')` → true
   - **393px (iPhone 14 Pro)**: Same as above → true
   - **768px (iPad)**: `useMediaQuery('(max-width: 767px)')` → false (tablet
     gets desktop layout)
   - **1024px (Desktop)**: Same as above → false
3. Verify correct components render at each breakpoint

**Note**: 375px and 393px will produce identical behavior since both fall below
768px breakpoint. The value of testing both is documenting coverage, not
catching different behavior.

---

## 4. Color Contrast

**Approach**: axe-core includes color contrast rules (`color-contrast`) as part
of its WCAG AA ruleset. When running `toHaveNoViolations()`, contrast violations
will be caught automatically IF the DOM has inline styles with color values.

**Limitation**: Tailwind classes are not computed in jsdom. Contrast checking is
limited to:

- Elements with inline `style` attributes containing color/backgroundColor
- axe-core's static analysis of ARIA attributes and semantic HTML

**Practical impact**: Color contrast for Tailwind-styled elements requires
manual browser testing. axe-core will catch issues in inline-styled elements
(which many of our components use for the wine-dark theme).

---

## 5. Bundle Size Analysis

**Build date**: 2026-01-29 **Next.js version**: 15.5.9 **Build status**: Success

### Bundle Size Baseline

| Route         | Page JS | First Load JS |
| ------------- | ------- | ------------- |
| `/` (main)    | 53.7 kB | 156 kB        |
| `/_not-found` | 994 B   | 103 kB        |

### Shared Chunks

| Chunk                  | Size       |
| ---------------------- | ---------- |
| `chunks/255-*.js`      | 45.8 kB    |
| `chunks/4bd1b696-*.js` | 54.2 kB    |
| Other shared chunks    | 1.9 kB     |
| **Total shared**       | **102 kB** |

### Assessment

- **Target**: No page JS > 200 kB gzipped (soft target)
- **Result**: PASS — Main page First Load JS is 156 kB (22% under target)
- All sizes are gzipped (Next.js build output default)

---

## 6. Existing Test Infrastructure Summary

| Aspect             | Status                                                     |
| ------------------ | ---------------------------------------------------------- |
| Test runner        | Vitest + jsdom                                             |
| Component testing  | React Testing Library + user-event                         |
| Responsive mocking | `useMediaQuery` hook mock                                  |
| matchMedia         | Mocked in `vitest.setup.ts`                                |
| ResizeObserver     | Mocked for Headless UI                                     |
| fetch              | Mocked globally with meta endpoint defaults                |
| Coverage           | V8 provider, thresholds: 35% branches, 50% functions/lines |
| Test count         | 466 web + 209 API = 675 total                              |
| Test files         | 27 web test files                                          |
