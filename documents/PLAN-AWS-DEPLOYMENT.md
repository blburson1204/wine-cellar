# AWS Deployment Plan for Wine Cellar Application

## Overview

This document outlines the steps required to deploy the Wine Cellar application
to AWS. The application is a monorepo with:

- **Frontend**: Next.js 15 application
- **Backend**: Express.js API
- **Database**: PostgreSQL
- **Storage**: Local file storage for wine label images

## Recommended AWS Architecture

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

---

## Phase 1: Preparation (Local)

### Step 1.1: Environment Configuration

- Create environment variable management system
- Separate development and production configurations
- Required environment variables:
  - `DATABASE_URL` - PostgreSQL connection string
  - `NODE_ENV` - Environment identifier
  - `API_URL` - Backend API URL for frontend
  - `AWS_REGION` - AWS region
  - `S3_BUCKET_NAME` - For wine label images
  - `CORS_ORIGIN` - Allowed frontend origins

### Step 1.2: Containerize the API

- Create `Dockerfile` for Express API
- Create `Dockerfile` for Next.js web app (if using ECS)
- Create `docker-compose.prod.yml` for local production testing
- Test containers locally before deployment

### Step 1.3: Update Storage Service

- Modify image storage to use AWS S3 instead of local filesystem
- Install AWS SDK (`@aws-sdk/client-s3`)
- Update upload/download endpoints for S3 integration
- Implement signed URLs for secure image access

### Step 1.4: Database Migration Strategy

- Export existing local data (if any)
- Create database migration scripts
- Document schema deployment process

---

## Phase 2: AWS Infrastructure Setup

### Step 2.1: AWS Account & IAM Setup

- Create AWS account (if not existing)
- Set up IAM user with appropriate permissions
- Configure AWS CLI locally
- Create IAM roles for services (ECS task role, etc.)

### Step 2.2: Networking (VPC)

- Create VPC with public and private subnets
- Set up Internet Gateway
- Configure NAT Gateway for private subnet outbound access
- Create security groups:
  - ALB security group (ports 80, 443)
  - API security group (port 3001 from ALB only)
  - Database security group (port 5432 from API only)

### Step 2.3: Database (RDS PostgreSQL)

- Create RDS PostgreSQL instance
- Choose instance size (start with `db.t3.micro` for development)
- Configure in private subnet
- Set up automated backups
- Store credentials in AWS Secrets Manager
- Run Prisma migrations against RDS

### Step 2.4: Storage (S3)

- Create S3 bucket for wine label images
- Configure bucket policy for API access
- Set up CORS configuration for direct uploads (if needed)
- Configure lifecycle rules for cost optimization

---

## Phase 3: Backend Deployment

### Option A: AWS App Runner (Simplest)

- Push Docker image to ECR
- Create App Runner service
- Configure environment variables
- Set up auto-scaling
- Connect to RDS via VPC connector

### Option B: ECS Fargate (More Control)

- Push Docker image to ECR
- Create ECS cluster
- Create task definition
- Create ECS service
- Configure Application Load Balancer
- Set up auto-scaling policies

### Option C: EC2 (Most Control, More Management)

- Launch EC2 instance
- Install Node.js and dependencies
- Set up PM2 for process management
- Configure Nginx as reverse proxy
- Set up SSL with Let's Encrypt

**Recommendation**: Start with App Runner for simplicity, migrate to ECS if more
control needed.

---

## Phase 4: Frontend Deployment

### Option A: AWS Amplify (Recommended)

- Connect GitHub repository
- Configure build settings for Next.js
- Set up environment variables
- Enable automatic deployments on push
- Configure custom domain (optional)

### Option B: S3 + CloudFront (Static Export)

- Export Next.js as static site (if possible)
- Upload to S3 bucket
- Configure CloudFront distribution
- Set up custom domain and SSL

### Option C: ECS/App Runner (SSR Required)

- If server-side rendering features are needed
- Deploy as container alongside API
- More complex but full Next.js feature support

