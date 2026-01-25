---
parent: cybersec
name: deployment-review
---

# Deployment Security Review Checklist

> CI/CD, Docker, AWS, and infrastructure security review for Retryvr

**Usage:** Create TodoWrite items for each section when reviewing deployment
changes or pre-production.

---

## P1: CRITICAL (Blocks Deployment)

### Secrets Management

- [ ] No secrets in code or Dockerfiles
- [ ] No secrets in environment files committed to git
- [ ] All secrets in SSM Parameter Store (SecureString)
- [ ] No secrets in CI/CD logs (masked in GitHub Actions)
- [ ] No secrets in Docker build args

**Quick Check:**

```bash
# Check for secrets in codebase
grep -rn "password\|secret\|apiKey\|token" . --include="*.ts" --include="*.yml" \
  | grep -v node_modules | grep -v "\.test\." | grep -v "type\|interface"

# Check .env files not committed
git ls-files | grep -E "\.env$|\.env\.local$|\.env\.production$"
```

### Container Security

- [ ] Running as non-root user (UID 1001)
- [ ] No `--privileged` flag
- [ ] No sensitive mounts from host
- [ ] Base images from trusted sources (official Node.js Alpine)

**Quick Check:**

```bash
grep -rn "USER\|--privileged" apps/*/Dockerfile docker-compose*.yml
```

### Network Security

- [ ] RDS not publicly accessible
- [ ] ECS tasks in private subnet
- [ ] Security groups follow least privilege
- [ ] HTTPS enforced (HTTP redirects to HTTPS)

### Vulnerability Scanning

- [ ] `npm audit` - no CRITICAL or HIGH vulnerabilities
- [ ] ECR image scan - no CRITICAL findings
- [ ] Trivy container scan passes

**Quick Check:**

```bash
npm audit --production
```

---

## P2: HIGH (Fix Before Production)

### Docker Configuration

- [ ] Multi-stage builds (no dev dependencies in prod)
- [ ] `.dockerignore` excludes sensitive files
- [ ] Health checks configured
- [ ] Resource limits set (memory, CPU)

**Check Dockerfile:**

```dockerfile
# Required patterns
FROM node:20-alpine AS builder  # Multi-stage
USER nodejs                     # Non-root
HEALTHCHECK ...                 # Health check
```

### AWS IAM

- [ ] Task roles follow least privilege
- [ ] No `*` in IAM policy resources
- [ ] Separate roles for execution vs runtime
- [ ] No hardcoded credentials in task definitions

**Quick Check:**

```bash
# Check for overly permissive IAM
aws iam get-role-policy --role-name retryvrApiTaskRole --policy-name ... \
  | grep -E '"Resource":\s*"\*"'
```

### Logging & Monitoring

- [ ] CloudWatch logs enabled for all containers
- [ ] Log retention policy set (not infinite)
- [ ] No sensitive data in logs
- [ ] Alarms configured for security events

### Database

- [ ] SSL/TLS required for connections (`sslmode=require`)
- [ ] Automated backups enabled
- [ ] Encryption at rest enabled
- [ ] No default/weak passwords

---

## P3: SECURITY DEBT (Track & Fix Soon)

### CI/CD Pipeline

- [ ] GitHub Actions use pinned versions (not `@latest`)
- [ ] Secrets passed via GitHub Secrets (not env vars)
- [ ] Branch protection on main (require PR, reviews)
- [ ] No manual intervention required for deployments

**GitHub Actions Check:**

```yaml
# ✅ SECURE - Pinned versions
- uses: actions/checkout@v4.1.0

# ❌ INSECURE - Floating versions
- uses: actions/checkout@latest
```

### Container Hardening

- [ ] Read-only root filesystem
- [ ] Capabilities dropped (`cap_drop: ALL`)
- [ ] No new privileges (`no-new-privileges`)
- [ ] tmpfs for temp directories

### Secret Rotation

- [ ] Database credentials rotation plan
- [ ] API keys rotation plan
- [ ] JWT secret rotation plan (zero-downtime)
- [ ] Last rotation date documented

### Backup & Recovery

- [ ] RDS automated backups verified
- [ ] Point-in-time recovery tested
- [ ] Disaster recovery plan documented
- [ ] Recovery time objective (RTO) defined

