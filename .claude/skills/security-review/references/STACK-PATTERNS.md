---
parent: code-review-compliance
name: STACK-PATTERNS
---

# Stack Patterns - Wine Cellar

Anti-patterns and fixes for Express/Prisma/Next.js stack.

## Express API

### Route Handler

**Bad:**

```typescript
// Missing asyncHandler
router.get('/items', async (req, res) => {
  const items = await ItemService.list();
  res.json(items); // Wrong format too
});
```

**Good:**

```typescript
router.get(
  '/items',
  asyncHandler(async (req: Request, res: Response) => {
    const items = await ItemService.list();
    res.json(createSuccessResponse(items));
  })
);
```

### Input Validation

**Bad:**

```typescript
router.post(
  '/items',
  asyncHandler(async (req, res) => {
    const item = await ItemService.create(req.body); // Trust user input
  })
);
```

**Good:**

```typescript
router.post(
  '/items',
  asyncHandler(async (req, res) => {
    const { title, type } = req.body;
    if (!title || typeof title !== 'string') {
      res
        .status(400)
        .json(
          createErrorResponse(
            APIErrorCode.VALIDATION_ERROR,
            'Title is required'
          )
        );
      return;
    }
    const item = await ItemService.create({ title, type });
    res.status(201).json(createSuccessResponse(item));
  })
);
```

---

## Prisma Database

### N+1 Query

**Bad:**

```typescript
const items = await prisma.item.findMany();
for (const item of items) {
  const related = await prisma.related.findFirst({
    where: { itemId: item.id },
  });
}
```

**Good:**

```typescript
const items = await prisma.item.findMany({
  include: { related: true },
});
```

### Select Fields

**Bad:**

```typescript
const users = await prisma.user.findMany(); // All columns
```

**Good:**

```typescript
const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true },
});
```

### Transactions

**Bad:**

```typescript
await prisma.item.create({ data });
await prisma.related.createMany({ data: relatedData });
// Partial failure risk
```

**Good:**

```typescript
await prisma.$transaction(async (tx) => {
  const item = await tx.item.create({ data });
  await tx.related.createMany({
    data: relatedData.map((r) => ({ ...r, itemId: item.id })),
  });
  return item;
});
```

### Pagination

**Good:**

```typescript
const page = parseInt(req.query.page as string) || 1;
const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

const [items, total] = await Promise.all([
  prisma.item.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  }),
  prisma.item.count(),
]);
```

---

## Next.js Frontend

### Server vs Client Components

**Bad:**

```typescript
'use client'; // Unnecessary

export default function StaticPage() {
  return <div>Static content</div>;
}
```

**Good:**

```typescript
// Server component (default)
export default function StaticPage() {
  return <div>Static content</div>;
}

// Client only when needed
'use client';
import { useState } from 'react';

export function InteractiveComponent() {
  const [state, setState] = useState(0);
  return <button onClick={() => setState(s => s + 1)}>{state}</button>;
}
```

### Portal Boundaries

**Bad:**

```typescript
// In components/app/Dashboard.tsx
import { AdminNav } from '../admin/AdminNav'; // CROSS-PORTAL!
```

**Good:**

```typescript
// In components/app/Dashboard.tsx
import { AppNav } from './AppNav'; // Same portal
import { Button } from '@/components/ui'; // Shared OK
```

### Feature Access

**Bad:**

```typescript
if (user?.role !== 'ADMIN') return null; // Hardcoded
```

**Good:**

```typescript
const { hasAccess } = useFeatureAccess('feature_key');
if (!hasAccess) return null;
```

---

## Color Tokens (Quick Reference)

| Token       | Use                  |
| ----------- | -------------------- |
| primary-300 | CTAs, buttons, links |
| primary-400 | Hover states         |
| primary-500 | Headers, navigation  |
| neutral-50  | Page backgrounds     |
| neutral-700 | Text primary         |
| success     | Success states       |
| warning     | Warning states       |
| danger      | Error states         |

---

## Detection Commands

```bash
# Missing asyncHandler
grep -rn "router\.\(get\|post\)" apps/api/src/routes/v*/ --include="*.ts" | grep -v "asyncHandler"

# N+1 queries
grep -rn "for.*await.*prisma\." apps/api/src/ --include="*.ts"

# Unnecessary 'use client'
grep -l "'use client'" apps/web/src/ -r --include="*.tsx" | xargs grep -L "useState\|useEffect\|onClick"

# Prisma in routes (should be in services)
grep -rn "prisma\." apps/api/src/routes/ --include="*.ts" | grep -v "import"

# Hardcoded secrets
grep -rn "password\s*[:=]\s*['\"]" apps/ --include="*.ts" | grep -v "\.test\.\|interface\|type"
```
