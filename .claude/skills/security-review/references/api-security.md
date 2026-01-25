---
parent: cybersec
name: api-security
---

# OWASP API Security Top 10 2023 Reference

> API-specific security patterns for Express.js/REST API development.

## API1: Broken Object Level Authorization (BOLA)

**Frequency**: 40% of API attacks **Pattern**: API exposes object IDs without
verifying user owns the object.

### Vulnerable

```typescript
// User can access ANY organization's data
router.get(
  '/api/v1/organizations/:orgId/users',
  authenticate,
  async (req, res) => {
    const users = await prisma.user.findMany({
      where: { organizationId: req.params.orgId },
    });
    res.json(users);
  }
);
```

### Secure

```typescript
router.get(
  '/api/v1/organizations/:orgId/users',
  authenticate,
  async (req, res) => {
    // Verify user belongs to this organization
    if (req.user.organizationId !== req.params.orgId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const users = await prisma.user.findMany({
      where: { organizationId: req.params.orgId },
    });
    res.json(users);
  }
);
```

### Best Practice

Add organization/user ID to all WHERE clauses by default:

```typescript
// Service layer pattern
class UserService {
  async getOrgUsers(requestingUser: User, orgId: string) {
    // Authorization check in service
    if (requestingUser.organizationId !== orgId && !isAdmin(requestingUser)) {
      throw new ForbiddenError();
    }
    return prisma.user.findMany({ where: { organizationId: orgId } });
  }
}
```

---

## API2: Broken Authentication

**Pattern**: Weak or missing authentication mechanisms.

### Common Mistakes

```typescript
// Bad - Basic auth over HTTP
app.use(basicAuth({ users: { admin: 'password' } }));

// Bad - No rate limiting on auth
router.post('/login', async (req, res) => { ... });

// Bad - Predictable tokens
const token = `user_${Date.now()}`;
```

### Retryvr Standard

```typescript
// JWT with proper validation
import { authenticateJWT } from './middleware/auth-middleware';

router.post('/login', rateLimitAuth, async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await authService.authenticate(email, password);
  const token = authService.generateToken(user); // Short-lived, signed JWT
  res.json({ token });
});

// Protected routes
app.use('/api/v1/*', authenticateJWT);
```

---

## API3: Broken Object Property Level Authorization

**Pattern**: API exposes more properties than needed or allows updating
sensitive properties.

### Mass Assignment Vulnerability

```typescript
// Bad - Updates any field from request
await prisma.user.update({
  where: { id: userId },
  data: req.body, // Attacker sets { role: 'SUPER_ADMIN' }
});

// Good - Allowlist fields
const { bio, displayName } = req.body;
await prisma.user.update({
  where: { id: userId },
  data: { bio, displayName },
});
```

### Excessive Data Exposure

```typescript
// Bad - Returns all fields including sensitive ones
res.json(await prisma.user.findUnique({ where: { id } }));

// Good - Select only needed fields
res.json(
  await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      // Excludes: passwordHash, internalNotes, etc.
    },
  })
);
```

---

## API4: Unrestricted Resource Consumption

**Pattern**: No limits on API resource usage enabling DoS.

### Rate Limiting Strategy

```typescript
import rateLimit from 'express-rate-limit';

// Global limit
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoint limit (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { error: 'Too many login attempts' },
});

app.use('/api/v1/', globalLimiter);
app.use('/api/v1/auth/login', authLimiter);
```

### Request Size Limits

```typescript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
```

### Query Result Limits

```typescript
// Always limit and paginate
const MAX_PAGE_SIZE = 100;
const pageSize = Math.min(req.query.limit || 20, MAX_PAGE_SIZE);

const results = await prisma.user.findMany({
  take: pageSize,
  skip: (page - 1) * pageSize,
});
```

---

## API5: Broken Function Level Authorization

**Pattern**: User can access admin functions.

### Anti-Pattern

```typescript
// Bad - Only checks authentication, not authorization
router.delete('/api/v1/users/:id', authenticate, async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
```

### Retryvr Pattern

```typescript
import { requireRole, requireFeatureAccess } from './middleware/auth-middleware';

// Role-based
router.delete('/api/v1/users/:id',
  authenticate,
  requireRole('SUPER_ADMIN'),
  async (req, res) => { ... }
);

// Feature-based (preferred)
router.delete('/api/v1/users/:id',
  authenticate,
  requireFeatureAccess('user:delete'),
  async (req, res) => { ... }
);
```

---

## API6: Unrestricted Access to Sensitive Business Flows (NEW)

**Pattern**: No protection against automated abuse of business features.

### Examples

- Mass account creation (credential stuffing)
- Automated coupon redemption
- Bot purchases during sales

### Mitigations

```typescript
// CAPTCHA for sensitive flows
router.post('/api/v1/register',
  verifyCaptcha,
  rateLimitRegistration,
  async (req, res) => { ... }
);

// Business logic limits
router.post('/api/v1/redeem-coupon',
  authenticate,
  async (req, res) => {
    const redemptions = await prisma.redemption.count({
      where: { userId: req.user.id, couponId: req.body.couponId }
    });
    if (redemptions > 0) {
      return res.status(400).json({ error: 'Coupon already redeemed' });
    }
    // ... proceed
  }
);
```

---

