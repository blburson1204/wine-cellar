# Wine Cellar Pattern Registry

Established patterns in the Wine Cellar codebase. Check here before implementing
new features to reuse existing approaches and maintain consistency.

Last updated: 2026-03-04

---

## 1. Zod Schema Validation

**Location:** `apps/api/src/schemas/` **Used by:** All API route handlers

All API request validation uses Zod schemas. Each resource has a schema file
exporting create/update schemas. Route handlers validate with
`schema.parse(req.body)` — invalid input throws ZodError, caught by the error
middleware.

```
apps/api/src/schemas/
  wine.schema.ts      # createWineSchema, updateWineSchema
  ...
```

**When to use:** Every new API endpoint that accepts request bodies.

---

## 2. AppError Classes

**Location:** `apps/api/src/errors/` **Used by:** Route handlers, middleware,
services

Typed error classes extending a base AppError. Each error type has a status code
and error code. The global error handler maps these to consistent API responses.

**When to use:** Any API error that needs a specific HTTP status or
machine-readable error code. Never throw raw `Error` — use or create an AppError
subclass.

---

## 3. Winston Logger with Request ID

**Location:** `apps/api/src/` (logger setup + request ID middleware) **Used
by:** All API code

Winston logger instance with request ID tracking. Middleware assigns a unique
request ID to each incoming request. Log calls include the request ID for
traceability across the request lifecycle.

**When to use:** All server-side logging. Never use `console.log` in API code.

---

## 4. Optimistic Updates

**Location:** `apps/web/src/` (React components and hooks) **Used by:** UI
mutations (create, update, delete wine entries)

UI updates immediately on user action, then reconciles with the server response.
On failure, the UI reverts to the previous state. Provides responsive feel
without waiting for network round-trips.

**When to use:** Any UI mutation where the expected server response is
predictable (create, update, delete operations on user-owned resources).

---

## 5. Prisma via packages/database

**Location:** `packages/database/` **Used by:** `apps/api/` (imports Prisma
client from the package)

Prisma schema and generated client live in a shared package. The API app imports
`@wine-cellar/database` — it never accesses Prisma directly. Schema changes go
through `packages/database/prisma/schema.prisma` and are applied via
`npm run db:push` or `npm run db:generate`.

**When to use:** All database access. Never import Prisma directly in `apps/` —
always go through the shared package.

---

## Adding New Patterns

When a new pattern emerges (used in 3+ places), add it here:

1. Give it a short name and location
2. Describe what it does and when to use it
3. Reference existing examples in the codebase
