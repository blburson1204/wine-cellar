---
parent: arch
name: FRONTEND-ARCHITECTURE
---

# Frontend Architecture

Guidance for Next.js 15 frontend: state management, performance with large
datasets, RBAC, feature flags, and security.

## Current Architecture

```
apps/web/
├── src/
│   ├── app/
│   │   ├── (admin)/    # SUPER_ADMIN, ADMIN only
│   │   ├── (app)/      # Any authenticated user
│   │   └── (public)/   # Everyone
│   ├── components/
│   │   ├── admin/      # Admin-specific components
│   │   ├── app/        # App portal components
│   │   └── ui/         # Design system wrappers
│   └── lib/
│       ├── auth-helpers.ts
│       ├── portal-routing.ts
│       └── feature-toggles.ts
```

## State Management

### Decision Tree

```
Need to share state?
├── No → Local state (useState)
├── Between siblings → Lift state to parent
├── Across routes → URL state (searchParams)
├── Server data → Server Components + fetch
└── Complex client state → Context (avoid Redux complexity)
```

### Pattern: Server Components First

**Next.js 15 default: Render on server, hydrate minimally.**

```typescript
// GOOD: Server Component (default)
// app/(app)/records/page.tsx
export default async function RecordsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const records = await fetchRecords(searchParams);

  return (
    <RecordList
      data={records}
      search={searchParams.search}
    />
  );
}
```

```typescript
// GOOD: Client island for interactivity
'use client';

export function RecordFilters({
  initial,
  onFilter,
}: {
  initial: FilterState;
  onFilter: (filters: FilterState) => void;
}) {
  // Only this component hydrates
  const [filters, setFilters] = useState(initial);
  // ...
}
```

### Pattern: URL as State

**For filters, pagination, and shareable state.**

```typescript
// Use nuqs or native searchParams
import { useQueryState } from 'nuqs';

function RecordSearch() {
  const [search, setSearch] = useQueryState('search');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  // State is in URL, shareable, survives refresh
}
```

**Benefits:**

- Shareable links
- Browser back/forward works
- No client-side state to manage
- Server can read on initial render

### Pattern: React Context for Global Client State

**Use sparingly. Most state should be server or URL.**

```typescript
// Good use: Current user session
'use client';

const UserContext = createContext<User | null>(null);

export function UserProvider({ children, user }: { children: ReactNode; user: User }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

// In layout.tsx
export default async function AppLayout({ children }) {
  const user = await getCurrentUser();
  return <UserProvider user={user}>{children}</UserProvider>;
}
```

**Avoid:**

- Using Context for server data (use Server Components)
- Deep nesting of multiple contexts
- Putting frequently-changing data in Context (causes re-renders)

## Large Dataset Performance

### Problem: Application handles large datasets

### Solution 1: Pagination (Preferred)

```typescript
// Server component with cursor pagination
async function RecordsPage({ searchParams }) {
  const { cursor, limit = 50 } = searchParams;

  const data = await prisma.record.findMany({
    take: limit + 1, // Fetch one extra to detect "has more"
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  const hasMore = data.length > limit;
  const records = hasMore ? data.slice(0, -1) : data;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return (
    <>
      <RecordTable data={records} />
      {nextCursor && <LoadMoreButton cursor={nextCursor} />}
    </>
  );
}
```

### Solution 2: Virtual Scrolling (For Tables)

**Only render visible rows.**

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualRecordTable({ records }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: records.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // Row height
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <RecordRow
            key={virtualRow.key}
            record={records[virtualRow.index]}
            style={{ transform: `translateY(${virtualRow.start}px)` }}
          />
        ))}
      </div>
    </div>
  );
}
```

### Solution 3: Progressive Loading

**Load summary first, details on demand.**

```typescript
// First: Fast summary query
const summaries = await prisma.record.findMany({
  select: { id: true, title: true, createdAt: true },
  take: 100,
});

