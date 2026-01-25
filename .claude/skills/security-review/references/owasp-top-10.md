---
parent: cybersec
name: owasp-top-10
---

# OWASP Top 10 2025 Reference

> Quick reference for OWASP Top 10 2025 vulnerabilities adapted to Retryvr tech
> stack.

## A01: Broken Access Control (40% of attacks)

**Pattern**: User can access data/actions beyond their permissions.

### Common Mistakes

```typescript
// Bad - No ownership check
router.get('/orders/:orderId', authenticate, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.orderId },
  });
  res.json(order); // Any user can view any order!
});

// Good - Ownership verification
router.get('/orders/:orderId', authenticate, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: {
      id: req.params.orderId,
      userId: req.user.id, // Only owner's orders
    },
  });
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});
```

### Retryvr Controls

- Use `requireFeatureAccess()` middleware, not hardcoded role checks
- Always add `userId` or `organizationId` to WHERE clauses
- Verify resource ownership before operations

---

## A02: Cryptographic Failures

**Pattern**: Sensitive data exposed through weak encryption or transmission.

### Requirements

| Data Type | At Rest             | In Transit        |
| --------- | ------------------- | ----------------- |
| Passwords | bcrypt (cost 12+)   | HTTPS only        |
| PII       | AES-256             | TLS 1.3           |
| Tokens    | N/A                 | HTTP-only cookies |
| API keys  | SSM Parameter Store | Never in code     |

### Retryvr Implementation

```typescript
// Passwords - use existing auth module
import { hashPassword, verifyPassword } from '@retryvr/auth';

// Secrets - from SSM, never hardcoded
const secret = process.env.JWT_SECRET; // Loaded from SSM at deploy
```

---

## A03: Injection

**Pattern**: Untrusted data interpreted as commands.

### SQL Injection Prevention (Prisma)

```typescript
// Safe - ORM methods
await prisma.user.findMany({ where: { email: { contains: query } } });

// Safe - Tagged template literals
await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;

// UNSAFE - String interpolation
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = '${userId}'`);
```

### Command Injection Prevention

```typescript
// Bad - shell interpretation
exec(`ls ${userInput}`);

// Good - no shell, array args
spawn('ls', [userInput]);
```

---

## A04: Insecure Design

**Pattern**: Architectural flaws that can't be fixed with code.

### Design Principles

1. **Threat modeling** before implementation
2. **Least privilege** - minimum permissions needed
3. **Defense in depth** - multiple validation layers (see
   `Skill: defense-in-depth`)
4. **Fail secure** - deny by default

---

## A05: Security Misconfiguration

**Pattern**: Default configs, verbose errors, unnecessary features.

### Express Security Checklist

```typescript
// Required middleware order
app.use(helmet()); // Security headers
app.use(cors({ origin: ALLOWED_ORIGINS })); // Explicit allowlist
app.use(express.json({ limit: '10mb' })); // Size limits
app.disable('x-powered-by'); // Hide server info
```

### Next.js Security Checklist

```javascript
// next.config.js
module.exports = {
  poweredByHeader: false,
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
};
```

---

## A06: Vulnerable Components

**Pattern**: Using components with known vulnerabilities.

### Process

```bash
# Check dependencies
npm audit --production

# Block on CRITICAL, review HIGH
npm audit --audit-level=critical
```

### CI/CD Integration

- GitLeaks: Secret scanning
- Trivy: Container/dependency scanning
- Semgrep: SAST rules

---

## A07: Auth Failures

**Pattern**: Weak authentication allowing unauthorized access.

### JWT Requirements

- Use `jwt.verify()` with algorithm whitelist
- Short expiration (15 min access, 7 day refresh)
- HTTP-only cookies, not localStorage
- Include `aud`, `iss`, `exp` claims

### Session Management

- Regenerate session ID after login
- Invalidate all sessions on password change
- Implement idle timeout (15 min)

See `references/auth-patterns.md` for detailed implementation.

---

## A08: Software/Data Integrity

**Pattern**: Untrusted code or data corrupting system.

### CI/CD Security

- Require signed commits
- Pin dependency versions
- Scan images before deploy
- No external scripts in builds

---

## A09: Logging Failures

**Pattern**: Insufficient logging for security events.

### Required Audit Events

```typescript
// Sensitive operations require audit logging
await req.logAudit({
  entityType: 'user',
  entityId: userId,
  action: 'password_change',
  metadata: { ip: req.ip, userAgent: req.headers['user-agent'] },
});
```

### What to Log

- Authentication attempts (success/failure)
- Authorization failures
- Input validation failures
- Admin actions
- Data exports

---

## A10: Mishandling Exceptions (NEW 2025)

**Pattern**: Error handling that leaks info or fails insecurely.

### Bad vs Good

```typescript
// Bad - leaks internal info
res.status(500).json({
  error: err.message,
  stack: err.stack,
  query: req.body.query, // Exposes input
});

// Good - generic to user, detailed in logs
logger.error('Operation failed', {
  error: err.message,
  stack: err.stack,
  requestId: req.requestId,
});
res.status(500).json({
  error: 'Internal server error',
  requestId: req.requestId, // For support reference
});
```

---

## Quick Reference Table

| Rank | Risk                      | Primary Control                   |
| ---- | ------------------------- | --------------------------------- |
| A01  | Broken Access Control     | Resource ownership checks         |
| A02  | Cryptographic Failures    | SSM secrets, TLS, bcrypt          |
| A03  | Injection                 | Prisma ORM, input validation      |
| A04  | Insecure Design           | Threat modeling, defense in depth |
| A05  | Security Misconfiguration | Helmet, secure defaults           |
| A06  | Vulnerable Components     | npm audit, Trivy                  |
| A07  | Auth Failures             | JWT verify, session management    |
| A08  | Software Integrity        | Signed commits, pinned deps       |
| A09  | Logging Failures          | Audit logging for sensitive ops   |
| A10  | Exception Handling        | Generic errors, detailed logs     |
