---
name: security-review
description:
  Validates code security through pre-commit checks, OWASP audits, and
  constitutional compliance. Supports --quick, --comprehensive, or
  --constitutional modes. Invoke when reviewing code changes, before
  deployments, or when security validation is needed.
model: claude-sonnet-4-5-20250929
---

# Security Review - Retryvr Platform

## Overview

Unified security review for code, APIs, and infrastructure. Combines pre-commit
automation, OWASP compliance, and constitutional checks.

**Core Principle:** Security issues are binary - blocking (P1/P2) or tracked
debt (P3/P4). No gray area.

## Auto-Routing

Load the appropriate checklist based on what you're reviewing:

| Reviewing                   | Load Checklist                                                     |
| --------------------------- | ------------------------------------------------------------------ |
| Express/Node.js/Prisma code | [checklists/backend-review.md](checklists/backend-review.md)       |
| Next.js/React/NextAuth code | [checklists/frontend-review.md](checklists/frontend-review.md)     |
| CI/CD, Docker, AWS configs  | [checklists/deployment-review.md](checklists/deployment-review.md) |
| Constitutional compliance   | [checklists/constitutional.md](checklists/constitutional.md)       |
| OWASP deep-dive             | [references/owasp-top-10.md](references/owasp-top-10.md)           |

**For --quick mode:** Load only the checklist matching changed files. **For
--comprehensive mode:** Load all domain checklists. **For --constitutional
mode:** Load constitutional.md + relevant domain checklist.

## Modes

| Mode               | Use When           | Scope                                |
| ------------------ | ------------------ | ------------------------------------ |
| `--quick`          | Before commits     | Changed files only                   |
| `--comprehensive`  | Before deployment  | Full OWASP Top 10                    |
| `--constitutional` | Feature completion | Constitutional compliance + security |

**Default:** `--quick` if no mode specified.

## Priority Levels

| Priority | Type     | Merge? | Examples                                       |
| -------- | -------- | ------ | ---------------------------------------------- |
| **P1**   | Critical | NO     | SQL injection, hardcoded secrets, missing auth |
| **P2**   | High     | NO     | XSS, CSRF bypass, broken access control        |
| **P3**   | Debt     | YES    | Missing rate limits, weak headers              |
| **P4**   | Advisory | YES    | Cookie flags, CORS tuning                      |

---

## Workflow

### Step 1: Determine Scope

| Mode               | Scope                | Files to Review                                    |
| ------------------ | -------------------- | -------------------------------------------------- |
| `--quick`          | Changed files only   | `git diff --name-only origin/main..HEAD`           |
| `--comprehensive`  | Full codebase        | `apps/api/src/`, `apps/web/src/`                   |
| `--constitutional` | Changed + compliance | Changed files + portal boundaries + API versioning |

**OWASP Categories** (for comprehensive audits): A01 Access Control, A02 Crypto,
A03 Injection, A04 Design, A05 Misconfig, A06 Components, A07 Auth, A08
Integrity, A09 Logging, A10 SSRF

For deep OWASP guidance, load
[references/owasp-top-10.md](references/owasp-top-10.md).

### Step 2: Run Detection Patterns

Load the appropriate checklist from Auto-Routing above. Each checklist contains:

- Priority-ordered checks (P1 Critical → P4 Advisory)
- Grep patterns with exact syntax
- Quick Check bash commands for common scans

**Grep tool parameters** (use Grep tool, not bash grep):

| Task            | Parameters                                         |
| --------------- | -------------------------------------------------- |
| Check existence | `output_mode: "files_with_matches", head_limit: 1` |
| Count matches   | `output_mode: "count"`                             |
| Get context     | `output_mode: "content", -C: 2`                    |

### Step 3: Output Results

