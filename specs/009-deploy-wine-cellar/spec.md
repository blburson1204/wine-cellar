---
meta:
  spec_id: '009'
  spec_name: deploy-wine-cellar
  status: draft
  phase: tasks
  created: 2026-03-29
  updated: 2026-03-29

summary:
  goals:
    - {
        id: G1,
        description: 'Deploy Wine Cellar to production (Vercel + Railway)',
        priority: HIGH,
      }
    - {
        id: G2,
        description:
          'Migrate image storage from local filesystem to cloud provider',
        priority: HIGH,
      }
    - {
        id: G3,
        description: 'Establish CI/CD pipeline for automatic deployments',
        priority: HIGH,
      }
    - {
        id: G4,
        description: 'Keep architecture portable for future AWS migration',
        priority: MEDIUM,
      }
  constraints:
    - {
        id: C1,
        description: 'Monthly cost must stay under $10 (free tiers preferred)',
        type: BUSINESS,
      }
    - {
        id: C2,
        description:
          'No vendor lock-in — storage and config must be abstractable',
        type: TECHNICAL,
      }
    - {
        id: C3,
        description: 'Existing 729+ tests must continue passing',
        type: TECHNICAL,
      }
    - {
        id: C4,
        description: 'Zero downtime for local development workflow',
        type: TECHNICAL,
      }
  decisions:
    - {
        id: D1,
        decision: 'Vercel for Next.js frontend',
        rationale: 'Native Next.js support, free tier, zero config CDN',
      }
    - {
        id: D2,
        decision: 'Railway for Express API + PostgreSQL',
        rationale: 'Simple PaaS, $5 credit/mo, no cold starts, always-on',
      }
    - {
        id: D3,
        decision: 'Cloudinary for image storage',
        rationale:
          '25GB free, good API, image transforms built-in, easy migration to S3
          later',
      }
    - {
        id: D4,
        decision: 'Custom domain: winescellar.net (Squarespace registrar)',
        rationale:
          'Already purchased; configure DNS records at Squarespace to point to
          Vercel',
      }
    - {
        id: D5,
        decision: 'Basic HTTP Auth for initial access control',
        rationale:
          'Fastest lockdown — browser-native login dialog, no UI to build. Real
          auth system is a follow-on project.',
      }

critical_requirements:
  type: config
  ui_changes: none
---

# Feature Specification: Deploy Wine Cellar to Production

**Feature Branch**: `009-deploy-wine-cellar` **Created**: 2026-03-29 **Status**:
Draft **Input**: Deploy Wine Cellar to production using Vercel (Next.js
frontend) and Railway (Express API + PostgreSQL). Migrate image storage to cloud
provider. Set up CI/CD and environment configuration. Keep architecture portable
for future AWS migration.

**Reference**:
[documents/aws-deployment-plan.md](../../documents/aws-deployment-plan.md)
(Vercel + Railway sections)

---

## User Scenarios & Testing

### Primary User Story

As the developer/sole user, I want Wine Cellar running on the internet so I can
access my wine collection from any device, anywhere — not just when my local dev
server is running.

### Acceptance Scenarios

1. **Given** the app is deployed, **When** I visit the production URL in a
   browser, **Then** I see the Wine Cellar dashboard with my wine collection
2. **Given** I push a commit to `main`, **When** CI passes, **Then** both
   frontend and API auto-deploy to production
3. **Given** I upload a wine label image in production, **When** the upload
   completes, **Then** the image is stored in Cloudinary and displays correctly
4. **Given** I run `npm run dev` locally, **When** the app starts, **Then**
   local development works exactly as before (local DB, local storage)
5. **Given** Railway PostgreSQL is running, **When** I run Prisma migrations,
   **Then** the production schema matches the local schema

### Edge Cases

- What happens when Cloudinary is unreachable during image upload? Return error,
  wine record saved without image.
- What happens when Railway DB connection drops? API returns 503, frontend shows
  connection error state.
- What happens when environment variables are missing at build time? Build fails
  with clear error message indicating which variable is missing.

---

## Requirements

### Functional Requirements

#### Environment Configuration

- **FR-001**: System MUST support distinct development and production
  environment configurations via environment variables
- **FR-002**: System MUST provide `.env.example` files documenting all required
  variables for each workspace (root, api, web, database)
- **FR-003**: Next.js MUST read the API URL from `NEXT_PUBLIC_API_URL`
  environment variable instead of hardcoding `localhost:3001`
- **FR-004**: API MUST read CORS allowed origins from `CORS_ORIGIN` environment
  variable (falling back to permissive in development)

#### Image Storage Migration

- **FR-005**: System MUST implement a `CloudinaryStorageService` that conforms
  to the existing `IStorageService` interface
- **FR-006**: Storage provider MUST be selected via `STORAGE_PROVIDER`
  environment variable (`local` for development, `cloudinary` for production)
- **FR-007**: Image upload MUST continue to process images through Sharp
  (resize/compress) before uploading to Cloudinary
- **FR-008**: Existing `Wine.imageUrl` field MUST store Cloudinary URLs in
  production (full URL) and filenames in development (current behavior)
- **FR-009**: Image retrieval endpoint MUST handle both local filenames and
  Cloudinary URLs transparently

