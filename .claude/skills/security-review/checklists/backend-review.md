---
parent: cybersec
name: backend-review
---

# Backend Security Review Checklist

> Express.js, Node.js, and Prisma security review for Retryvr API

**Usage:** Create TodoWrite items for each section when reviewing backend code.

---

## P1: CRITICAL (Blocks Merge)

### Authentication

- [ ] All non-public routes have `authenticate` middleware
- [ ] No routes bypass auth via header tricks (`x-admin-override`, etc.)
- [ ] JWT tokens verified with `jwt.verify()`, never just `jwt.decode()`
- [ ] JWT verification includes `algorithms` whitelist
- [ ] Session tokens regenerated after login

**Quick Check:**

```bash
# Routes without auth
grep -rn "router\.\(get\|post\|put\|delete\)" apps/api/src/routes/v1/ | grep -v "authenticate"
```

### Injection Prevention

- [ ] No `$queryRawUnsafe` or `$executeRawUnsafe` usage
- [ ] No string interpolation in raw SQL queries
- [ ] No `eval()`, `Function()`, or `new Function()` with user input
- [ ] No `child_process.exec()` with user input (use `spawn` with args array)

**Quick Check:**

```bash
grep -rn "\$queryRawUnsafe\|\$executeRawUnsafe\|eval(\|new Function" apps/api/src/
```

### Secrets

- [ ] No hardcoded passwords, API keys, or secrets in code
- [ ] Environment variables loaded from SSM, not `.env` in production
- [ ] No secrets logged (even at debug level)

**Quick Check:**

```bash
grep -rn "password\s*[:=]\s*['\"]" apps/api/src/ --include="*.ts" | grep -v "\.test\.\|type\|interface"
```

---

## P2: HIGH (Fix Before Merge)

### Authorization (BOLA/IDOR Prevention)

- [ ] Resource access checks ownership OR admin status
- [ ] Tenant isolation enforced (user can't access other tenants' data)
- [ ] ID parameters validated as UUID/expected format
- [ ] No direct object reference without authorization check

**Pattern:**

```typescript
// ✅ REQUIRED pattern
if (resource.ownerId !== req.user.id && !isAdmin(req.user)) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

### Input Validation

- [ ] All `req.body` validated with Zod/Joi schema
- [ ] All `req.query` parameters validated
- [ ] All `req.params` validated (UUID format, etc.)
- [ ] File uploads validated (type, size, name sanitization)
- [ ] Content-Type header validated

**Quick Check:**

```bash
grep -rn "req\.body" apps/api/src/routes/ | grep -v "schema\|validate\|Joi\|zod"
```

### Mass Assignment Prevention

- [ ] No `prisma.update({ data: req.body })` without field whitelisting
- [ ] No `Object.assign(entity, req.body)`
- [ ] Destructure only allowed fields from request

**Pattern:**

```typescript
// ✅ SECURE - Explicit field selection
const { bio, displayName } = req.body;
await prisma.user.update({ where: { id }, data: { bio, displayName } });
```

### Error Handling

- [ ] No stack traces returned to client
- [ ] No internal paths leaked in errors
- [ ] No database error details exposed
- [ ] Errors logged server-side with context

**Pattern:**

```typescript
// ✅ SECURE
catch (error) {
  logger.error('Operation failed', { error: error.message, userId, action });
  res.status(500).json({ error: 'Internal server error' });
}
```

---

## P3: SECURITY DEBT (Track & Fix Soon)

### Rate Limiting

- [ ] Auth endpoints rate limited (5/min login, 3/min register)
- [ ] API endpoints rate limited per user (100/min default)
- [ ] Rate limit headers returned (`RateLimit-Limit`, `RateLimit-Remaining`)
- [ ] Brute force protection on password reset

### Security Headers

- [ ] Helmet middleware enabled
- [ ] HSTS configured (`max-age=31536000; includeSubDomains`)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff

**Quick Check:**

```bash
grep -rn "helmet(" apps/api/src/server.ts
```

### Logging & Audit

- [ ] Authentication events logged (login, logout, failed attempts)
- [ ] Authorization failures logged
- [ ] Sensitive operations use `req.logAudit()`
- [ ] No PII in logs (passwords, full SSN, etc.)

### Dependencies

- [ ] `npm audit` shows no CRITICAL/HIGH vulnerabilities
- [ ] Production dependencies up to date
- [ ] No deprecated packages with known CVEs

---

## P4: BEST PRACTICE (Advisory)

### Request Limits

- [ ] Body parser has size limit (`express.json({ limit: '10mb' })`)
- [ ] JSON depth limit configured
- [ ] Array size limits in validation schemas

### CORS

- [ ] Explicit origin allowlist (not `*` in production)
- [ ] Credentials only with specific origins
- [ ] Methods and headers explicitly specified

### Cookies

- [ ] `httpOnly: true` for session cookies
- [ ] `secure: true` in production
- [ ] `sameSite: 'Strict'` or `'Lax'`
- [ ] Reasonable expiration times

### Code Patterns

- [ ] Async handlers wrapped (`asyncHandler` or try/catch)
- [ ] Database connections properly pooled
- [ ] Timeouts configured for external calls
- [ ] No synchronous file operations in request handlers

---

## Retryvr-Specific Checks

### API Versioning

- [ ] All routes under `/api/v1/` prefix
- [ ] No legacy unversioned endpoints added

### Prisma Patterns

- [ ] Transactions used for multi-step operations
- [ ] `findUnique`/`findFirst` used appropriately (not `findMany` for single
      record)
- [ ] Includes limited to prevent N+1 (use `select` when possible)

### Constitution Compliance

- [ ] Audit logging for compliance-required operations
- [ ] Tenant boundaries respected
- [ ] No cross-portal data leakage

---

## Quick Full Scan

```bash
# Run all critical checks
echo "=== P1: Injection ===" && \
grep -rn "\$queryRawUnsafe\|\$executeRawUnsafe\|eval(" apps/api/src/

echo "=== P1: Secrets ===" && \
grep -rn "password\s*[:=]\s*['\"][^'\"]\+['\"]" apps/api/src/ --include="*.ts" | grep -v "\.test\."

echo "=== P1: Auth Gaps ===" && \
grep -rn "router\.\(get\|post\)" apps/api/src/routes/v1/ | grep -v authenticate

echo "=== P2: Mass Assignment ===" && \
grep -rn "prisma\.\w\+\.update.*req\.body" apps/api/src/

echo "=== P2: Raw Body Usage ===" && \
grep -rn "req\.body\b" apps/api/src/routes/ | head -20
```
