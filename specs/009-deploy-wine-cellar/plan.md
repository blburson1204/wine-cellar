---
meta:
  spec_id: '009'
  spec_name: deploy-wine-cellar
  phase: plan
  updated: 2026-03-29

summary:
  tech_stack: [TypeScript, Express, Next.js 15, Prisma, Cloudinary, Sharp]
  external_deps: [Cloudinary API, Vercel, Railway, Squarespace DNS]
  test_strategy: { unit: 10, integration: 12, e2e: 3 }
  deployment: immediate
---

# Implementation Plan: Deploy Wine Cellar to Production

**Branch**: `009-deploy-wine-cellar` | **Date**: 2026-03-29 | **Spec**:
[spec.md](spec.md) **Input**: Feature specification from
`specs/009-deploy-wine-cellar/spec.md`

## Summary

Deploy Wine Cellar to production using Vercel (frontend) + Railway (API +
PostgreSQL). Implement CloudinaryStorageService for cloud image storage,
environment-based configuration, and platform config files. Architecture stays
portable for future AWS migration by keeping all cloud integrations behind
existing abstraction interfaces.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 **Primary Dependencies**:
Express, Next.js 15, Prisma, `cloudinary` (new), Sharp (existing) **Storage**:
PostgreSQL (Railway), Cloudinary (images) **Testing**: Vitest, Supertest, React
Testing Library **Target Platform**: Vercel (frontend), Railway (API) **Project
Type**: Monorepo (npm workspaces) — `apps/api`, `apps/web`, `packages/database`
**Constraints**: Under $10/month, no vendor lock-in in application code
**Scale/Scope**: Single user, personal wine collection app

## Constitution Check

| Gate                           | Status | Notes                                                        |
| ------------------------------ | ------ | ------------------------------------------------------------ |
| TDD                            | PASS   | CloudinaryStorageService tests written before implementation |
| Spec-driven                    | PASS   | Full SpecKit pipeline in use                                 |
| Verification before completion | PASS   | Health check, quickstart scenarios defined                   |
| Skills before action           | PASS   | Skill manifest checked, relevant skills logged               |
| Code review                    | PASS   | Will run code-review before merge                            |

**AI & Machine Learning**: Not applicable — no AI/ML in this feature.

## Project Structure

### Documentation (this feature)

```
specs/009-deploy-wine-cellar/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0 research output
├── data-model.md        # Phase 1 data model (no schema changes)
├── quickstart.md        # Verification scenarios
├── contracts/           # Phase 1 contracts
│   ├── cloudinary-storage.contract.ts
│   ├── environment.contract.ts
│   └── deployment.contract.ts
└── tasks.md             # Created by /tasks (not /plan)
```

### Source Code Changes

```
apps/
  api/
    src/
      config/
        storage.ts                    # MODIFY: add Cloudinary config, STORAGE_PROVIDER
      services/
        storage/
          index.ts                    # MODIFY: factory returns Cloudinary or Local
          storage.interface.ts        # NO CHANGE
          local-storage.service.ts    # NO CHANGE
          cloudinary-storage.service.ts  # NEW: implements IStorageService
      app.ts                          # MODIFY: CORS_ORIGIN env var, image redirect logic
    .env.example                      # NEW
  web/
    next.config.js                    # MODIFY: env var for API URL
    .env.example                      # NEW
packages/
  database/
    .env.example                      # NEW
.env.example                          # NEW (root)
railway.json                          # NEW: Railway deployment config
```

## Phase 0.1: Research & Testing Strategy

**Output**: [research.md](research.md)

### Research Summary

| Topic               | Decision                                              | Reference |
| ------------------- | ----------------------------------------------------- | --------- |
| Cloud image storage | Cloudinary (`cloudinary` npm pkg v2.x)                | R1        |
| API deployment      | Railway with GitHub integration                       | R2        |
| Frontend deployment | Vercel with GitHub integration                        | R3        |
| Existing code reuse | IStorageService, factory, health check — all reusable | R4        |
| Image URL handling  | Redirect for cloud URLs, serve file for local         | R5        |
| CI/CD approach      | Existing GitHub Actions for CI; Vercel/Railway for CD | R6        |

