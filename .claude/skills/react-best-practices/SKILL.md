---
name: react-best-practices
description:
  React and Next.js performance optimization guidelines. Use when writing,
  reviewing, or refactoring React/Next.js code to ensure optimal performance
  patterns. Triggers on tasks involving React components, Next.js pages, data
  fetching, bundle optimization, or performance improvements.
model: sonnet
---

# React Best Practices - Wine Cellar

Performance optimization guide for React 18 and Next.js 15 applications, adapted
from Vercel Engineering guidelines. Prioritized by impact.

## When to Apply

Reference these guidelines when:

- Writing new React components or Next.js pages
- Implementing data fetching (client or server-side)
- Reviewing code for performance issues
- Refactoring existing React/Next.js code
- Optimizing bundle size or load times

## Rule Categories by Priority

| Priority | Category                  | Impact      | Prefix       |
| -------- | ------------------------- | ----------- | ------------ |
| 1        | Eliminating Waterfalls    | CRITICAL    | `async-`     |
| 2        | Bundle Size Optimization  | CRITICAL    | `bundle-`    |
| 3        | Server-Side Performance   | HIGH        | `server-`    |
| 4        | Client-Side Data Fetching | MEDIUM-HIGH | `client-`    |
| 5        | Re-render Optimization    | MEDIUM      | `rerender-`  |
| 6        | Rendering Performance     | MEDIUM      | `rendering-` |
| 7        | JavaScript Performance    | LOW-MEDIUM  | `js-`        |

---

## 1. Eliminating Waterfalls (CRITICAL)

### Defer Await

Move `await` into the branch where actually used. Don't await at the top if only
one branch needs the result.

```typescript
// BAD: Always awaits even if not needed
async function Page() {
  const data = await fetchData();
  if (condition) return <Simple />;
  return <Complex data={data} />;
}

// GOOD: Only await when needed
async function Page() {
  const dataPromise = fetchData();
  if (condition) return <Simple />;
  const data = await dataPromise;
  return <Complex data={data} />;
}
```

### Parallel Fetching

Use `Promise.all()` for independent operations.

```typescript
// BAD: Sequential (waterfall)
const wines = await fetchWines();
const regions = await fetchRegions();

// GOOD: Parallel
const [wines, regions] = await Promise.all([fetchWines(), fetchRegions()]);
```

### Suspense Boundaries

Use Suspense to stream content progressively.

```typescript
<Suspense fallback={<WineListSkeleton />}>
  <WineList />
</Suspense>
```

---

## 2. Bundle Size Optimization (CRITICAL)

### Avoid Barrel Imports

Import directly from the source file, not barrel `index.ts` files.

```typescript
// BAD: Pulls in entire barrel
import { WineCard } from '@/components';

// GOOD: Direct import
import { WineCard } from '@/components/WineCard';
```

### Dynamic Imports

Use `next/dynamic` for heavy components not needed on initial render.

```typescript
import dynamic from 'next/dynamic';

const WineChart = dynamic(() => import('@/components/WineChart'), {
  loading: () => <ChartSkeleton />,
});
```

### Defer Third-Party Scripts

Load analytics/logging after hydration.

```typescript
useEffect(() => {
  import('analytics-lib').then(({ init }) => init());
}, []);
```

---

## 3. Server-Side Performance (HIGH)

### Parallel Server Fetching

Restructure components to parallelize fetches.

```typescript
// BAD: Parent fetches everything sequentially
async function WinePage({ id }) {
  const wine = await fetchWine(id);
  const reviews = await fetchReviews(id);
  return <WineDetail wine={wine} reviews={reviews} />;
}

// GOOD: Parallel fetching
async function WinePage({ id }) {
  const [wine, reviews] = await Promise.all([
    fetchWine(id),
    fetchReviews(id),
  ]);
  return <WineDetail wine={wine} reviews={reviews} />;
}
```

### Minimize Client Serialization

