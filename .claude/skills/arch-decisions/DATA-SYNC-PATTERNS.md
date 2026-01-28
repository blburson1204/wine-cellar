---
parent: arch
name: DATA-SYNC-PATTERNS
---

# Data Sync Patterns

Guidance for multi-source data collection from external APIs.

## Current Architecture

```
External APIs         Job Dispatcher (EC2/PM2)       Database
-----------          ---------------------          --------
Primary API    --->  data-collection.ts         --> PostgreSQL
Secondary Feed --->  feed-pull.ts               --> (via Prisma)
Tertiary API   --->  [future]                   -->
```

**Key Components:**

- `packages/job-dispatcher/` - Background job processor
- `apps/api/src/services/` - Collection services
- `packages/database/` - Prisma schema with data models

## Core Patterns

### 1. Idempotent Collection

**Every sync operation must be safely re-runnable.**

```typescript
// GOOD: Upsert by external ID
await prisma.record.upsert({
  where: { externalId: externalId },
  update: { ...data, updatedAt: new Date() },
  create: { externalId: externalId, ...data }
});

// BAD: Assumes fresh state
await prisma.record.create({ data: {...} });
```

**Why it matters:** Jobs fail, get retried, run twice. Idempotency makes this
safe.

### 2. Cursor-Based Pagination

**Never rely on offset pagination for large datasets.**

```typescript
// GOOD: Cursor-based (resumable)
async function collectWithCursor(cursor?: string) {
  const response = await api.fetch({ after: cursor, limit: 100 });
  await saveRecords(response.data);

  if (response.nextCursor) {
    await collectWithCursor(response.nextCursor);
  }
}

// BAD: Offset-based (data can shift during sync)
async function collectWithOffset(page: number) {
  const response = await api.fetch({ page, limit: 100 });
  // If records are added/removed, you'll miss or duplicate data
}
```

**Why it matters:** Large syncs take time. Data changes during sync. Cursor
ensures consistency.

### 3. Rate Limit Handling

**Respect external API limits. Build retry with backoff.**

```typescript
// packages/job-dispatcher/src/shared/retry-utils.ts pattern
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (isRateLimitError(error)) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

**Note:** Track API quota usage. Consider implementing quota monitoring for
rate-limited APIs.

### 4. Progress Tracking

**Jobs should report progress for visibility.**

```typescript
// packages/job-dispatcher/src/shared/progress-tracker.ts
interface ProgressUpdate {
  jobId: string;
  recordsProcessed: number;
  recordsTotal: number;
  status: 'running' | 'completed' | 'failed';
  lastCursor?: string;
}

// Store in database for resume capability
await prisma.collectionJob.update({
  where: { id: jobId },
  data: { progress: progressUpdate },
});
```

**Why it matters:** Long jobs fail. Progress tracking enables resume from last
checkpoint.

## Multi-Source Sync Strategies

### Strategy 1: Sequential with Priority

**Recommended starting approach.**

```
1. Collect from primary API (main data source)
2. Enrich with secondary source data
3. Add tertiary source information
```

**Pros:** Simple, predictable, easy to debug **Cons:** Total time = sum of all
syncs **When:** Data volume is manageable, freshness isn't critical

### Strategy 2: Parallel with Merge

**Future consideration if latency becomes issue.**

```
1. Collect from all sources concurrently
2. Merge by common identifiers (externalId, referenceNumber)
3. Resolve conflicts with source priority
```

**Pros:** Faster total time **Cons:** Complex merge logic, harder to debug
**When:** Sources are truly independent, volume is high

**Recommendation:** Stay with Strategy 1 until you have a measured performance
problem.

### Strategy 3: Event-Driven

**Don't implement unless volume demands it.**

```
External webhook --> SQS --> Lambda --> Database
```

**Pros:** Near real-time, scales independently **Cons:** Complex infrastructure,
more failure modes **When:** Push-based sources exist, true real-time needed

**Note:** Only use this if your external APIs offer webhooks.

## Data Freshness Tradeoffs

| Freshness      | Implementation           | Complexity | When               |
| -------------- | ------------------------ | ---------- | ------------------ |
| Daily          | Scheduled job (cron/PM2) | Low        | Most use cases     |
| Hourly         | Scheduled job            | Low        | Active monitoring  |
| Near real-time | Queue + workers          | Medium     | Webhooks available |
| Real-time      | Event streaming          | High       | Rarely needed      |

**Note:** Match your sync frequency to how often your data sources actually
update. Hourly sync is often overkill.

## Error Handling

### Partial Success Pattern

**Don't fail entire sync for one bad record.**

```typescript
async function syncBatch(records: Record[]) {
  const results = { success: 0, failed: 0, errors: [] };

  for (const record of records) {
    try {
      await processRecord(record);
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push({ id: record.id, error: error.message });
      // Continue with next record
    }
  }

  // Log summary, don't throw on partial failure
  logger.info('Batch complete', results);
  return results;
}
```

### Dead Letter Pattern

**Capture failed records for later analysis.**

```typescript
// In database
model FailedSync {
  id          String   @id @default(cuid())
  source      String   // 'primary-api', 'secondary-feed'
  externalId  String
  rawData     Json
  error       String
  attempts    Int      @default(1)
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?
}
```

## Performance Considerations

### Batch Size

| Source Type | Recommended Batch | Reason                     |
| ----------- | ----------------- | -------------------------- |
| REST API    | 100 records       | Common API limit           |
| Atom Feed   | 1000 records      | Feed pagination            |
| Bulk API    | 500 records       | Memory/performance balance |

### Database Operations

```typescript
// GOOD: Batch upsert
await prisma.record.createMany({
  data: records,
  skipDuplicates: true,
});

// BAD: Individual inserts
for (const record of records) {
  await prisma.record.create({ data: record });
}
```

### Memory Management

For large syncs, process in streaming fashion:

```typescript
// GOOD: Stream processing
async function* fetchAllPages() {
  let cursor;
  do {
    const page = await api.fetch({ after: cursor });
    yield page.data;
    cursor = page.nextCursor;
  } while (cursor);
}

for await (const batch of fetchAllPages()) {
  await processBatch(batch);
  // Memory freed after each batch
}
```

## Monitoring Checklist

- [ ] Job start/end logged with timestamps
- [ ] Records processed count logged
- [ ] Error count and samples logged
- [ ] Duration tracked per source
- [ ] Rate limit hits tracked
- [ ] Last successful sync timestamp stored

## When to Reconsider Architecture

**Keep current approach until:**

- Sync takes > 1 hour (optimize queries first)
- Failure rate > 5% (investigate root cause first)
- Need sub-hourly freshness (challenge the requirement)
- Adding 3+ new sources (consider abstraction)