### Testing Strategy

**Feature type**: Backend-heavy **External APIs**: Cloudinary API — Risk: LOW
(free tier, well-documented, mockable) **E2E permitted**: Yes (limit 3 — smoke
tests for production endpoints) **Mocking strategy**: Mock `cloudinary` SDK in
unit tests; real API not called

| Check            | Output                                             |
| ---------------- | -------------------------------------------------- |
| External APIs    | Cloudinary — Risk: LOW                             |
| Test types       | Unit + Integration                                 |
| E2E permitted    | Yes (3 max)                                        |
| Mocking strategy | Mock `cloudinary` SDK, mock `fs` for local storage |

**Testing Summary**:

```
Feature type: Backend-heavy
Quota risks: None (Cloudinary free tier: 25GB)
Estimated tests: ~25
Distribution: Unit 40%, Integration 50%, E2E 10%
```

## Phase 0.2: Permissions Design

**SKIPPED** — No roles or permissions in spec.

## Phase 0.3: Integration Analysis

### Codebase Pattern Discovery

| Pattern Area      | Finding                                                       |
| ----------------- | ------------------------------------------------------------- |
| Storage service   | `IStorageService` interface + `LocalStorageService` + factory |
| Storage injection | Singleton via `createStorageService()` in `index.ts`          |
| Image pipeline    | Multer (memory) → validate → optimize (Sharp) → store         |
| CORS              | `app.use(cors())` — permissive, no config                     |
| API URL routing   | Next.js rewrites `/api/*` → `localhost:3001` (hardcoded)      |
| Health check      | EXISTS at `GET /api/health` — checks DB connectivity          |
| Response format   | `{ status, data }` or direct JSON arrays                      |
| Error handling    | AppError classes → errorHandler middleware                    |

### Code Reuse Analysis

| Pattern Needed            | Current State                                   | Decision                               |
| ------------------------- | ----------------------------------------------- | -------------------------------------- |
| `IStorageService`         | EXISTS — full interface with 4 methods          | REUSE                                  |
| `createStorageService()`  | EXISTS — factory, returns `LocalStorageService` | EXTEND — add Cloudinary branch         |
| `optimizeImage()`         | EXISTS — Sharp resize/compress/JPEG convert     | REUSE — runs before cloud upload       |
| `validateImage()`         | EXISTS — size/MIME/magic number checks          | REUSE — runs before cloud upload       |
| Health check endpoint     | EXISTS — `GET /api/health` with DB check        | REUSE — FR-013 already satisfied       |
| CORS middleware           | EXISTS — `app.use(cors())`                      | EXTEND — read from `CORS_ORIGIN` env   |
| LocalStorageService tests | EXISTS — full unit test suite                   | REUSE as template for Cloudinary tests |

### Image Endpoint Update (GET /api/wines/:id/image)

Current behavior: resolves `wine.imageUrl` to a local file path, serves with
`res.sendFile()`.

Required change: if `wine.imageUrl` starts with `http`, redirect to that URL
instead of looking for a local file. This handles Cloudinary URLs transparently.

```
if (wine.imageUrl.startsWith('http')) {
  return res.redirect(wine.imageUrl);
}
// ... existing local file logic
```

This is backwards-compatible — existing local filenames don't start with `http`.

## Phase 0.4: Design Pre-flight

**SKIPPED** — Backend-only, no UI changes.

## Phase 0.5: Infrastructure & Migrations

### Environment Variables

| Variable                | Workspace     | Source                | Dev Default                                   |
| ----------------------- | ------------- | --------------------- | --------------------------------------------- |
| `DATABASE_URL`          | api, database | Railway PostgreSQL    | `postgresql://...@localhost:5433/wine_cellar` |
| `NODE_ENV`              | api           | Platform-set          | `development`                                 |
| `PORT`                  | api           | Railway-provided      | `3001`                                        |
| `STORAGE_PROVIDER`      | api           | `.env` / platform env | `local`                                       |
| `CLOUDINARY_CLOUD_NAME` | api           | Platform env          | —                                             |
| `CLOUDINARY_API_KEY`    | api           | Platform env          | —                                             |
| `CLOUDINARY_API_SECRET` | api           | Platform env          | —                                             |
| `CORS_ORIGIN`           | api           | Platform env          | `*` (permissive)                              |
| `NEXT_PUBLIC_API_URL`   | web           | Platform env          | `http://localhost:3001`                       |

