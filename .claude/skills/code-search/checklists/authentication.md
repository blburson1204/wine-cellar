# Authentication Audit Checklist

## Session Management

- [ ] Sessions stored server-side (not just JWT)
- [ ] Session ID is cryptographically random
- [ ] Session expires after inactivity (configurable)
- [ ] Session invalidated on logout
- [ ] Session invalidated on password change

## Password Security

- [ ] Passwords hashed with bcrypt/argon2 (cost 10+)
- [ ] Plaintext passwords never logged
- [ ] Minimum password length enforced (8+ chars)
- [ ] Password complexity rules (optional but checked)
- [ ] Breached password check (optional)

## Login Flow

- [ ] Rate limiting on login attempts (5/min per IP)
- [ ] Account lockout after failures (10 attempts)
- [ ] Generic error messages (no user enumeration)
- [ ] Timing-safe password comparison
- [ ] HTTPS enforced for all auth endpoints

## Token Management

- [ ] Access tokens short-lived (15-60 min)
- [ ] Refresh tokens rotated on use
- [ ] Tokens invalidated on logout
- [ ] Token storage: httpOnly cookies (not localStorage)
- [ ] CSRF protection on cookie-based auth

## API Endpoints

- [ ] `POST /api/v1/auth/login` - Authenticate user
- [ ] `POST /api/v1/auth/logout` - End session
- [ ] `POST /api/v1/auth/refresh` - Refresh access token
- [ ] `POST /api/v1/auth/forgot-password` - Initiate reset
- [ ] `POST /api/v1/auth/reset-password` - Complete reset
- [ ] `GET /api/v1/auth/me` - Current user info

## Password Reset

- [ ] Reset tokens single-use
- [ ] Reset tokens expire (1 hour max)
- [ ] Reset invalidates all sessions
- [ ] Rate limiting on reset requests
- [ ] Generic response (no user enumeration)

## Frontend Integration

- [ ] Auth state persisted appropriately
- [ ] Automatic redirect on session expiry
- [ ] Token refresh before expiry
- [ ] Logout clears all local state
