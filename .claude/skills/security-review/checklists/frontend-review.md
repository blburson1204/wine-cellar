---
parent: cybersec
name: frontend-review
---

# Frontend Security Review Checklist

> Next.js, React, and NextAuth.js security review for Wine Cellar Web

**Usage:** Create TodoWrite items for each section when reviewing frontend code.

---

## P1: CRITICAL (Blocks Merge)

### XSS Prevention

- [ ] No `dangerouslySetInnerHTML` without DOMPurify sanitization
- [ ] No raw HTML rendering of user content
- [ ] No `eval()` or `new Function()` with user data
- [ ] No `javascript:` URLs in href attributes

**Quick Check:**

```bash
grep -rn "dangerouslySetInnerHTML" apps/web/src/ --include="*.tsx"
# Each result must use DOMPurify.sanitize()
```

### Authentication

- [ ] Protected routes check session server-side (not just middleware)
- [ ] No auth bypass via `x-middleware-subrequest` header
- [ ] `NEXTAUTH_SECRET` is strong and unique per environment
- [ ] Session validation in API routes, not just client-side

**Quick Check:**

```bash
# Check for middleware bypass vulnerability
grep -rn "x-middleware-subrequest" apps/web/src/
```

### Secrets Exposure

- [ ] No secrets in client-side code (`NEXT_PUBLIC_` prefix audit)
- [ ] No API keys exposed in browser
- [ ] No hardcoded credentials
- [ ] `.env.local` not committed

**Quick Check:**

```bash
# Client-exposed env vars
grep -rn "NEXT_PUBLIC_" apps/web/src/ | grep -v "\.test\."
grep -rn "process\.env\." apps/web/src/app/ --include="*.tsx" | grep -v "server"
```

---

## P2: HIGH (Fix Before Merge)

### Authorization

- [ ] Admin routes protected with role check (not just auth)
- [ ] Portal boundaries enforced (admin vs app vs public)
- [ ] No client-side only authorization (always verify server-side)
- [ ] API routes validate user permissions

**Pattern:**

```typescript
// ✅ REQUIRED - Server-side role check
const session = await auth();
if (!session?.user || session.user.role !== 'ADMIN') {
  return new Response('Forbidden', { status: 403 });
}
```

### Input Handling

- [ ] Form inputs sanitized before submission
- [ ] URL parameters validated
- [ ] File uploads validated (type, size) on client AND server
- [ ] Search inputs escaped for display

### CSRF Protection

- [ ] State-changing operations use POST/PUT/DELETE (not GET)
- [ ] NextAuth CSRF token validation enabled
- [ ] Custom API routes validate origin/referer for mutations

### Sensitive Data Display

- [ ] PII masked in UI (last 4 of SSN, masked email, etc.)
- [ ] No sensitive data in URL parameters
- [ ] Browser history doesn't contain sensitive data
- [ ] No sensitive data in localStorage (use httpOnly cookies)

---

## P3: SECURITY DEBT (Track & Fix Soon)

### Security Headers (next.config.js)

- [ ] Content-Security-Policy configured
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy restricts unnecessary APIs

**Check Config:**

```javascript
// next.config.js should include:
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ];
}
```

### External Resources

- [ ] Third-party scripts loaded with integrity hashes
- [ ] External images/fonts from trusted sources only
- [ ] No inline scripts (use nonce or hash in CSP)
- [ ] iframes sandboxed appropriately

### Error Handling

- [ ] Error boundaries don't expose stack traces
- [ ] 404/500 pages don't leak internal paths
- [ ] API errors sanitized before display

### Dependencies

- [ ] No known vulnerable React/Next.js versions
- [ ] UI library dependencies up to date
- [ ] No deprecated packages

---

## P4: BEST PRACTICE (Advisory)

### Forms

- [ ] Autocomplete disabled for sensitive fields
- [ ] Password fields use `type="password"`
- [ ] Forms have proper ARIA labels (accessibility = security)
- [ ] Submit buttons disabled during processing (prevent double-submit)

### Links

- [ ] External links use `rel="noopener noreferrer"`
- [ ] User-generated links validated
- [ ] No `target="_blank"` without `rel="noopener"`

### State Management

- [ ] Sensitive data cleared on logout
- [ ] No sensitive data in Redux/Zustand devtools
- [ ] Session state doesn't persist sensitive data

### Images

- [ ] User-uploaded images served through CDN/proxy
- [ ] No SVGs with embedded scripts from user uploads
- [ ] Image URLs validated

---

## Project-Specific Checks

### Three-Portal Architecture

- [ ] Admin portal (`/admin/*`) requires ADMIN/SUPER_ADMIN role
- [ ] App portal (`/app/*`) requires authenticated user
- [ ] Public portal has no auth-gated content accidentally exposed
- [ ] Cross-portal navigation doesn't bypass auth

### NextAuth.js Configuration

- [ ] `authorized` callback validates roles for admin routes
- [ ] Session callback doesn't expose sensitive user data
- [ ] JWT callback properly structures token claims
- [ ] Sign-in page doesn't leak user existence

### Design System Compliance

- [ ] Using existing TailwindCSS components (security-audited)
- [ ] No raw HTML inputs for sensitive fields
- [ ] Form validation using approved patterns

---

## Next.js 14/15 Specific

### Server Components Security

- [ ] Server components don't expose secrets to client
- [ ] `use client` boundary doesn't leak server data
- [ ] Server actions validate input
- [ ] No serialization of sensitive objects to client

### API Routes

- [ ] `/api/*` routes validate authentication
- [ ] Rate limiting considered for public endpoints
- [ ] CORS configured if needed
- [ ] Response headers set appropriately

### Middleware

- [ ] Middleware runs on all protected routes
- [ ] No `x-middleware-subrequest` bypass (CVE-2025-29927)
- [ ] Matcher patterns correct (no route gaps)

**Middleware Pattern:**

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Block bypass header
  if (request.headers.get('x-middleware-subrequest')) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  // ... rest of middleware
}
```

---

## Quick Full Scan

```bash
# Run all critical checks
echo "=== P1: XSS ===" && \
grep -rn "dangerouslySetInnerHTML" apps/web/src/ --include="*.tsx"

echo "=== P1: Secrets ===" && \
grep -rn "NEXT_PUBLIC_" apps/web/.env* 2>/dev/null

echo "=== P2: Client Auth ===" && \
grep -rn "session\." apps/web/src/app/ --include="*.tsx" | head -10

echo "=== P3: Headers ===" && \
grep -rn "X-Frame-Options\|Content-Security-Policy" apps/web/next.config.*

echo "=== Middleware Check ===" && \
cat apps/web/src/middleware.ts 2>/dev/null | head -30
```

---

## Critical CVEs to Check

| CVE            | Severity        | Affected                  | Fix                             |
| -------------- | --------------- | ------------------------- | ------------------------------- |
| CVE-2025-55182 | CRITICAL (10.0) | Next.js <14.2.25, <15.2.3 | Upgrade immediately             |
| CVE-2025-29927 | CRITICAL (9.1)  | Next.js middleware bypass | Block `x-middleware-subrequest` |
| CVE-2025-55183 | HIGH            | React DOM                 | Upgrade React                   |

**Version Check:**

```bash
npm list next react react-dom | grep -E "next|react"
```
