---
parent: cybersec
name: infrastructure
---

# Infrastructure Security Reference

> Docker, ECS/Fargate, and AWS security patterns for Retryvr

---

## Docker Container Security

### Base Image Selection

```dockerfile
# ✅ SECURE - Minimal Alpine image
FROM node:20-alpine AS base

# ❌ AVOID - Full images with unnecessary packages
FROM node:20
```

**Why Alpine?**

- Smaller attack surface (~5MB vs ~900MB)
- No shell by default in distroless variants
- Fewer CVEs to track

### Multi-Stage Builds

```dockerfile
# Build stage - has dev dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage - minimal
FROM node:20-alpine AS runner
WORKDIR /app

# ✅ Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# ✅ Copy only production artifacts
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

USER nodejs
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

### Container Hardening Checklist

| Control              | Implementation                     | Priority |
| -------------------- | ---------------------------------- | -------- |
| Non-root user        | `USER nodejs` (UID 1001)           | P1       |
| Read-only filesystem | `--read-only` flag                 | P2       |
| Drop capabilities    | `cap_drop: ALL`                    | P2       |
| No new privileges    | `--security-opt=no-new-privileges` | P2       |
| Resource limits      | `--memory`, `--cpus`               | P3       |
| Health checks        | `HEALTHCHECK` instruction          | P3       |

### Docker Compose Security

```yaml
services:
  api:
    image: retryvr-api:latest
    read_only: true
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    tmpfs:
      - /tmp:noexec,nosuid,size=64m
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

---

## AWS ECS/Fargate Security

### Task Definition Security

```json
{
  "family": "retryvr-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/retryvrApiTaskRole",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/retryvr-api:latest",
      "essential": true,
      "readonlyRootFilesystem": true,
      "user": "1001:1001",
      "linuxParameters": {
        "initProcessEnabled": true,
        "capabilities": {
          "drop": ["ALL"]
        }
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/retryvr-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "api"
        }
      },
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:ssm:REGION:ACCOUNT:parameter/retryvr/production/database-url"
        }
      ]
    }
  ]
}
```

### IAM Role Separation

| Role                   | Purpose                 | Permissions                      |
| ---------------------- | ----------------------- | -------------------------------- |
| `ecsTaskExecutionRole` | Pull images, write logs | ECR read, CloudWatch Logs write  |
| `retryvrApiTaskRole`   | Application runtime     | SSM GetParameter, S3 (if needed) |
| `retryvrDeployRole`    | CI/CD deployment        | ECS update, ECR push             |

**Principle of Least Privilege:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ssm:GetParameter", "ssm:GetParameters"],
      "Resource": ["arn:aws:ssm:*:*:parameter/retryvr/production/*"]
    }
  ]
}
```

### Network Security

```hcl
# Security Group - Minimal ingress
resource "aws_security_group" "ecs_tasks" {
  name        = "retryvr-ecs-tasks"
  description = "Allow inbound from ALB only"
  vpc_id      = var.vpc_id

  # ✅ Only allow traffic from ALB
  ingress {
    from_port       = 3001
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # ✅ Restrict egress (if possible)
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # HTTPS only
  }

  egress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.rds.id]  # DB only
  }
}
```

### Secrets Management

**SSM Parameter Store (Current)**

```bash
# Secure parameter creation
aws ssm put-parameter \
  --name "/retryvr/production/database-url" \
  --value "postgresql://..." \
  --type "SecureString" \
  --key-id "alias/retryvr-secrets"

# Access in ECS task definition
"secrets": [
  {
    "name": "DATABASE_URL",
    "valueFrom": "arn:aws:ssm:us-east-1:ACCOUNT:parameter/retryvr/production/database-url"
  }
]
```

**Secret Rotation:**

- Database credentials: Rotate quarterly minimum
- API keys: Rotate on personnel changes
- JWT secrets: Rotate with zero-downtime (dual-key period)

---

## RDS PostgreSQL Security

### Connection Security

```
# ✅ REQUIRED - SSL mode in connection string
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# ✅ BETTER - Verify server certificate
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=verify-full&sslrootcert=/path/to/rds-ca.pem"
```

### Authentication

```sql
-- Use SCRAM-SHA-256 (not MD5)
ALTER SYSTEM SET password_encryption = 'scram-sha-256';

