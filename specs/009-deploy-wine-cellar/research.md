# Research: 009 Deploy Wine Cellar

**Date**: 2026-03-29

## R1: Cloudinary Node.js SDK

**Decision**: Use `cloudinary` npm package (v2.x) for image uploads
**Rationale**: Official SDK, well-maintained, supports upload from buffer via
`upload_stream`, automatic URL generation **Alternatives**:
`@cloudinary/url-gen` (URL-only, no upload), direct REST API (more code, no
benefit)

**Key API patterns**:

- `cloudinary.config({ cloud_name, api_key, api_secret })` — one-time setup
- `cloudinary.uploader.upload_stream({ folder, public_id })` — stream upload
  from buffer
- `cloudinary.uploader.destroy(public_id)` — delete by public_id
- Returns `{ secure_url, public_id, bytes, format }` — `secure_url` is what we
  store in `Wine.imageUrl`

**Environment variables needed**:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## R2: Railway Deployment for Express Monorepo

**Decision**: Use Railway's GitHub integration with `apps/api` as root directory
**Rationale**: Railway auto-detects Node.js, runs `npm install` +
`npm run build`

- `npm start`. No Dockerfile needed initially. **Alternatives**: Docker
  deployment (more control, unnecessary complexity for now)

**Key configuration**:

- Set root directory to `apps/api` in Railway project settings
- Railway provides `PORT` env var automatically — API already reads
  `process.env.PORT`
- Set `DATABASE_URL` from Railway PostgreSQL plugin (auto-provisioned)
- Run Prisma migrations via deploy command or Railway's deploy hooks

**Monorepo challenge**: Railway builds from subdirectory but npm workspaces need
root `package.json`. Solution: use `railway.json` with custom build command that
runs from repo root, or use nixpacks config.

**Railway deploy command**: Can set custom start command:
`cd apps/api && npm start` with build:
`npm ci && npm run db:generate && npm run build` from the root.

## R3: Vercel Deployment for Next.js Monorepo

**Decision**: Use Vercel's GitHub integration with `apps/web` as root directory
**Rationale**: Vercel has native Next.js support, auto-detects monorepo
structure **Alternatives**: Netlify (less Next.js integration), self-host
(unnecessary)

**Key configuration**:

- Set root directory to `apps/web` in Vercel project settings
- Vercel auto-installs dependencies and builds Next.js
- API rewrites in `next.config.js` must point to Railway API URL in production
- Use `NEXT_PUBLIC_API_URL` env var for rewrite destination
- Custom domain `winescellar.net` added in Vercel dashboard

**Important**: Frontend uses relative `/api/*` paths everywhere — the Next.js
rewrite handles routing to the correct backend. This pattern works identically
on Vercel.

## R4: Existing Codebase Assets (Reuse Analysis)

| Asset                                | Status | Reuse Decision                                   |
| ------------------------------------ | ------ | ------------------------------------------------ |
| `IStorageService` interface          | EXISTS | REUSE — CloudinaryStorageService implements this |
| `createStorageService()` factory     | EXISTS | EXTEND — add Cloudinary branch                   |
| Storage config (`config/storage.ts`) | EXISTS | EXTEND — add Cloudinary config                   |
| Health check (`GET /api/health`)     | EXISTS | REUSE — already checks DB connectivity           |
| Image processing (`optimizeImage()`) | EXISTS | REUSE — Sharp processing stays pre-upload        |
| Image validation (`validateImage()`) | EXISTS | REUSE — validation stays pre-upload              |
| `LocalStorageService` tests          | EXISTS | REUSE as pattern — mirror for Cloudinary tests   |
| CORS middleware                      | EXISTS | EXTEND — add `CORS_ORIGIN` env var               |

## R5: Image Retrieval Strategy for Cloud URLs

**Decision**: When `Wine.imageUrl` contains a full URL (starts with `http`),
return redirect or proxy. When it's a filename, serve from local disk (current
behavior). **Rationale**: Cloudinary URLs are direct-access CDN URLs. No need to
proxy through our API — just redirect.

**Implementation**: In `GET /api/wines/:id/image`:

- If `wine.imageUrl` starts with `http` → `res.redirect(wine.imageUrl)`
- If `wine.imageUrl` is a filename → current local file serving logic

This is backwards-compatible and transparent to the frontend (same endpoint,
same behavior from the client's perspective).

## R6: CI/CD Strategy

**Decision**: Keep Vercel and Railway's built-in GitHub integrations for
deployment. Existing GitHub Actions workflow stays for CI only. **Rationale**:
Both Vercel and Railway have native GitHub integration that deploys on push to
main. Adding deployment to GitHub Actions would duplicate this and add
complexity.

**Flow**: Push to main → GitHub Actions runs CI (lint, type-check, test, build)
→ Vercel auto-deploys frontend → Railway auto-deploys API

The existing `code-quality.yml` workflow already covers FR-017. FR-018 is
handled by Vercel/Railway's GitHub integration. FR-019 is inherent (separate
services).