**Recommendation**: AWS Amplify for easiest Next.js deployment with full SSR
support.

---

## Phase 5: DNS & SSL

### Step 5.1: Domain Configuration

- Register domain (Route 53 or external registrar)
- Create hosted zone in Route 53
- Configure DNS records for frontend and API

### Step 5.2: SSL Certificates

- Request SSL certificate via AWS Certificate Manager (ACM)
- Validate domain ownership
- Attach certificate to CloudFront/ALB

---

## Phase 6: CI/CD Pipeline

### Step 6.1: Extend GitHub Actions

- Add deployment jobs to existing workflow
- Configure AWS credentials as GitHub secrets
- Add staging environment (optional)
- Implement deployment on merge to main

### Step 6.2: Deployment Workflow

```yaml
# Example addition to code-quality.yml
deploy:
  needs: [build]
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - Deploy API to App Runner/ECS
    - Deploy Web to Amplify (auto-triggered)
    - Run smoke tests
```

---

## Phase 7: Monitoring & Operations

### Step 7.1: Logging

- Configure CloudWatch Logs for API
- Set up log retention policies
- Create log insights queries for common issues

### Step 7.2: Monitoring

- Set up CloudWatch alarms for:
  - API error rates
  - Response times
  - Database connections
  - Memory/CPU utilization
- Configure SNS notifications for alerts

### Step 7.3: Backup Strategy

- Verify RDS automated backups
- Test database restore procedure
- Document disaster recovery process

---

## Cost Estimate (Monthly)

| Service         | Configuration   | Estimated Cost    |
| --------------- | --------------- | ----------------- |
| RDS PostgreSQL  | db.t3.micro     | $15-25            |
| App Runner      | 1 vCPU, 2GB RAM | $25-50            |
| Amplify Hosting | Build + Hosting | $5-15             |
| S3              | Images storage  | $1-5              |
| CloudFront      | CDN (optional)  | $5-10             |
| Route 53        | DNS hosting     | $0.50             |
| **Total**       |                 | **$50-110/month** |

_Note: Costs can be reduced using AWS Free Tier (first 12 months) or reserved
instances._

---

## Implementation Checklist

### Preparation

- [ ] Create environment configuration system
- [ ] Create API Dockerfile
- [ ] Update storage service for S3
- [ ] Test containers locally

### AWS Setup

- [ ] Set up IAM users and roles
- [ ] Create VPC and networking
- [ ] Launch RDS PostgreSQL
- [ ] Create S3 bucket for images
- [ ] Run database migrations

### Deployment

- [ ] Push API container to ECR
- [ ] Deploy API to App Runner/ECS
- [ ] Connect Amplify to repository
- [ ] Deploy frontend

### DNS & Security

- [ ] Configure domain in Route 53
- [ ] Set up SSL certificates
- [ ] Update CORS settings

### CI/CD & Operations

- [ ] Add deployment to GitHub Actions
- [ ] Set up CloudWatch monitoring
- [ ] Configure alerts
- [ ] Document runbook

---

## Risks & Considerations

1. **Cold Starts**: App Runner/Lambda may have cold start latency
2. **Database Costs**: RDS can be expensive; consider Aurora Serverless for
   variable workloads
3. **Image Migration**: Existing local images need migration to S3
4. **Environment Parity**: Ensure local development mirrors production
5. **Secrets Management**: Never commit credentials; use AWS Secrets Manager

---

## Alternative Approaches

### Simpler Options

- **Vercel**: Native Next.js hosting, simpler than AWS for frontend
- **Railway/Render**: Simpler PaaS alternatives for full stack
- **Heroku**: Traditional PaaS (higher cost)

### More Complex Options

- **Kubernetes (EKS)**: For larger scale, more operational overhead
- **Serverless (Lambda)**: Convert API to serverless functions

---

## Next Steps

1. Decide on deployment option (App Runner vs ECS vs EC2)
2. Decide on frontend hosting (Amplify vs S3+CloudFront)
3. Set up AWS account and IAM
4. Begin Phase 1 preparation work
