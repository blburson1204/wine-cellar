---
parent: arch
name: SCALABILITY-GUIDE
---

# Scalability Guide

Right-sized scaling guidance for TestApp's solo developer context.

## The Honest Truth

You're a solo developer with low volume (<1k users). Most scaling advice is
designed for teams of 20+ with millions of users. **You probably don't need most
of it.**

## You Probably Don't Need This Yet

| Technology             | Skip Until                              | Why                                             |
| ---------------------- | --------------------------------------- | ----------------------------------------------- |
| **Microservices**      | Team > 20 OR clear domain isolation     | Deployment complexity, debugging overhead       |
| **Kubernetes**         | Dedicated ops capacity                  | ECS Fargate does the job without K8s complexity |
| **Event Sourcing**     | Legal audit/replay requirement          | Overkill for most CRUD apps                     |
| **GraphQL Federation** | Multiple teams own different data       | Complexity not justified for one team           |
| **Multi-region**       | Latency SLA or compliance requires      | Doubles infrastructure cost and complexity      |
| **Redis Cluster**      | 10k+ concurrent connections             | Single Redis instance handles a lot             |
| **Read Replicas**      | DB CPU consistently > 70%               | Vertical scaling is simpler                     |
| **Message Queues**     | Need guaranteed delivery + retry        | HTTP calls + retry logic often enough           |
| **CQRS**               | Read/write patterns radically different | Usually premature optimization                  |

## Do This First (The "Boring" Scaling Checklist)

Before adding infrastructure, exhaust these options:

### 1. Add Database Indexes

```sql
-- Check slow queries
EXPLAIN ANALYZE SELECT * FROM record WHERE category_code = 'CAT001';

-- Add index if scan is sequential
CREATE INDEX idx_record_category ON record(category_code);
```

**Common TestApp indexes to consider:**

- `record.created_date` (sorting)
- `record.category_code` (filtering)
- `record.reference_number` (lookups)
- `collection_job.status, created_at` (job queries)

### 2. Implement Connection Pooling

```typescript
// packages/database/index.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool settings
});

// DATABASE_URL should include:
// ?connection_limit=5&pool_timeout=10
```

**Why:** Database connections are expensive. Pool them.

### 3. Add Caching for Expensive Queries

```typescript
// Simple in-memory cache for small data
const cache = new Map<string, { data: any; expires: number }>();

async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 60_000
): Promise<T> {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const data = await fetcher();
  cache.set(key, { data, expires: Date.now() + ttlMs });
  return data;
}

// Usage
const stats = await getCachedData(
  'dashboard-stats',
  () => calculateDashboardStats(),
  5 * 60_000 // 5 minutes
);
```

**Graduate to Redis when:**

- Multiple instances need to share cache
- Cache size > 100MB
- Need cache persistence across restarts

### 4. Optimize N+1 Queries

```typescript
// BAD: N+1
const records = await prisma.record.findMany();
for (const rec of records) {
  const attachments = await prisma.attachment.findMany({
    where: { recordId: rec.id },
  });
}

// GOOD: Eager loading
const records = await prisma.record.findMany({
  include: { attachments: true },
});

// BETTER: Only load what you need
const records = await prisma.record.findMany({
  include: {
    attachments: {
      select: { id: true, filename: true },
    },
  },
});
```

### 5. Use Background Jobs for Slow Operations

```typescript
// BAD: Blocking request
app.post('/api/v1/records/sync', async (req, res) => {
  await syncAllRecords(); // Takes 5 minutes
  res.json({ success: true });
});

// GOOD: Queue and respond
app.post('/api/v1/records/sync', async (req, res) => {
  const jobId = await queueSyncJob();
  res.json({ jobId, status: 'queued' });
});
```

### 6. Implement Pagination Everywhere

```typescript
// Default to cursor pagination for large tables
app.get('/api/v1/records', async (req, res) => {
  const { cursor, limit = 50 } = req.query;

  const data = await prisma.record.findMany({
    take: Math.min(Number(limit), 100),
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
  });

  res.json({
    data,
    nextCursor: data[data.length - 1]?.id,
  });
});
```

## When to Add Infrastructure

### Database Read Replica

**Add when:**

- [ ] CPU consistently > 70%
- [ ] Read/write ratio > 10:1
- [ ] Reporting queries blocking OLTP

**For TestApp:** You're far from this. Job dispatcher queries are the heavy
readers—they run on schedule, not during peak traffic.

