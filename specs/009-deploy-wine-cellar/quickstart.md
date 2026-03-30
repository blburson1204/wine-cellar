# Quickstart: 009 Deploy Wine Cellar

**Date**: 2026-03-29

## Verification Scenarios

These scenarios validate the deployment end-to-end. They map directly to the
spec acceptance scenarios.

### QS-1: Local Development Still Works

```bash
# Start local dev
npm run dev

# Verify API responds
curl http://localhost:3001/api/health
# Expected: {"status":"ok","database":"connected",...}

# Verify frontend loads
open http://localhost:3000
# Expected: Wine Cellar dashboard renders with wine list
```

### QS-2: CloudinaryStorageService Unit Tests Pass

```bash
npm run test:api -- --grep "CloudinaryStorageService"
# Expected: All tests pass (upload, delete, URL generation, error handling)
```

### QS-3: Storage Provider Switching

```bash
# Default (no env var) → LocalStorageService
STORAGE_PROVIDER=local npm run test:api -- --grep "storage"

# Cloudinary provider
STORAGE_PROVIDER=cloudinary npm run test:api -- --grep "storage"
```

### QS-4: Environment Configuration

```bash
# Missing required var in production → startup fails with clear message
NODE_ENV=production npm run start:api 2>&1 | head -5
# Expected: Error message about missing CLOUDINARY_CLOUD_NAME (or similar)
```

### QS-5: Production API Health Check

```bash
curl https://<railway-api-url>/api/health
# Expected: {"status":"ok","database":"connected",...}
```

### QS-6: Production Frontend

```bash
curl -I https://winescellar.net
# Expected: HTTP 200, served by Vercel
```

### QS-7: Production Image Upload

```bash
# Upload image via production frontend
# Expected: Image stored in Cloudinary, visible in wine detail view
# Cloudinary dashboard shows image in wine-cellar/wines/ folder
```

### QS-8: Full CI/CD Pipeline

```bash
# Push commit to main
git push origin main

# Expected:
# 1. GitHub Actions CI passes (lint, type-check, test, build)
# 2. Vercel auto-deploys frontend
# 3. Railway auto-deploys API
```

### QS-9: All Existing Tests Still Pass

```bash
npm test
# Expected: 729+ tests pass, no regressions
```
