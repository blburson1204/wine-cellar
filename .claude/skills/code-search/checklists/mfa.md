# MFA Audit Checklist

## Database Schema

- [ ] `User.mfaEnabled` field exists (boolean)
- [ ] `User.mfaSecret` field exists (encrypted string)
- [ ] `User.mfaRecoveryCodes` field exists (array/JSON)
- [ ] `User.mfaMethod` field exists (enum: TOTP, SMS, etc.)

## API Endpoints

- [ ] `POST /api/v1/auth/mfa/setup` - Initialize MFA
- [ ] `POST /api/v1/auth/mfa/verify` - Verify code during setup
- [ ] `POST /api/v1/auth/mfa/enable` - Enable after verification
- [ ] `POST /api/v1/auth/mfa/disable` - Disable with verification
- [ ] `POST /api/v1/auth/mfa/challenge` - Request code during login
- [ ] `POST /api/v1/auth/mfa/recovery` - Use recovery code

## Security Requirements

- [ ] TOTP uses 6+ digits
- [ ] TOTP window is 30 seconds (±1 allowed)
- [ ] Secrets stored encrypted, never plaintext
- [ ] Recovery codes: 8+ codes, single-use
- [ ] Rate limiting on verification attempts (5/min)
- [ ] Lockout after repeated failures (10 attempts)

## Login Flow Integration

- [ ] MFA check occurs AFTER password verification
- [ ] MFA check occurs BEFORE session creation
- [ ] Session not created until MFA complete
- [ ] Partial auth state doesn't grant access

## Frontend Components

- [ ] Setup wizard with QR code display
- [ ] Code input component (6-digit)
- [ ] Recovery code display (one-time view)
- [ ] MFA toggle in security settings
- [ ] Challenge screen during login

## Admin Controls

- [ ] Admin can view MFA status (not secrets)
- [ ] Admin can reset MFA for user
- [ ] Audit log for MFA enable/disable/reset