Only pass necessary data to client components.

```typescript
// BAD: Passing entire wine object
<ClientComponent wine={wine} />

// GOOD: Pass only what client needs
<ClientComponent name={wine.name} vintage={wine.vintage} />
```

---

## 4. Client-Side Data Fetching (MEDIUM-HIGH)

### Deduplicate Event Listeners

Don't add multiple listeners for the same event.

```typescript
// GOOD: Single listener with cleanup
useEffect(() => {
  const handler = () => {
    /* ... */
  };
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
```

### Passive Event Listeners

Use passive listeners for scroll/touch events.

```typescript
useEffect(() => {
  const handler = () => {
    /* ... */
  };
  window.addEventListener('scroll', handler, { passive: true });
  return () => window.removeEventListener('scroll', handler);
}, []);
```

---

## 5. Re-render Optimization (MEDIUM)

### Memoize Expensive Components

Extract expensive work into memoized components.

```typescript
const WineList = React.memo(function WineList({ wines }) {
  return wines.map(w => <WineCard key={w.id} wine={w} />);
});
```

### Use Primitive Dependencies

Prefer primitives in effect dependencies to avoid unnecessary re-runs.

```typescript
// BAD: Object reference changes every render
useEffect(() => {
  /* ... */
}, [filter]);

// GOOD: Use primitive values
useEffect(() => {
  /* ... */
}, [filter.color, filter.region]);
```

### Derive State During Render

Don't use effects to compute derived state.

```typescript
// BAD: Effect to derive state
const [filteredWines, setFilteredWines] = useState([]);
useEffect(() => {
  setFilteredWines(wines.filter((w) => w.color === color));
}, [wines, color]);

// GOOD: Derive during render
const filteredWines = useMemo(
  () => wines.filter((w) => w.color === color),
  [wines, color]
);
```

### Lazy State Initialization

Pass function to useState for expensive initial values.

```typescript
// BAD: Runs every render
const [data, setData] = useState(expensiveComputation());

// GOOD: Runs once
const [data, setData] = useState(() => expensiveComputation());
```

### Use startTransition for Non-Urgent Updates

```typescript
import { startTransition } from 'react';

function handleSearch(query: string) {
  setSearchQuery(query); // Urgent: update input
  startTransition(() => {
    setFilteredResults(filterWines(query)); // Non-urgent: filter list
  });
}
```

---

## 6. Rendering Performance (MEDIUM)

### Conditional Rendering

Use ternary, not `&&` for conditionals (avoids rendering `0` or `""`).

```typescript
// BAD: Can render falsy values
{wines.length && <WineList wines={wines} />}

// GOOD: Explicit conditional
{wines.length > 0 ? <WineList wines={wines} /> : null}
```

### Content Visibility for Long Lists

```css
.wine-card {
  content-visibility: auto;
  contain-intrinsic-size: 200px;
}
```

---

## 7. JavaScript Performance (LOW-MEDIUM)

### Use Map/Set for Lookups

O(1) vs O(n) for frequent lookups.

```typescript
// BAD: Array.includes is O(n)
const isSelected = selectedIds.includes(wine.id);

// GOOD: Set.has is O(1)
const selectedSet = new Set(selectedIds);
const isSelected = selectedSet.has(wine.id);
```

### Early Return

Return early from functions to avoid deep nesting.

```typescript
// GOOD
function processWine(wine: Wine) {
  if (!wine.name) return null;
  if (wine.vintage < 1900) return null;
  // Main logic here
}
```

### Build Index Maps for Repeated Lookups

```typescript
// BAD: O(n) lookup every time
wines.forEach((w) => {
  const region = regions.find((r) => r.id === w.regionId);
});

// GOOD: Build map once, O(1) lookups
const regionMap = new Map(regions.map((r) => [r.id, r]));
wines.forEach((w) => {
  const region = regionMap.get(w.regionId);
});
```
