---
parent: cybersec
name: auth-patterns
---

# Authentication & Authorization Patterns Reference

> JWT, OAuth 2.0, and session security patterns for Retryvr platform.

## JWT Security (RFC 9700 - January 2025)

### Algorithm Selection

| Algorithm | Use Case                          | Security                             |
| --------- | --------------------------------- | ------------------------------------ |
| RS256     | Distributed systems, API gateways | Asymmetric - public key verification |
| ES256     | Mobile apps, performance-critical | Asymmetric - smaller signatures      |
| HS256     | Single server, internal APIs      | Symmetric - shared secret            |
| **none**  | NEVER                             | Algorithm confusion attack           |

### Token Structure

```typescript
// Required claims
interface JWTPayload {
  sub: string; // Subject (user ID)
  iss: string; // Issuer (your domain)
  aud: string; // Audience (API identifier)
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
  jti: string; // JWT ID (for revocation)

  // Retryvr custom claims
  userId: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  permissions: string[];
}
```

### Token Lifetime

| Token Type    | Lifetime   | Storage                            |
| ------------- | ---------- | ---------------------------------- |
| Access Token  | 15 minutes | HTTP-only cookie or memory         |
| Refresh Token | 7 days     | HTTP-only, Secure, SameSite cookie |
| ID Token      | 1 hour     | Memory only                        |

### Verification Pattern

```typescript
import jwt from 'jsonwebtoken';

// CRITICAL: Always verify, never just decode
function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, publicKey, {
      algorithms: ['RS256'], // Whitelist algorithms
      audience: 'api.retryvr.com', // Validate audience
      issuer: 'https://auth.retryvr.com',
      maxAge: '15m', // Enforce expiration
      complete: false,
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw error;
  }
}

// RED FLAG: Never use jwt.decode() for auth
// jwt.decode() does NOT verify signature!
```

### Retryvr Auth Middleware

```typescript
// apps/api/src/middleware/auth-middleware.ts
export async function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ['HS256'], // Or RS256 for production
    }) as JWTPayload;

    // Validate token structure
    if (!decoded.userId || !decoded.email || !decoded.role) {
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
      permissions: decoded.permissions || [],
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

## OAuth 2.0 Security (RFC 9700)

### Mandatory Requirements

1. **PKCE Required** for all public clients
2. **Refresh Token Rotation** - invalidate old token on use
3. **Audience Restriction** - validate `aud` claim
4. **Sender-Constrained Tokens** - bind to client certificate

### Deprecated Flows (MUST NOT USE)

| Flow     | Risk                     | Alternative               |
| -------- | ------------------------ | ------------------------- |
| Implicit | Token in URL, no refresh | Authorization Code + PKCE |
| ROPC     | Exposes credentials      | Authorization Code + PKCE |

### Authorization Code Flow with PKCE

```typescript
// 1. Generate PKCE challenge
const codeVerifier = crypto.randomBytes(32).toString('base64url');
const codeChallenge = crypto
  .createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');

// 2. Authorization request
const authUrl = new URL('https://auth.provider.com/authorize');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('scope', 'openid profile email');
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('code_challenge_method', 'S256');
authUrl.searchParams.set('state', generateState());

// 3. Token exchange (server-side)
const tokenResponse = await fetch('https://auth.provider.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier, // PKCE verification
  }),
});
```

---

## NextAuth.js Security

### Configuration Requirements

```typescript
// apps/web/src/auth.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET, // REQUIRED - strong, unique
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15 minutes
  },
  callbacks: {
    authorized({ request, auth }) {
      // Server-side authorization check
      const isAdmin = request.nextUrl.pathname.startsWith('/admin');
      if (isAdmin && auth?.user?.role !== 'ADMIN') {
        return false;
      }
      return !!auth;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      session.user.organizationId = token.organizationId;
      return session;
    },
  },
});
```

### Middleware Protection

```typescript
// apps/web/src/middleware.ts
import { auth } from './auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === 'ADMIN';

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin') && !isAdmin) {
    return Response.redirect(new URL('/unauthorized', req.url));
  }

  // Protect app routes
  if (req.nextUrl.pathname.startsWith('/app') && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.url));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### CVE-2025-29927 Mitigation

```typescript
// Block middleware bypass header
if (request.headers.get('x-middleware-subrequest')) {
  return new NextResponse('Forbidden', { status: 403 });
}
```

---

## Session Management

### Session Security Checklist

| Control                       | Implementation                        |
| ----------------------------- | ------------------------------------- |
| Regenerate on login           | `req.session.regenerate()` after auth |
| Secure cookie flags           | `httpOnly`, `secure`, `sameSite`      |
| Idle timeout                  | 15 minutes of inactivity              |
| Absolute timeout              | 8 hours maximum                       |
| Invalidate on logout          | Clear session server-side             |
| Invalidate on password change | Clear all user sessions               |

### Express Session Configuration

```typescript
import session from 'express-session';
import RedisStore from 'connect-redis';

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    name: 'sessionId', // Don't use default 'connect.sid'
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    },
  })
);
```

### Session Regeneration Pattern

```typescript
router.post('/login', async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);

  // Regenerate session to prevent fixation
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Session error' });

    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.loginTime = Date.now();

    res.json({ success: true });
  });
});
```

---

## Password Security

### Requirements

| Requirement    | Value                              |
| -------------- | ---------------------------------- |
| Minimum length | 12 characters                      |
| Complexity     | Not required (length > complexity) |
| Bcrypt cost    | 12 rounds                          |
| Breach check   | HaveIBeenPwned API                 |

### Implementation

```typescript
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  // Validate length
  if (password.length < 12) {
    throw new ValidationError('Password must be at least 12 characters');
  }

  // Check common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    throw new ValidationError('Password is too common');
  }

  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

---

## Authorization Patterns

### Role-Based Access Control (RBAC)

```typescript
// Middleware
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Usage
router.delete(
  '/users/:id',
  authenticate,
  requireRole('SUPER_ADMIN'),
  deleteUser
);
```

### Permission-Based Access Control (Preferred)

```typescript
// Middleware
export function requireFeatureAccess(feature: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!req.user.permissions.includes(feature)) {
      return res.status(403).json({ error: 'Feature access denied' });
    }
    next();
  };
}

// Usage
router.delete(
  '/users/:id',
  authenticate,
  requireFeatureAccess('user:delete'),
  deleteUser
);
```

---

## Red Flags - Stop Immediately

1. **`jwt.decode()` without `jwt.verify()`** - No signature verification
2. **`algorithms: ['none']`** - Allows unsigned tokens
3. **Token in URL** - Logged, cached, leaked in referrer
4. **localStorage for tokens** - XSS accessible
5. **`x-admin-override` header** - Privilege escalation via HTTP
6. **Hardcoded secrets** - Even "for testing"
7. **No expiration** - Infinite token lifetime
8. **Shared secrets across environments** - Dev/staging/prod must differ