#### Railway Deployment (API + Database)

- **FR-010**: API MUST be deployable to Railway from the `apps/api` directory
  via GitHub integration
- **FR-011**: Railway PostgreSQL MUST be configured as the production database
  via `DATABASE_URL`
- **FR-012**: Prisma migrations MUST run against Railway PostgreSQL during
  deployment
- **FR-013**: API MUST expose a health check endpoint (`GET /api/health`) that
  verifies database connectivity

#### Vercel Deployment (Frontend)

- **FR-014**: Next.js app MUST be deployable to Vercel from the `apps/web`
  directory
- **FR-015**: Vercel MUST be configured to proxy API requests to the Railway API
  URL (replacing the localhost rewrite)
- **FR-016**: Production builds MUST not reference `localhost` in any
  configuration

#### CI/CD Pipeline

- **FR-017**: GitHub Actions MUST run the existing test suite before deployment
- **FR-018**: Deployment MUST trigger automatically on push to `main` after CI
  passes
- **FR-019**: Vercel and Railway MUST deploy independently (frontend failure
  must not block API deployment and vice versa)

#### Custom Domain

- **FR-022**: Production frontend MUST be accessible at `winescellar.net`
- **FR-023**: DNS records MUST be configured at Squarespace (registrar) to point
  to Vercel
- **FR-024**: Vercel MUST provision SSL for the custom domain (automatic via
  Vercel)

#### Authentication (Simple Gate)

- **FR-025**: API MUST require HTTP Basic Auth on all routes except
  `GET /api/health` when `AUTH_USERNAME` and `AUTH_PASSWORD` env vars are set
- **FR-026**: Next.js MUST require HTTP Basic Auth on all pages when
  `AUTH_USERNAME` and `AUTH_PASSWORD` env vars are set
- **FR-027**: When auth env vars are NOT set (local development), auth MUST be
  skipped entirely — no login prompt
- **FR-028**: Auth credentials MUST be configured via `AUTH_USERNAME` and
  `AUTH_PASSWORD` environment variables (same values in Vercel and Railway)

#### Portability

- **FR-020**: All cloud service integrations MUST go through abstraction
  interfaces (storage interface already exists; follow this pattern)
- **FR-021**: No Vercel-specific or Railway-specific code in application logic —
  platform config stays in config files only (`vercel.json`, `railway.json`,
  environment variables)

### Key Entities

- **Environment Configuration**: Maps of environment variables per workspace,
  with validation at startup
- **StorageProvider**: Abstraction over local filesystem and Cloudinary (and
  future S3), selected by environment variable
- **Deployment Target**: Vercel (frontend) and Railway (API + DB) as independent
  deployment units

### Test Strategy

**Test Type Classification**:

| FR         | Primary Test Type  | Reason                                                          |
| ---------- | ------------------ | --------------------------------------------------------------- |
| FR-001–004 | Integration        | Environment config affects app startup behavior                 |
| FR-005–009 | Unit + Integration | Storage service needs unit tests; upload flow needs integration |
| FR-010–013 | Integration        | Railway deploy verified by health check and migration scripts   |
| FR-014–016 | Integration        | Vercel config verified by build + API proxy behavior            |
| FR-017–019 | Integration        | CI/CD pipeline verified by workflow file and deploy triggers    |
| FR-020–021 | Code review        | Portability verified by absence of vendor-specific app code     |

**This Feature**:

- Feature type: [X] Backend-heavy [ ] Frontend-heavy [ ] Mixed
- Unit: 40% | Integration: 50% | E2E: 10%

**Estimated Test Count**: ~25 tests

- CloudinaryStorageService unit tests: ~10
- Environment config validation tests: ~5
- Health check endpoint tests: ~3
- API proxy / URL configuration tests: ~4
- Image URL handling (local vs cloud) tests: ~3

### Error Handling & Recovery

| Error Scenario                    | Type      | User Message                                     | Recovery Action                               |
| --------------------------------- | --------- | ------------------------------------------------ | --------------------------------------------- |
| Cloudinary upload fails           | Transient | "Image upload failed. Wine saved without image." | Save wine record, skip image, log error       |
| Cloudinary unreachable at startup | Permanent | N/A (startup continues)                          | Log warning, image uploads fail gracefully    |
| Missing required env var          | Permanent | Build/startup fails with clear message           | Developer fixes .env configuration            |
| Railway DB connection lost        | Transient | API returns 503                                  | Health check reports unhealthy, auto-restart  |
| Prisma migration fails on Railway | Permanent | Deploy fails                                     | Developer reviews migration, fixes, redeploys |

**Resumability**:

- [x] Operation can resume from last checkpoint? (Deployments are idempotent)
- [x] Idempotency guaranteed? (Re-deploying same commit produces same result)

### UI/Design Reference

**Feature Classification**:

- [x] **Backend-only** (no UI changes) - Skip design sections

No UI changes. All work is infrastructure, configuration, and storage service
implementation. The frontend behaves identically — it just runs on Vercel
instead of localhost.

---

## Review Checklist (Gate)

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Test strategy defined
- [x] Error handling defined
- [x] UI complexity classified (backend-only, no UI changes)
