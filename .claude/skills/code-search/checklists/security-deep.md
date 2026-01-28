# Security Deep Audit Checklist (OWASP Top 10)

## A01:2021 – Broken Access Control

- [ ] Authorization enforced at API and UI layers
- [ ] Resource ownership verified before operations
- [ ] RBAC enforced consistently
- [ ] Admin functions restricted to admin roles
- [ ] CORS configured with explicit origins

## A02:2021 – Cryptographic Failures

- [ ] Passwords hashed with bcrypt/argon2
- [ ] Sensitive data encrypted at rest
- [ ] TLS/HTTPS enforced
- [ ] Secrets in environment variables (not code)
- [ ] No hardcoded credentials

## A03:2021 – Injection

- [ ] Parameterized queries (no raw SQL with user input)
- [ ] Input validation with schemas (Zod)
- [ ] Command injection prevention
- [ ] NoSQL injection prevention
- [ ] LDAP injection prevention

## A04:2021 – Insecure Design

- [ ] Threat modeling performed
- [ ] Security requirements documented
- [ ] Defense in depth applied
- [ ] Principle of least privilege
- [ ] Secure defaults

## A05:2021 – Security Misconfiguration

- [ ] Security headers configured
- [ ] Error messages don't leak internals
- [ ] Stack traces hidden in production
- [ ] Unnecessary features disabled
- [ ] Default accounts removed

## A06:2021 – Vulnerable Components

- [ ] npm audit passes (no high/critical CVEs)
- [ ] Dependencies regularly updated
- [ ] License compliance verified
- [ ] Dependency source verified

## A07:2021 – Authentication Failures

- [ ] MFA implemented for sensitive operations
- [ ] Session timeout configured
- [ ] Account lockout after failures
- [ ] Password complexity enforced
- [ ] Secure password reset flow

## A08:2021 – Data Integrity Failures

- [ ] Input validation on all endpoints
- [ ] Output encoding
- [ ] Digital signatures where needed
- [ ] CI/CD pipeline secured

## A09:2021 – Logging Failures

- [ ] Security events logged
- [ ] Sensitive data not logged
- [ ] Log tampering prevention
- [ ] Audit trail complete

## A10:2021 – Server-Side Request Forgery

- [ ] URL validation for external requests
- [ ] Whitelist for allowed destinations
- [ ] Network segmentation
- [ ] No user-controlled URLs
