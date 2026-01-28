# Research: Mobile Responsive Phase 1 - Foundation Setup

**Date**: 2026-01-28 **Spec**: [spec.md](./spec.md)

## Technical Context Resolution

### Tailwind CSS in Next.js 15

**Decision**: Use Tailwind CSS v3.4+ with Next.js 15 App Router

**Rationale**:

- Next.js 15 has built-in PostCSS support
- Tailwind v3.4 is the latest stable version with full Next.js compatibility
- Standard installation: `tailwindcss`, `postcss`, `autoprefixer`

**Alternatives Considered**:

- CSS Modules: Less rapid development for responsive utilities
- styled-jsx: Already a dependency but lacks responsive utilities
- Emotion/styled-components: Runtime overhead, additional complexity

### Next.js 15 App Router CSS Considerations

**Finding**: Next.js 15 App Router requires CSS imports in `layout.tsx` or
`page.tsx` files, not in `_app.tsx` (Pages Router pattern).

**Approach**:

1. Create `src/app/globals.css` with Tailwind directives
2. Import in `src/app/layout.tsx`
3. Tailwind classes will work in all components

### Viewport Meta Tag

**Finding**: Next.js 15 automatically includes viewport meta via `metadata`
export. However, explicit declaration is best practice.

**Approach**: Add to `metadata` export in `layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: 'Wine Cellar',
  description: 'Manage your wine collection',
  viewport: 'width=device-width, initial-scale=1',
};
```

**Note**: Next.js 15 may also auto-generate viewport, but explicit is safer.

### useMediaQuery Hook - SSR Considerations

**Finding**: Next.js App Router uses React Server Components by default. The
`useMediaQuery` hook must:

1. Be marked as `'use client'` component
2. Handle SSR gracefully (window undefined on server)
3. Use `useEffect` for client-side initialization

**Pattern**:

```typescript
'use client';
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
```

## Testing Strategy

### Test Type Classification

| FR     | Test Type   | Rationale                                        |
| ------ | ----------- | ------------------------------------------------ |
| FR-001 | Integration | Verify build completes with Tailwind             |
| FR-002 | Unit        | Verify metadata export contains viewport         |
| FR-003 | Unit        | Verify tailwind.config.js exports correct colors |
| FR-004 | Unit        | Test useMediaQuery with mocked matchMedia        |
| FR-005 | Integration | Build processes TSX files                        |
| FR-006 | Manual      | Visual regression (no automated tooling)         |
| FR-007 | Unit        | Verify breakpoint values in config               |

### Testing Summary

```
Feature type: Config/Infrastructure
Quota risks: None
Estimated tests: 6-8
Distribution: Unit 70%, Integration 20%, Manual 10%
```

### Mock Strategy

| Dependency        | Mock Approach                            |
| ----------------- | ---------------------------------------- |
| window.matchMedia | jsdom mock in vitest.setup.ts            |
| Build process     | Actual build command in integration test |

### Test Files to Create

1. `src/hooks/useMediaQuery.test.ts` - Hook unit tests
2. `tailwind.config.test.js` - Config validation (optional)

## Risk Assessment

| Risk                                  | Likelihood | Impact | Mitigation                     |
| ------------------------------------- | ---------- | ------ | ------------------------------ |
| Tailwind conflicts with inline styles | Low        | Low    | CSS specificity favors inline  |
| Build time increase                   | Medium     | Low    | Acceptable for benefits gained |
| SSR hydration mismatch                | Medium     | Medium | Proper useEffect pattern       |

## Dependencies to Install

```bash
npm install -D tailwindcss postcss autoprefixer --workspace=apps/web
```

## Files to Create/Modify

| File                                     | Action | Purpose                                   |
| ---------------------------------------- | ------ | ----------------------------------------- |
| apps/web/tailwind.config.js              | Create | Tailwind configuration with design tokens |
| apps/web/postcss.config.js               | Create | PostCSS configuration                     |
| apps/web/src/app/globals.css             | Create | Tailwind directives                       |
| apps/web/src/app/layout.tsx              | Modify | Import globals.css, add viewport          |
| apps/web/src/hooks/useMediaQuery.ts      | Create | Responsive hook                           |
| apps/web/src/hooks/useMediaQuery.test.ts | Create | Hook tests                                |
