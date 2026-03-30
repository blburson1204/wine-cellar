# Deployment Runbook: Wine Cellar on Vercel + Railway

Step-by-step guide to deploy Wine Cellar to production. Assumes all code changes
from spec 009 are on `main`.

---

## Step 1: Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and sign up (free tier)
2. From the Dashboard, note these three values:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (numeric)
   - **API Secret** (alphanumeric)
3. You'll enter these as env vars in Railway (Step 3)

---

## Step 2: Create Railway Project + PostgreSQL

1. Go to [railway.app](https://railway.app) and sign up (connect with GitHub)
2. Click **New Project** > **Deploy from GitHub repo**
3. Select the `wine-cellar` repository
4. Railway will auto-detect `railway.json` at the repo root

### Add PostgreSQL

5. In the Railway project, click **+ New** > **Database** > **PostgreSQL**
6. Railway provisions the database and provides `DATABASE_URL` automatically
7. Click the PostgreSQL service > **Variables** tab > copy the `DATABASE_URL`
   value (you'll need it for the API service)

### Configure API Service

8. Click the API service (your GitHub repo deployment)
9. Go to **Settings** tab:
   - **Root Directory**: leave empty (railway.json is at repo root)
   - Railway reads `railway.json` for build/start commands automatically
10. Go to **Variables** tab and add:

```
DATABASE_URL=<paste from PostgreSQL service, or use Railway's variable reference: ${{Postgres.DATABASE_URL}}>
NODE_ENV=production
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=<from Step 1>
CLOUDINARY_API_KEY=<from Step 1>
CLOUDINARY_API_SECRET=<from Step 1>
CORS_ORIGIN=https://winescellar.net
AUTH_USERNAME=<choose a username>
AUTH_PASSWORD=<choose a strong password>
```

11. Railway will auto-deploy. Wait for the build to complete.
12. **Verify**: Click the deployment URL and append `/api/health`
    - Expected: `{"status":"ok","database":"connected",...}`
    - Note the public URL (e.g.,
      `https://wine-cellar-api-production.up.railway.app`)

### Run Prisma Migrations

13. In Railway, go to the API service > **Settings** > **Deploy** section
14. Alternatively, you can run migrations via Railway CLI:

```bash
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Run migrations
railway run npx prisma db push --schema=packages/database/prisma/schema.prisma
```

Or add a one-time deploy command in Railway settings that runs migrations before
start.

---

## Step 3: Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign up (connect with GitHub)
2. Click **Add New** > **Project** > Import the `wine-cellar` repository
3. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `apps/web`
   - **Build Command**: (leave default — Vercel handles it)
4. Add environment variables:

```
NEXT_PUBLIC_API_URL=<Railway API URL from Step 2, e.g., https://wine-cellar-api-production.up.railway.app>
AUTH_USERNAME=<same username as Railway>
AUTH_PASSWORD=<same password as Railway>
```

5. Click **Deploy**
6. **Verify**: Visit the Vercel deployment URL
   - Expected: Browser shows Basic Auth prompt
   - After login: Wine Cellar dashboard loads

---

## Step 4: Configure Custom Domain (winescellar.net)

### In Vercel

1. Go to your Vercel project > **Settings** > **Domains**
2. Add `winescellar.net`
3. Vercel will show DNS records you need to add:
   - Typically an **A record** pointing to `76.76.21.21`
   - And a **CNAME** for `www` pointing to `cname.vercel-dns.com`

### In Squarespace

4. Go to [account.squarespace.com](https://account.squarespace.com)
5. Select your `winescellar.net` domain > **DNS Settings**
6. Add the records Vercel specified:
   - **A Record**: Host `@`, Value `76.76.21.21`
   - **CNAME Record**: Host `www`, Value `cname.vercel-dns.com`
7. If Squarespace has existing default records, you may need to remove
   conflicting ones

### Verify

8. DNS propagation takes 5-60 minutes (sometimes up to 48 hours)
9. Vercel automatically provisions an SSL certificate once DNS propagates
10. **Verify**: Visit `https://winescellar.net`
    - Expected: SSL lock icon, Basic Auth prompt, then Wine Cellar dashboard

---

## Step 5: Smoke Test Production

Run through these checks:

| Test             | How                                                           | Expected                                    |
| ---------------- | ------------------------------------------------------------- | ------------------------------------------- |
| Health check     | `curl https://<railway-url>/api/health`                       | `{"status":"ok","database":"connected"}`    |
| Auth blocks      | `curl -I https://winescellar.net`                             | 401 Unauthorized                            |
| Auth works       | Visit `https://winescellar.net` in browser, enter credentials | Dashboard loads                             |
| View wines       | Navigate the wine list                                        | Wines display correctly                     |
| Add wine         | Create a new wine entry                                       | Wine saved, appears in list                 |
| Upload image     | Upload a wine label image                                     | Image stored in Cloudinary, displays in app |
| API via frontend | All CRUD operations                                           | No CORS errors, data persists               |
| Custom domain    | Visit `https://winescellar.net`                               | SSL valid, app loads                        |

---

## Step 6: Ongoing Deployment (CI/CD)

Deployments are automatic after this initial setup:

1. Push code to `main`
2. GitHub Actions runs CI (lint, type-check, tests)
3. **Vercel** auto-deploys frontend (watches `main` branch)
4. **Railway** auto-deploys API (watches `main` branch)

Both deploy independently. A frontend failure does not block API deployment and
vice versa.

---

## Environment Variable Reference

| Variable                | Railway (API) | Vercel (Web) | Value                        |
| ----------------------- | :-----------: | :----------: | ---------------------------- |
| `DATABASE_URL`          |       X       |              | Railway PostgreSQL reference |
| `NODE_ENV`              |       X       |              | `production`                 |
| `STORAGE_PROVIDER`      |       X       |              | `cloudinary`                 |
| `CLOUDINARY_CLOUD_NAME` |       X       |              | From Cloudinary dashboard    |
| `CLOUDINARY_API_KEY`    |       X       |              | From Cloudinary dashboard    |
| `CLOUDINARY_API_SECRET` |       X       |              | From Cloudinary dashboard    |
| `CORS_ORIGIN`           |       X       |              | `https://winescellar.net`    |
| `AUTH_USERNAME`         |       X       |      X       | Same value in both           |
| `AUTH_PASSWORD`         |       X       |      X       | Same value in both           |
| `NEXT_PUBLIC_API_URL`   |               |      X       | Railway API public URL       |

---

## Troubleshooting

| Problem                | Likely Cause                            | Fix                                                            |
| ---------------------- | --------------------------------------- | -------------------------------------------------------------- |
| API returns 503        | Database not connected                  | Check `DATABASE_URL` in Railway vars                           |
| CORS errors in browser | `CORS_ORIGIN` mismatch                  | Set to exact frontend URL including `https://`                 |
| Images not uploading   | Cloudinary credentials wrong            | Verify `CLOUDINARY_*` vars match dashboard                     |
| Auth not prompting     | `AUTH_USERNAME`/`AUTH_PASSWORD` not set | Add both vars to Railway AND Vercel                            |
| DNS not resolving      | Records not propagated                  | Wait up to 48 hours; verify records in Squarespace             |
| Build fails on Railway | npm workspace issue                     | Check Railway build logs for missing deps                      |
| Build fails on Vercel  | Missing `NEXT_PUBLIC_API_URL`           | Env var must be set before build (it's baked in at build time) |

---

## Cost Summary

| Service     | Tier                | Monthly Cost   |
| ----------- | ------------------- | -------------- |
| Cloudinary  | Free (25GB storage) | $0             |
| Railway     | Hobby ($5 credit)   | $0-5           |
| Vercel      | Hobby (free)        | $0             |
| Squarespace | Domain renewal      | ~$20/year      |
| **Total**   |                     | **$0-5/month** |