---

## P4: BEST PRACTICE (Advisory)

### Image Management

- [ ] Images tagged with commit SHA (not just `latest`)
- [ ] ECR lifecycle policy removes old images
- [ ] Image signing considered (Docker Content Trust)
- [ ] SBOM generated for images

### Observability

- [ ] GuardDuty enabled
- [ ] VPC Flow Logs enabled
- [ ] CloudTrail enabled for API calls
- [ ] X-Ray tracing considered

### Cost & Security Balance

- [ ] No over-provisioned resources (attack surface)
- [ ] Auto-scaling configured (DoS resilience)
- [ ] Spot instances not used for security-critical workloads

### Documentation

- [ ] Runbook for security incidents
- [ ] Network diagram current
- [ ] Access control matrix documented
- [ ] Deployment process documented

---

## Pre-Deployment Checklist

Run before ANY production deployment:

### Automated Checks

```bash
# 1. Run full test suite
npm run test:full-docker

# 2. Check dependencies
npm audit --production

# 3. Scan container
docker scan retryvr-api:latest

# 4. Verify no secrets
grep -rn "password\|secret" apps/ --include="*.ts" | grep -v "\.test\." | wc -l
# Should be 0 or only type definitions
```

### Manual Verification

- [ ] PR reviewed by at least one other developer
- [ ] No P1/P2 security issues from code review
- [ ] Staging tested and stable
- [ ] Rollback plan confirmed
- [ ] On-call engineer aware of deployment

### Post-Deployment

- [ ] Health checks passing
- [ ] CloudWatch logs flowing
- [ ] No error rate spike
- [ ] Performance baseline maintained

---

## Retryvr-Specific

### ECS Deployment

- [ ] Task definition updated correctly
- [ ] Service uses rolling deployment (not all-at-once)
- [ ] Minimum healthy percent set (50%+)
- [ ] Maximum percent set (200% for zero-downtime)

### Database Migrations

- [ ] Migrations run before new code deployed
- [ ] Migrations are backwards-compatible
- [ ] Rollback migration prepared
- [ ] Migration tested in staging first

### Job Dispatcher (EC2)

- [ ] SSM parameters configured for environment
- [ ] PM2 process manager configured
- [ ] Logs shipping to CloudWatch
- [ ] Security group restricts inbound

---

## AWS Security Quick Audit

```bash
# Check ECS task security
aws ecs describe-task-definition --task-definition retryvr-api \
  --query 'taskDefinition.containerDefinitions[0].{
    User:user,
    ReadOnly:readonlyRootFilesystem,
    Privileged:privileged
  }'

# Check RDS encryption
aws rds describe-db-instances --db-instance-identifier retryvr-production \
  --query 'DBInstances[0].{
    Encrypted:StorageEncrypted,
    PublicAccess:PubliclyAccessible,
    SSL:CACertificateIdentifier
  }'

# Check security groups for overly permissive rules
aws ec2 describe-security-groups \
  --query 'SecurityGroups[*].{
    Name:GroupName,
    OpenToWorld:IpPermissions[?contains(IpRanges[*].CidrIp,`0.0.0.0/0`)]
  }'

# Check SSM parameters are encrypted
aws ssm describe-parameters \
  --parameter-filters "Key=Path,Values=/retryvr/production" \
  --query 'Parameters[*].{Name:Name,Type:Type}'
```

---

## Incident Response Preparation

### Before Production

- [ ] Incident response plan documented
- [ ] Security contact list current
- [ ] Logging sufficient for forensics
- [ ] Ability to revoke all sessions quickly

### Access Controls

- [ ] Production access limited to essential personnel
- [ ] MFA required for AWS console
- [ ] SSH keys rotated or removed
- [ ] Break-glass procedure documented

---

## Environment Comparison

| Check           | Staging        | Production       |
| --------------- | -------------- | ---------------- |
| HTTPS enforced  | Should be      | MUST be          |
| Debug mode      | Acceptable     | NEVER            |
| Verbose logging | OK             | Careful (no PII) |
| Test data       | Acceptable     | NEVER            |
| Public access   | OK for testing | Restricted       |