// On row expansion: Fetch full details
async function loadDetails(id: string) {
  return fetch(`/api/v1/records/${id}`);
}
```

### Performance Checklist

- [ ] Paginate all list endpoints (default: 50 items)
- [ ] Use `select` in Prisma to fetch only needed fields
- [ ] Avoid fetching related data until needed
- [ ] Use virtual scrolling for tables > 100 rows
- [ ] Debounce search inputs (300ms)
- [ ] Show loading states, not spinners

## RBAC + Feature Flags

### Two-Layer Access Control

From Constitution Principle XI:

1. **Portal Access (Middleware)** - Can you enter `/admin/*`?
2. **Feature Access (Feature Toggles)** - Can you use this capability?

### Portal Access Pattern

```typescript
// middleware.ts handles this automatically
// User with ADMIN role → /admin/* allowed
// User with USER role → /admin/* redirected to /app/dashboard
```

### Feature Toggle Pattern

```typescript
// lib/feature-toggles.ts
import { useSession } from 'next-auth/react';

export function useFeatureAccess(featureKey: string): boolean {
  const { data: session } = useSession();
  const userRoles = session?.user?.roles || [];

  // Check if any of user's roles has access to this feature
  // (This would typically query the feature_toggle table)
  return checkFeatureAccess(featureKey, userRoles);
}
```

```typescript
// Usage in component
function DashboardPage() {
  const hasAdvancedAnalytics = useFeatureAccess('advanced_analytics');

  return (
    <div>
      <BasicStats />
      {hasAdvancedAnalytics && <AdvancedAnalytics />}
    </div>
  );
}
```

### Server-Side Feature Checks

```typescript
// In Server Component
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ProtectedFeature() {
  const session = await getServerSession(authOptions);

  if (!await hasFeatureAccess('feature_key', session?.user?.roles)) {
    return null; // Or redirect
  }

  return <FeatureContent />;
}
```

### Feature Flag Architecture

```
Database (source of truth)
     ↓
API endpoint (/api/v1/features)
     ↓
Client-side hook (useFeatureAccess)
     ↓
Component visibility
```

**Caching strategy:**

- Cache feature definitions for 5 minutes
- Invalidate on admin changes
- User sees changes on next page load

## Security Patterns

### Input Validation

**Validate at the boundary, trust inside.**

```typescript
// At API boundary - use Zod
import { z } from 'zod';

const recordSearchSchema = z.object({
  query: z.string().max(500).optional(),
  createdAfter: z.string().datetime().optional(),
  categoryCode: z
    .string()
    .regex(/^[A-Z0-9]{2,10}$/)
    .optional(),
});

export async function GET(request: Request) {
  const params = recordSearchSchema.parse(
    Object.fromEntries(new URL(request.url).searchParams)
  );
  // params is now typed and validated
}
```

### XSS Prevention

```typescript
// GOOD: React escapes by default
<p>{userInput}</p>

// CAREFUL: dangerouslySetInnerHTML requires sanitization
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(htmlContent)
}} />

// BAD: Never do this
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### CSRF Protection

**Next.js 15 handles this for Server Actions.**

```typescript
// Server Action - CSRF protected automatically
'use server';

export async function createRecord(formData: FormData) {
  // Origin check happens automatically
}
```

### Authentication Boundaries

```typescript
// layout.tsx for protected routes
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

export default async function AppLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <>{children}</>;
}
```

### Sensitive Data Handling

```typescript
// Never send to client
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
    // password: true, // NEVER
  },
});

// API responses should strip sensitive fields
function sanitizeUser(user: User) {
  const { password, ...safe } = user;
  return safe;
}
```

## Anti-Patterns to Avoid

### Don't: Redux for Server Data

```typescript
// BAD: Redux for API data
dispatch(fetchRecords());
const records = useSelector(selectRecords);

// GOOD: Server Component
const records = await fetchRecords();
```

### Don't: Client-Side Data Fetching in Components

```typescript
// BAD: useEffect + fetch
useEffect(() => {
  fetch('/api/records').then(setData);
}, []);

// GOOD: Server Component or React Query with prefetch
```

### Don't: Prop Drilling Through Many Layers

```typescript
// BAD: Props through 5 components
<A user={user}><B user={user}><C user={user}>...

// GOOD: Context at appropriate level
<UserProvider user={user}>
  <A /><B /><C />
</UserProvider>
```

### Don't: Feature Flags in UI Only

```typescript
// BAD: Only hide button, API still works
{hasAccess && <DeleteButton onClick={() => deleteItem(id)} />}

// GOOD: Check on server too
// API route
if (!await hasFeatureAccess('delete_items', user.roles)) {
  return new Response('Forbidden', { status: 403 });
}
```

## When to Reconsider

**Stick with current patterns until:**

- Page load > 3 seconds (optimize queries first)
- Bundle size > 500KB (analyze and split)
- State management bugs are frequent (document patterns better)
- Feature flag checks are slow (add caching)
