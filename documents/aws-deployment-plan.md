# Wine Cellar Deployment Plan

## Current Production Deployment (Deployed March 2026)

Wine Cellar is live at **[winescellar.net](https://winescellar.net)** using the
Vercel + Railway stack. See [deployment-runbook.md](deployment-runbook.md) for
operational details.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────┐         ┌─────────────────────────────┐   │
│  │   Vercel    │         │  Railway                    │   │
│  │  (Next.js)  │ ──API──▶│  (Express API + PostgreSQL) │   │
│  │  FREE tier  │         │  $0-5/mo                    │   │
│  └─────────────┘         └─────────────────────────────┘   │
│         │                          │                        │
│         │                          ▼                        │
│     winescellar.net      ┌─────────────────┐               │
│     (Squarespace DNS)    │   Cloudinary    │               │
│                          │  (Images) FREE  │               │
│                          └─────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### What's Deployed

| Component                | Service                                | URL                                      | Cost             |
| ------------------------ | -------------------------------------- | ---------------------------------------- | ---------------- |
| Frontend (Next.js 15)    | Vercel                                 | winescellar.net                          | Free             |
| API (Express)            | Railway                                | wine-cellarapi-production.up.railway.app | ~$0-5/mo         |
| Database (PostgreSQL)    | Railway                                | Internal to Railway project              | Included         |
| Images (270 wine labels) | Cloudinary                             | CDN URLs                                 | Free (25GB tier) |
| Domain                   | Squarespace (registrar) → Vercel (DNS) | winescellar.net                          | ~$20/yr          |

### Key Configuration

- **Authentication**: HTTP Basic Auth on all routes (env vars: `AUTH_USERNAME`,
  `AUTH_PASSWORD`). Planned upgrade to real auth system (Feature 005).
- **Image storage**: `STORAGE_PROVIDER=cloudinary` in production,
  `STORAGE_PROVIDER=local` in development
- **CI/CD**: Push to `main` → GitHub Actions CI → Vercel + Railway auto-deploy
- **Health check**: `GET /api/health` (unauthenticated, used by Railway
  monitoring)

### Implementation Reference

- **Spec**: `specs/009-deploy-wine-cellar/`
- **Runbook**: [deployment-runbook.md](deployment-runbook.md)
- **Environment variables**: See runbook for full reference table

---

## Cost Comparison: Current vs AWS

| Approach                       | Monthly Cost | Complexity | Best For                               |
| ------------------------------ | ------------ | ---------- | -------------------------------------- |
| **Vercel + Railway** (current) | $0-5         | Low        | Personal use, always-on                |
| Vercel + Supabase              | $0           | Low        | If using Supabase features             |
| Vercel + Neon                  | $0           | Low        | Minimal usage, OK with cold starts     |
| **Full AWS**                   | $50-110      | High       | Production, multiple users, compliance |

---

## Future: AWS Migration Reference

> This section is reference material for a potential future AWS migration. It is
> NOT the current deployment. Brian plans to use this as a learning exercise for
> applying AWS patterns at his company.

### When to Upgrade to AWS

Consider moving to AWS when:

- Multiple users need the app simultaneously
- You need guaranteed uptime SLAs
- Storage needs exceed free tier limits
- You want more control over infrastructure
- Compliance requirements demand it

### Recommended AWS Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │  CloudFront │───▶│   S3 (web)  │    │   RDS PostgreSQL    │  │
│  │    (CDN)    │    │  or Amplify │    │                     │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│         │                                        ▲               │
│         │                                        │               │
│         ▼                                        │               │
│  ┌─────────────────────────────────────┐        │               │
│  │         API Gateway / ALB            │        │               │
│  └─────────────────────────────────────┘        │               │
│         │                                        │               │
│         ▼                                        │               │
│  ┌─────────────────────────────────────┐        │               │
│  │    ECS Fargate / App Runner / EC2   │────────┘               │
│  │         (Express API)               │                        │
│  └─────────────────────────────────────┘                        │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │ S3 (images) │                                                │
│  └─────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘
```

### AWS Phases Overview

**Phase 1: Preparation** — Environment config (done), containerize API
(Dockerfile), S3 storage service (swap Cloudinary for S3 in the storage
factory), database migration strategy

**Phase 2: Infrastructure** — AWS account + IAM, VPC with public/private
subnets, RDS PostgreSQL, S3 bucket for images, security groups

**Phase 3: Backend** — Push Docker image to ECR, deploy to App Runner (simplest)
or ECS Fargate (more control), connect to RDS via VPC

**Phase 4: Frontend** — AWS Amplify (recommended for Next.js SSR) or S3 +
CloudFront (static export)

**Phase 5: DNS & SSL** — Route 53 hosted zone, ACM certificate, transfer
winescellar.net nameservers from Squarespace to Route 53

**Phase 6: CI/CD** — Add deployment jobs to existing GitHub Actions workflow,
deploy on merge to main

**Phase 7: Monitoring** — CloudWatch Logs, alarms for error rates / response
times / CPU, SNS alert notifications, RDS backup verification

### AWS Cost Estimate

| Service         | Configuration   | Estimated Cost    |
| --------------- | --------------- | ----------------- |
| RDS PostgreSQL  | db.t3.micro     | $15-25            |
| App Runner      | 1 vCPU, 2GB RAM | $25-50            |
| Amplify Hosting | Build + Hosting | $5-15             |
| S3              | Images storage  | $1-5              |
| CloudFront      | CDN             | $5-10             |
| Route 53        | DNS hosting     | $0.50             |
| **Total**       |                 | **$50-110/month** |

### AWS Portability Notes

The current codebase is designed for easy AWS migration:

- **Storage**: `IStorageService` interface — swap `CloudinaryStorageService` for
  a new `S3StorageService` implementation. The factory
  (`createStorageService()`) already supports provider switching via
  `STORAGE_PROVIDER` env var.
- **Database**: Prisma ORM — just change `DATABASE_URL` to point to RDS. Same
  PostgreSQL, same schema.
- **Auth**: Basic Auth middleware will be replaced with a real auth system
  before AWS migration. Design the auth system to be platform-agnostic.
- **Config**: All platform-specific config is in `railway.json` and Vercel
  dashboard — no vendor code in application logic (FR-020, FR-021 from spec
  009).

### AWS Risks & Considerations

1. **Cold Starts**: App Runner/Lambda may have cold start latency
2. **Database Costs**: RDS is expensive; consider Aurora Serverless for variable
   workloads
3. **Image Migration**: Cloudinary images would need migration to S3
4. **Environment Parity**: Ensure local development mirrors production
5. **Secrets Management**: Use AWS Secrets Manager instead of env vars
