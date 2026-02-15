---
parent: code-review-compliance
name: REVIEW-CHECKLIST
---

# Code Review Checklist - Wine Cellar

Expanded checklist for thorough reviews. SKILL.md has quick commands.

## P1: Constitutional Compliance (BLOCKING)

### Principle I: Test-First

```
[ ] New implementation has corresponding tests
[ ] Tests in correct location (unit/, contract/, integration/)
[ ] Tests are deterministic (no timing dependencies)
```

### Principle V: Security by Default

```
[ ] No secrets hardcoded
[ ] Parameterized queries only
[ ] Input validation present
[ ] Auth middleware on protected routes
```

### Principle VII: API Versioning

```
[ ] All routes under /api/v{N}/
[ ] Response uses createSuccessResponse/createErrorResponse
[ ] Deprecation headers on legacy endpoints
```

### Principle VIII: Design System

```
[ ] No raw hex colors (#NNNNNN)
[ ] Using project UI components (TailwindCSS)
[ ] Color tokens from tailwind.config.js
[ ] ApplicationShell for layout pages
```

_For deep audit, use `Skill: design-system`_

### Principle IX: Portal Architecture

```
[ ] Admin code in (admin)/ only
[ ] App code in (app)/ only
[ ] No cross-portal imports
[ ] Using portal helpers (isAdminRole, getPostLoginRoute)
```

### Principle XI: Feature Access

```
[ ] Frontend: useFeatureAccess() hook
[ ] Backend: requireFeatureAccess() middleware
[ ] No hardcoded role checks (role === 'ADMIN')
```

### Principle XII: Sanity Check

```
[ ] Not over-engineered for solo dev
[ ] Complexity justified by real problem
[ ] Not duplicating AWS/platform features
[ ] Maintainable in 6 months
```

---

## P2: Security (CRITICAL)

### Authentication

```
[ ] Protected routes have requireAuth
[ ] Session validated on sensitive pages
[ ] Logout clears all session state
[ ] No auth bypass in middleware
```

### Data Protection

```
[ ] Secrets from env vars only
[ ] No credentials in logs
[ ] User input validated
[ ] Output encoded (XSS prevention)
[ ] Error messages don't leak internals
```

### External APIs

```
[ ] API keys from environment
[ ] Timeouts configured
[ ] Rate limiting considered
[ ] Quota APIs mocked in tests
```

---

## P3: Architecture (IMPORTANT)

### Express API

```
[ ] asyncHandler on all route handlers
[ ] createSuccessResponse/createErrorResponse
[ ] Proper HTTP status codes
[ ] Business logic in services, not routes
[ ] Request validation before processing
```

### Prisma Database

```
[ ] include: {} for related data (no N+1)
[ ] select: {} for needed fields only
[ ] Transactions for multi-model ops
[ ] Pagination on list endpoints
```

### Next.js Frontend

```
[ ] Server components by default
[ ] 'use client' only when needed
[ ] Error boundaries present
[ ] Loading states for async
```

### Error Handling

```
[ ] Try-catch on async operations
[ ] Meaningful user-facing messages
[ ] Detailed server-side logging
[ ] No stack traces to client
```

### Technical Debt Markers

```
[ ] No PROTOTYPE/SPIKE/EXPERIMENTAL markers in production
[ ] No TEMPORARY/PLACEHOLDER code
[ ] No disabled features without tracking issue
[ ] No DEPRECATED/LEGACY code >30 days old
[ ] No dead code (if false, unused functions)
```

**Decision for each marker found:**

- <7 days: OK if actively worked
- 7-30 days: Needs tracking issue
- > 30 days: Remove or finish NOW

---

## P4: Quality (ADVISORY)

### Code Cleanup

```
[ ] No console.log in production
[ ] No TODO/FIXME without tracking
[ ] No commented-out code
[ ] No unused imports/exports
```

### TypeScript

```
[ ] No explicit 'any' types
[ ] Null checks where needed
[ ] Return types on functions
```

### Maintainability

```
[ ] Functions under 50 lines
[ ] Clear naming
[ ] Magic numbers as constants
[ ] Comments on complex logic
```

---

## Severity Quick Reference

| Priority | Type           | Merge?        |
| -------- | -------------- | ------------- |
| P1       | Constitutional | NO            |
| P2       | Security       | NO            |
| P3       | Architecture   | YES (note it) |
| P4       | Quality        | YES           |