### Migrations

**None.** No database schema changes. The `Wine.imageUrl` field (String?)
already accommodates both filenames and full URLs.

### Deployment Order

```
1. Railway: Provision PostgreSQL database
2. Railway: Deploy API (with DATABASE_URL, CLOUDINARY_*, CORS_ORIGIN)
3. Railway: Run Prisma migrations (npm run db:push)
4. Verify: curl /api/health returns "connected"
5. Vercel: Deploy frontend (with NEXT_PUBLIC_API_URL pointing to Railway)
6. Verify: winescellar.net loads and can reach API
7. Squarespace: Configure DNS records for winescellar.net → Vercel
8. Verify: SSL provisioned, custom domain working
```

**Rollout**: Immediate (no feature flags needed — this is the initial production
deployment)

## Phase 1: Design & Contracts

### Contracts

1. **[cloudinary-storage.contract.ts](contracts/cloudinary-storage.contract.ts)**:
   CloudinaryStorageService implementing IStorageService, storage factory update
2. **[environment.contract.ts](contracts/environment.contract.ts)**: Environment
   variable schemas per workspace, validation behavior
3. **[deployment.contract.ts](contracts/deployment.contract.ts)**: Platform
   config file shapes (railway.json, next.config.js updates, .env.example files)

### Data Model

**[data-model.md](data-model.md)**: No schema changes. Documents the
CloudinaryStorageService entity, config structure, and full environment variable
map.

### Quickstart

**[quickstart.md](quickstart.md)**: 9 verification scenarios covering local dev,
unit tests, storage switching, env validation, production health, frontend,
image upload, CI/CD pipeline, and test regression.

## Phase 2: Task Planning Approach

_Executed by /tasks command, NOT /plan_

**Strategy**: Tasks ordered by dependency chain:

| Order | Task Area                                   | Depends On               | FR Coverage            |
| ----- | ------------------------------------------- | ------------------------ | ---------------------- |
| 1     | Environment config + .env.example files     | —                        | FR-001, FR-002         |
| 2     | CORS_ORIGIN configuration                   | —                        | FR-004                 |
| 3     | CloudinaryStorageService (TDD)              | Env config               | FR-005, FR-006, FR-007 |
| 4     | Storage factory update                      | CloudinaryStorageService | FR-006                 |
| 5     | Image endpoint update (redirect for URLs)   | —                        | FR-008, FR-009         |
| 6     | Next.js config update (env var for API URL) | —                        | FR-003, FR-015, FR-016 |
| 7     | Railway config (railway.json)               | —                        | FR-010, FR-011, FR-012 |
| 8     | Vercel config (if needed beyond dashboard)  | —                        | FR-014                 |
| 9     | DNS configuration docs                      | —                        | FR-022, FR-023, FR-024 |
| 10    | Verification (all tests pass, quickstart)   | All above                | All FRs                |

**Constraints**: TDD for CloudinaryStorageService (mock Cloudinary SDK). All
existing 729+ tests must continue passing.

## Progress Tracking

| Phase                  | Status                       | Skip If              |
| ---------------------- | ---------------------------- | -------------------- |
| 0.1 Research + Testing | [X] COMPLETE                 | Never                |
| 0.2 Permissions        | [X] SKIPPED                  | No roles in spec     |
| 0.3 Integration        | [X] COMPLETE                 | Never                |
| 0.4 Design Pre-flight  | [X] SKIPPED                  | Backend-only         |
| 0.5 Infrastructure     | [X] COMPLETE                 | Never (has env vars) |
| 1 Design & Contracts   | [X] COMPLETE                 | —                    |
| 2 Task Planning        | [X] COMPLETE (approach only) | —                    |

**Gates**: Constitution Check PASS, All phases complete, No NEEDS CLARIFICATION
remaining.
