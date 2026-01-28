---
name: prisma-surgical-fixes
description:
  Detailed SQL surgical fixes for all Prisma migration problem categories -
  preserves data by modifying migration metadata only
---

# Prisma Surgical Fixes

This sub-skill provides detailed SQL commands for fixing specific Prisma
migration issues. These are surgical fixes that modify only the
`_prisma_migrations` metadata table, preserving all application data.

## Orphaned Migration Record

Migration file deleted but record still in database.

```sql
-- Find orphaned records
SELECT migration_name FROM "_prisma_migrations"
WHERE migration_name NOT IN ('migration1', 'migration2'); -- list actual filesystem migrations

-- Remove ONLY the tracking record (preserves all data)
DELETE FROM "_prisma_migrations"
WHERE migration_name = '<orphaned_migration>';
```

## Branch Switch Conflict

Switched branches, migrations from other branch polluting database.

```sql
-- Remove records for migrations not in current branch
DELETE FROM "_prisma_migrations"
WHERE migration_name IN ('<migration_from_other_branch>');

-- Then re-apply current branch
npx prisma migrate dev
```

## Failed Migration Recovery

Migration started but failed mid-execution.

```sql
-- Find failed migration
SELECT migration_name, logs FROM "_prisma_migrations"
WHERE finished_at IS NULL;

-- Mark as rolled back (allows retry after fixing)
UPDATE "_prisma_migrations"
SET rolled_back_at = NOW()
WHERE migration_name = '<failed_migration>';
```

Or use Prisma CLI:

```bash
npx prisma migrate resolve --rolled-back <migration_name>
```

## Checksum Mismatch

Migration file edited after application (intentional or CRLF issue).

```bash
# Generate new checksum
node -e "
const crypto = require('crypto');
const fs = require('fs');
const content = fs.readFileSync('prisma/migrations/<name>/migration.sql');
console.log(crypto.createHash('sha256').update(content).digest('hex'));
"
```

```sql
UPDATE "_prisma_migrations"
SET checksum = '<new_checksum>'
WHERE migration_name = '<edited_migration>';
```

## Schema Drift from Manual Changes

Someone modified database directly.

```bash
# See what drifted
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-url "$DATABASE_URL"

# Option 1: Incorporate drift
npx prisma db pull
npx prisma migrate dev --name reconcile_drift

# Option 2: Revert drift
npx prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-migrations prisma/migrations \
  --script > revert.sql
# Review revert.sql, then:
npx prisma db execute --file revert.sql
```

## Recovering from `db push` Damage

If you (or someone) used `db push` on a project with existing migrations, you
need to create a **baseline migration** to reconcile the state:

```bash
# 1. See what drift exists
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-url "$DATABASE_URL"

# 2. Create a baseline migration folder
TIMESTAMP=$(date +%Y%m%d%H%M%S)
mkdir -p prisma/migrations/${TIMESTAMP}_baseline_reconcile

# 3. Generate migration SQL that captures current state
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/${TIMESTAMP}_baseline_reconcile/migration.sql

# 4. If the migration.sql is empty, the schema matches - just fix checksums
# If it has content, mark it as already applied (DB is already in this state):
npx prisma migrate resolve --applied ${TIMESTAMP}_baseline_reconcile

# 5. Verify everything is in sync
npx prisma migrate status
```

**Why this works:** The baseline migration captures the difference between what
migrations say should exist and what schema.prisma defines. Since `db push`
already applied those changes, we mark the migration as "applied" without
running it.

## Common SQL Queries for Diagnosis

### Check all migrations

```sql
SELECT migration_name, started_at, finished_at, rolled_back_at
FROM "_prisma_migrations"
ORDER BY started_at DESC;
```

### Find pending migrations

```sql
SELECT migration_name, logs
FROM "_prisma_migrations"
WHERE finished_at IS NULL;
```

### Find rolled back migrations

```sql
SELECT migration_name, rolled_back_at, logs
FROM "_prisma_migrations"
WHERE rolled_back_at IS NOT NULL
ORDER BY rolled_back_at DESC;
```

### Check migration checksums

```sql
SELECT migration_name, checksum, applied_steps_count
FROM "_prisma_migrations"
ORDER BY started_at DESC;
```

## Execution Safety

All SQL commands above:

- Modify ONLY the `_prisma_migrations` table
- Preserve ALL application data
- Are reversible (can re-run migrations after fixing)
- Take seconds to execute

Before executing any SQL:

1. Understand the problem category
2. Verify the diagnosis with diagnostic commands
3. Present the fix to the user with explicit tradeoffs
4. Get confirmation before execution

## Testing the Fix

After applying a surgical fix, always verify:

```bash
# 1. Check migration status
npx prisma migrate status

# 2. Verify no drift
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-url "$DATABASE_URL"

# 3. Check validation passes
npm run db:validate-complete
```

## When Surgical Fix Won't Work

If you encounter:

- Corrupted database schema (tables/columns missing)
- Multiple failed migrations creating cascading issues
- User explicitly wants fresh start with no data

Then and ONLY then consider `prisma migrate reset`. Always present this as the
last option with explicit warning about data loss.