## API7: Server-Side Request Forgery (SSRF) (NEW)

**Pattern**: API fetches user-supplied URLs, accessing internal resources.

### Vulnerable

```typescript
// Bad - Fetches any URL
router.post('/api/v1/fetch-preview', async (req, res) => {
  const response = await fetch(req.body.url); // Could be http://169.254.169.254/
  res.json({ content: await response.text() });
});
```

### Secure

```typescript
const ALLOWED_DOMAINS = ['api.example.com', 'cdn.example.com'];

router.post('/api/v1/fetch-preview', async (req, res) => {
  const url = new URL(req.body.url);

  // Domain allowlist
  if (!ALLOWED_DOMAINS.includes(url.hostname)) {
    return res.status(400).json({ error: 'Domain not allowed' });
  }

  // Block internal IPs
  if (isInternalIP(url.hostname)) {
    return res.status(400).json({ error: 'Internal URLs not allowed' });
  }

  const response = await fetch(url, { redirect: 'error' }); // No redirects
  res.json({ content: await response.text() });
});
```

### Helper: Internal IP Detection

```typescript
/**
 * Check if hostname resolves to internal/private IP ranges
 * Blocks: loopback, private networks, link-local (AWS metadata)
 */
function isInternalIP(hostname: string): boolean {
  // For IP addresses, check directly
  const ip = hostname;

  // RFC 1918 private ranges + loopback + link-local
  const internalPatterns = [
    /^127\./, // Loopback (127.0.0.0/8)
    /^10\./, // Private Class A (10.0.0.0/8)
    /^192\.168\./, // Private Class C (192.168.0.0/16)
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private Class B (172.16.0.0/12)
    /^169\.254\./, // Link-local / AWS metadata (169.254.0.0/16)
    /^0\./, // "This" network (0.0.0.0/8)
    /^::1$/, // IPv6 loopback
    /^fc00:/i, // IPv6 unique local
    /^fe80:/i, // IPv6 link-local
  ];

  return internalPatterns.some((pattern) => pattern.test(ip));
}

// For hostnames, resolve first (async version)
async function isInternalHostname(hostname: string): Promise<boolean> {
  const dns = await import('dns').then((m) => m.promises);
  try {
    const addresses = await dns.resolve4(hostname);
    return addresses.some((ip) => isInternalIP(ip));
  } catch {
    return false; // DNS resolution failed - could also block as suspicious
  }
}
```

**Note:** Always resolve hostnames before checking - attackers use DNS rebinding
to bypass IP checks.

---

## API8: Security Misconfiguration

**Pattern**: Insecure defaults, verbose errors, unnecessary features.

### Debug Info in Production

```typescript
// Bad
res.status(500).json({
  error: err.message,
  stack: err.stack,
  query: req.body,
});

// Good
if (process.env.NODE_ENV === 'production') {
  res.status(500).json({ error: 'Internal server error' });
} else {
  res.status(500).json({ error: err.message, stack: err.stack });
}
```

### Unnecessary HTTP Methods

```typescript
// Only expose needed methods
app.use('/api/v1/users', router);
// router only defines GET, POST, PUT - DELETE returns 405
```

---

## API9: Improper Inventory Management

**Pattern**: Outdated or shadow APIs without security controls.

### Version Management

```typescript
// All routes versioned
app.use('/api/v1/', v1Router); // Current
app.use('/api/v2/', v2Router); // Next version

// Deprecation headers
router.use('/api/v1/*', (req, res, next) => {
  res.set('Deprecation', 'true');
  res.set('Sunset', 'Sat, 01 Jan 2025 00:00:00 GMT');
  next();
});
```

### Documentation

- OpenAPI spec for all endpoints
- Document auth requirements per endpoint
- Track API consumers

---

## API10: Unsafe Consumption of APIs (NEW)

**Pattern**: Trusting third-party API responses without validation.

### Vulnerable

```typescript
// Bad - Trusts external API completely
const externalData = await fetch('https://external-api.com/data').then((r) =>
  r.json()
);
await prisma.record.create({ data: externalData }); // Injection risk!
```

### Secure

```typescript
import { z } from 'zod';

const ExternalDataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(100),
  value: z.number().positive(),
});

const rawData = await fetch('https://external-api.com/data').then((r) =>
  r.json()
);
const validatedData = ExternalDataSchema.parse(rawData); // Validates structure
await prisma.record.create({ data: validatedData });
```

---

## Quick Reference

| Risk               | Primary Control                  | Detection                       |
| ------------------ | -------------------------------- | ------------------------------- |
| API1 BOLA          | Ownership checks in WHERE        | Test with different user tokens |
| API2 Auth          | JWT verify, rate limit           | Brute force testing             |
| API3 Property Auth | Field allowlists                 | Test with extra fields          |
| API4 Resource      | Rate limits, pagination          | Load testing                    |
| API5 Function Auth | requireRole/requireFeatureAccess | Role escalation tests           |
| API6 Business Flow | CAPTCHA, business limits         | Automation testing              |
| API7 SSRF          | URL allowlist, block internal    | Internal URL injection          |
| API8 Misconfig     | Helmet, error handling           | Config review                   |
| API9 Inventory     | Version all APIs                 | API documentation audit         |
| API10 Unsafe APIs  | Validate external data           | Input fuzzing                   |
