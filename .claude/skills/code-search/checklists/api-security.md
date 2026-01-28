# API Security Audit Checklist

## Authorization

- [ ] All endpoints require authentication (except public)
- [ ] Role-based access control (RBAC) enforced
- [ ] Resource ownership verified before access
- [ ] Admin endpoints restricted to admin roles
- [ ] Authorization checked at route AND service layer

## Input Validation

- [ ] All inputs validated with schema (Zod/Joi)
- [ ] Type coercion disabled or explicit
- [ ] Array/object size limits enforced
- [ ] String length limits enforced
- [ ] File upload size/type restricted

## Output Security

- [ ] Sensitive fields excluded from responses
- [ ] Error messages don't leak internals
- [ ] Stack traces hidden in production
- [ ] Response headers set correctly

## Rate Limiting

- [ ] Global rate limit exists
- [ ] Per-endpoint limits for sensitive operations
- [ ] Rate limit headers returned to client
- [ ] Bypass for internal services (if needed)

## CORS Configuration

- [ ] Origins explicitly whitelisted (not \*)
- [ ] Credentials mode configured correctly
- [ ] Methods restricted to needed verbs
- [ ] Headers restricted appropriately

## Security Headers

- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY` or CSP frame-ancestors
- [ ] `Strict-Transport-Security` (HSTS)
- [ ] `Content-Security-Policy` defined
- [ ] `X-XSS-Protection: 0` (deprecated, CSP preferred)

## API Versioning

- [ ] Version prefix on all routes (`/api/v1/`)
- [ ] Breaking changes require version bump
- [ ] Deprecation headers for old versions

## Logging & Monitoring

- [ ] Auth events logged (login, logout, failures)
- [ ] Sensitive data not logged (passwords, tokens)
- [ ] Request IDs for correlation
- [ ] Error rates monitored

## SQL/NoSQL Injection

- [ ] Parameterized queries only (ORM preferred)
- [ ] No raw SQL with user input
- [ ] NoSQL operators sanitized ($where, $regex)