### Redis Cache

**Add when:**

- [ ] Same expensive queries run frequently
- [ ] Multiple instances need shared cache
- [ ] Session storage needed across instances

**Start with:**

```typescript
// Use AWS ElastiCache (serverless for simplicity)
// Or just use in-memory caching until you need more
```

### Message Queue (SQS)

**Add when:**

- [ ] Need guaranteed delivery with retry
- [ ] Decouple producers from consumers
- [ ] Handle traffic spikes by queuing work

**For TestApp:** Job dispatcher already handles async. SQS could help if you
need to queue jobs from the API without blocking.

### CDN

**Add when:**

- [ ] Static assets are slow
- [ ] Users are globally distributed
- [ ] Need edge caching

**For TestApp:** CloudFront in front of S3 for document attachments makes sense
when volume increases.

## Vertical vs Horizontal Scaling

### Vertical (Scale Up) - Do This First

| Resource         | When to Scale           | Next Size                  |
| ---------------- | ----------------------- | -------------------------- |
| RDS              | CPU > 70%, IOPS limited | db.t3.medium → db.t3.large |
| ECS Task         | Memory/CPU pressure     | Increase task CPU/memory   |
| EC2 (dispatcher) | Job backlog growing     | t3.small → t3.medium       |

**Pros:** Simple, no code changes, predictable **Cons:** Has ceiling, more
expensive per unit

### Horizontal (Scale Out) - After Vertical Exhausted

**Requires:**

- Stateless application design
- Session storage external (database or Redis)
- File storage external (S3)
- Sticky sessions if absolutely needed

**ECS handles this:**

```yaml
# Task definition
{ 'desiredCount': 2, // Run 2 instances "healthCheckGracePeriodSeconds": 60 }
```

## Database Scaling Path

```
PostgreSQL (single instance)
    ↓ (when: CPU > 70% sustained)
PostgreSQL (larger instance)
    ↓ (when: still constrained)
PostgreSQL + Read Replica
    ↓ (when: write contention)
PostgreSQL + Connection Pooling (PgBouncer)
    ↓ (when: extreme read/write separation needed)
Consider alternatives (but probably won't need)
```

**For TestApp:** db.t3.micro → db.t3.small → db.t3.medium is plenty of runway.

## Monitoring Before Scaling

**Don't scale without data. Monitor:**

```bash
# CloudWatch metrics to watch
- CPUUtilization (database, ECS tasks)
- DatabaseConnections (should be < connection limit)
- MemoryUtilization (ECS tasks)
- ALBRequestCount (traffic patterns)
- 5XXErrors (are we failing?)
```

**Set alarms for:**

- CPU > 70% for 5 minutes
- Memory > 80%
- Error rate > 1%
- Response time p95 > 2s

## Future Multi-Tenant Considerations

You mentioned multi-customer SaaS is on the roadmap. Plan for this:

### Data Isolation Strategy

| Strategy                  | Isolation | Complexity | Migration Effort |
| ------------------------- | --------- | ---------- | ---------------- |
| **Shared DB + tenant_id** | Low       | Low        | Easy             |
| **Schema per tenant**     | Medium    | Medium     | Moderate         |
| **Database per tenant**   | High      | High       | Hard             |

**Recommendation:** Start with shared DB + tenant_id. It's sufficient for most
SaaS until compliance requires more.

```typescript
// Add to all queries
const records = await prisma.record.findMany({
  where: {
    customerId: session.user.customerId, // CRITICAL
    ...otherFilters,
  },
});
```

**The Forgotten WHERE Clause:** This is the #1 multi-tenant security bug.
Consider Prisma middleware to enforce:

```typescript
prisma.$use(async (params, next) => {
  if (params.model === 'Record' && params.action === 'findMany') {
    params.args.where = {
      ...params.args.where,
      customerId: getCurrentCustomerId(),
    };
  }
  return next(params);
});
```

### Billing Integration

**Don't build it.** Use Stripe:

- Subscription management
- Usage metering
- Invoice generation
- Customer portal

```typescript
// Stripe does the heavy lifting
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: 'price_xxx' }],
  trial_period_days: 14,
});
```

## The Bottom Line

1. **Measure before optimizing**
2. **Exhaust simple solutions first**
3. **Vertical scaling is underrated**
4. **Complexity is expensive for solo devs**
5. **"Boring" infrastructure works**