```
SECURITY REVIEW - [MODE]
========================
Scope: [files/directories reviewed]

P1 Critical: [PASS/FAIL]
  - Authentication: [status]
  - JWT security: [status]
  - Secrets: [status]
  - Injection: [status]

P2 High: [PASS/FAIL]
  - XSS protection: [status]
  - Access control: [status]
  - Input validation: [status]

P3/P4 Debt: [count items logged]

OVERALL: [PASS/FAIL]
Blocking violations: [list or "none"]
```

**If ANY P1/P2 violation: STOP. Block commit/deployment.**

---

## Tech Stack Patterns

### Prisma (SQL Safe)

```typescript
// SAFE - ORM methods
await prisma.user.findMany({ where: { email: { contains: query } } });

// SAFE - Tagged template
await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;

// UNSAFE - String interpolation
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = '${userId}'`);
```

### Express Middleware Order

```typescript
app.use(helmet()); // Security headers FIRST
app.use(cors(corsOptions)); // CORS
app.use(express.json({ limit: '10mb' }));
app.use(authenticate); // Auth
app.use(validateInput); // Validation
```

### Broken Access Control (BOLA)

```typescript
// VULNERABLE - No ownership check
const data = await prisma.user.findUnique({ where: { id: req.params.userId } });

// SECURE - Verify ownership
if (req.user.id !== req.params.userId && !isAdmin(req.user)) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

### Mass Assignment Prevention

```typescript
// VULNERABLE
await prisma.user.update({ where: { id }, data: req.body });

// SECURE - Whitelist fields
const { bio, displayName } = req.body;
await prisma.user.update({ where: { id }, data: { bio, displayName } });
```

### Security Headers (Required)

| Header                      | Value                                 |
| --------------------------- | ------------------------------------- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Frame-Options`           | `DENY`                                |
| `X-Content-Type-Options`    | `nosniff`                             |
| `Content-Security-Policy`   | `default-src 'self'`                  |

---

## Constitutional Checks (--constitutional mode)

Additional checks for constitutional compliance:

| Check             | Pattern                                       | Expected               |
| ----------------- | --------------------------------------------- | ---------------------- |
| API versioning    | `router.(get\|post)` in `routes/*.ts`         | None (all in v1/, v2/) |
| Portal boundaries | `from.*components/admin` in `components/app/` | None                   |
| Raw hex colors    | `\[#[0-9a-fA-F]{6}\]` in `.tsx`               | None                   |
| Hardcoded roles   | `role === ['"]ADMIN`                          | None                   |

---

## Red Flags - STOP Immediately

- `jwt.decode()` without `jwt.verify()`
- `$queryRawUnsafe` with user input
- `dangerouslySetInnerHTML` without DOMPurify
- `req.body` passed directly to `prisma.update()`
- Routes without `authenticate` middleware
- Hardcoded credentials
- `eval()`, `Function()`, `new Function()`

---

## Integration

| Workflow           | Invocation                                |
| ------------------ | ----------------------------------------- |
| Pre-commit         | `Skill: security-review --quick`          |
| Before merge       | `Skill: security-review --comprehensive`  |
| Feature completion | `Skill: security-review --constitutional` |
| Manual invocation  | `/review-code` (invokes this skill)       |

## References

**Checklists** (load based on review scope):

- [checklists/backend-review.md](checklists/backend-review.md) - Express,
  Node.js, Prisma security
- [checklists/frontend-review.md](checklists/frontend-review.md) - Next.js,
  React, NextAuth security
- [checklists/deployment-review.md](checklists/deployment-review.md) - CI/CD,
  Docker, AWS security
- [checklists/constitutional.md](checklists/constitutional.md) - Constitutional
  compliance checks

**Deep References** (load when investigating specific areas):

- [references/owasp-top-10.md](references/owasp-top-10.md) - Full OWASP Top 10
  guidance
- [references/api-security.md](references/api-security.md) - API-specific
  patterns
- [references/auth-patterns.md](references/auth-patterns.md) - Authentication
  flow validation
- [references/infrastructure.md](references/infrastructure.md) - Infrastructure
  security
- [references/STACK-PATTERNS.md](references/STACK-PATTERNS.md) - Tech stack
  security patterns