-- Create application-specific role
CREATE ROLE retryvr_api WITH LOGIN PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE retryvr TO retryvr_api;
GRANT USAGE ON SCHEMA public TO retryvr_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO retryvr_api;

-- ❌ NEVER grant SUPERUSER or CREATE to application roles
```

### Network Isolation

- RDS in private subnet only
- Security group allows only ECS task SG
- No public accessibility
- Enable encryption at rest (KMS)

---

## Monitoring & Detection

### CloudWatch Alarms

```yaml
# Critical security alarms
Alarms:
  - UnauthorizedAPICalls:
      MetricName: UnauthorizedAttemptCount
      Threshold: 5
      Period: 300

  - RootAccountUsage:
      MetricName: RootAccountUsageCount
      Threshold: 1
      Period: 60

  - SecurityGroupChanges:
      MetricName: SecurityGroupEventCount
      Threshold: 1
      Period: 300
```

### GuardDuty (Recommended)

Enable for:

- Malicious IP detection
- Cryptocurrency mining detection
- Container runtime anomalies
- Credential compromise detection

### VPC Flow Logs

```hcl
resource "aws_flow_log" "ecs" {
  vpc_id          = var.vpc_id
  traffic_type    = "ALL"
  log_destination = aws_cloudwatch_log_group.flow_logs.arn

  tags = {
    Name = "retryvr-vpc-flow-logs"
  }
}
```

---

## Image Security

### ECR Scanning

```bash
# Enable scan on push
aws ecr put-image-scanning-configuration \
  --repository-name retryvr-api \
  --image-scanning-configuration scanOnPush=true

# Check scan results
aws ecr describe-image-scan-findings \
  --repository-name retryvr-api \
  --image-id imageTag=latest
```

### Image Signing (Advanced)

```bash
# Docker Content Trust
export DOCKER_CONTENT_TRUST=1
docker push ACCOUNT.dkr.ecr.REGION.amazonaws.com/retryvr-api:latest
```

### Vulnerability Thresholds

| Severity | Action           | Timeline  |
| -------- | ---------------- | --------- |
| CRITICAL | Block deployment | Immediate |
| HIGH     | Block deployment | Immediate |
| MEDIUM   | Track as P3      | 30 days   |
| LOW      | Track as P4      | 90 days   |

---

## Quick Audit Commands

```bash
# Check ECS task security settings
aws ecs describe-task-definition --task-definition retryvr-api \
  | jq '.taskDefinition.containerDefinitions[0] | {
    readonlyRootFilesystem,
    user,
    linuxParameters
  }'

# Check security group rules
aws ec2 describe-security-groups \
  --group-ids sg-xxx \
  --query 'SecurityGroups[0].IpPermissions'

# Check RDS encryption
aws rds describe-db-instances \
  --db-instance-identifier retryvr-production \
  --query 'DBInstances[0].{Encrypted:StorageEncrypted,SSL:CACertificateIdentifier}'

# Check SSM parameters are encrypted
aws ssm describe-parameters \
  --parameter-filters "Key=Path,Values=/retryvr/production" \
  --query 'Parameters[*].{Name:Name,Type:Type}'
```

---

## Retryvr Current State

### Implemented

- awsvpc network mode
- Multi-stage Docker builds
- Non-root user (nodejs UID 1001)
- Alpine base images
- SSM Parameter Store for secrets
- CloudWatch logging

### Gaps to Address

| Gap                  | Priority | Recommendation                     |
| -------------------- | -------- | ---------------------------------- |
| Read-only filesystem | P2       | Add `readonlyRootFilesystem: true` |
| Capability dropping  | P2       | Add `capabilities.drop: ["ALL"]`   |
| GuardDuty            | P3       | Enable for runtime monitoring      |
| VPC Flow Logs        | P3       | Enable for network visibility      |
| Image signing        | P4       | Implement Docker Content Trust     |
| Secret rotation      | P3       | Automate quarterly rotation        |

---

## References

- [AWS ECS Security Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/security.html)
- [Docker Security](https://docs.docker.com/engine/security/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [AWS Well-Architected Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/)
