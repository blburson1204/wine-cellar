# Wine Cellar Pattern Registry

Established patterns in the Wine Cellar codebase. Check here before implementing
new features to reuse existing approaches and maintain consistency.

Last updated: 2026-03-28

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

## 6. MCP Server Architecture

**Location:** `packages/{jira-mcp,slack-mcp}/` **Used by:** Claude Code via
`.mcp.json` configuration

MCP (Model Context Protocol) servers provide tool-based integration with
external services. Each server is a standalone TypeScript package in `packages/`
that exposes tools via the `@modelcontextprotocol/sdk`. Servers run as stdio
processes, spawned by the MCP runtime when tools are invoked.

**Package structure (follow for new MCP servers):**

```
packages/{name}-mcp/
├── src/
│   ├── index.ts       # Server setup + tool registration
│   ├── config.ts      # Zod-validated env var loading
│   ├── types.ts       # Shared TypeScript types
│   └── ...            # Domain-specific modules
├── __tests__/
│   ├── unit/          # Config, formatters, helpers
│   └── integration/   # MCP tool handlers, client behavior
├── package.json       # @modelcontextprotocol/sdk + zod
├── tsconfig.json      # ES2022, Node16, strict
└── vitest.config.ts   # 80% coverage thresholds
```

**Key patterns:**

- **Config via Zod**: Env vars validated at startup with clear error messages
- **Tool registration**: `server.tool(name, description, zodSchema, handler)`
- **Fire-and-forget** (slack-mcp): Failures logged but never block the caller
- **Stateful sync** (jira-mcp): Persistent `jira-sync.json` tracks mappings
- **Registration**: Add server entry to `.mcp.json` with env vars

**When to use:** Any new external service integration that Claude Code should
interact with via tools (e.g., GitHub, Linear, PagerDuty).

---

## Adding New Patterns

When a new pattern emerges (used in 3+ places), add it here:

1. Give it a short name and location
2. Describe what it does and when to use it
3. Reference existing examples in the codebase
