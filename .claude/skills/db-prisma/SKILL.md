---
name: db-prisma
description:
  Use when database migrations fail, drift is detected, or branch switching
  causes conflicts - provides surgical solutions that preserve data rather than
  destructive resets.
---

# Prisma Migration Troubleshooting

## CRITICAL: Never Use `db push` with Existing Migrations

**`db push` CAUSES drift, it does not fix it.**

When you use `db push`:

- It changes the database schema directly
- It does NOT update `_prisma_migrations` table
- It does NOT create migration files
- Later `migrate dev` will detect drift between DB state and migration history

| Situation                                   | Use `db push`? | Why                           |
| ------------------------------------------- | -------------- | ----------------------------- |
| New project, no migrations yet              | Yes            | Safe for initial prototyping  |
| Project has `prisma/migrations/` with files | **NEVER**      | Creates drift                 |
| Trying to "fix" drift                       | **NEVER**      | Makes drift worse             |
| Syncing schema to database                  | **NEVER**      | Use proper migration workflow |

**If you already used `db push` on a project with migrations:** See
`prisma-surgical-fixes` sub-skill.

**Note:** Our `forbidden-command-blocker.sh` hook blocks raw
`npx prisma db push`. Use `npm run db:push` which includes backup safety.

## Golden Rule

**NEVER suggest `prisma migrate reset` as the first option.**

The `_prisma_migrations` table is METADATA, not DATA. Modifying it:

- Removes migration tracking records only
- Preserves ALL application data
- Is the surgical fix for most issues

Reset destroys all data and is rarely necessary.

## Diagnostic-First Protocol

Before ANY recommendation, gather diagnostic information:

```bash
# 1. Check migration status
npx prisma migrate status

# 2. Compare database to schema
npx prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-schema-datamodel packages/database/schema.prisma

# 3. Check migration table directly
docker exec -it wine-cellar-db psql -U postgres -d wine_cellar -c "
SELECT migration_name, started_at, finished_at, rolled_back_at, logs
FROM \"_prisma_migrations\" ORDER BY started_at DESC;"

# 4. List filesystem migrations
ls -la packages/database/prisma/migrations/
```

## Problem Categories

| Symptom                                   | Category          | Quick Fix                                    |
| ----------------------------------------- | ----------------- | -------------------------------------------- |
| "Drift detected" + deleted migration file | Orphaned Record   | DELETE from `_prisma_migrations`             |
| "Drift detected" + manual DB changes      | Schema Drift      | `db pull` then `migrate dev`                 |
| Drift after switching git branches        | Branch Conflict   | DELETE orphaned records                      |
| Migration started but didn't finish       | Failed Migration  | UPDATE `rolled_back_at` or `migrate resolve` |
| "Migration was modified after applied"    | Checksum Mismatch | UPDATE checksum in table                     |

## Decision Tree

```
Q: Does packages/database/prisma/migrations/ have migration files?
|
+-- NO (new project)
|   +-- `db push` is safe for rapid prototyping
|       When ready: `npx prisma migrate dev --name init`
|
+-- YES (existing migrations)
    +-- NEVER use `db push`
        |
        Q: What's the problem?
        |
        +-- "Migration was modified after applied" (checksum mismatch)
        |   +-- Invoke prisma-surgical-fixes skill
        |
        +-- "Drift detected" + migration file was deleted
        |   +-- Invoke prisma-surgical-fixes skill
        |
        +-- "Drift detected" + manual DB changes made
        |   +-- Invoke prisma-surgical-fixes skill
        |
        +-- "Drift detected" after using db push
        |   +-- Invoke prisma-surgical-fixes skill
        |
        +-- Migration failed mid-execution
        |   +-- Invoke prisma-surgical-fixes skill
        |
        +-- Branch switching conflict
            +-- Invoke prisma-surgical-fixes skill
```

## Sub-Skills

For detailed surgical fixes and recovery procedures:

| Sub-Skill               | Content                                       |
| ----------------------- | --------------------------------------------- |
| `prisma-surgical-fixes` | Detailed SQL fixes for all problem categories |

## Anti-Patterns

**Never do these:**

| Anti-Pattern                                 | Why It's Wrong                         | Do This Instead                         |
| -------------------------------------------- | -------------------------------------- | --------------------------------------- |
| **Use `db push` with existing migrations**   | Causes drift, blocked by our hook      | Use `migrate dev` or baseline migration |
| Suggest reset first                          | Destroys data unnecessarily            | Run diagnostics, offer surgical fix     |
| Run commands without diagnosis               | Can't fix what you don't understand    | Always `migrate status` first           |
| Edit migration.sql without updating checksum | Causes "modified after applied" errors | Update checksum in `_prisma_migrations` |
| Use `migrate dev` in production              | Can reset database                     | Use `migrate deploy`                    |
| Ignore `logs` column                         | Contains actual error message          | Always query failed migration logs      |

## Command Safety Reference

| Command                         | Safety          | Notes                          |
| ------------------------------- | --------------- | ------------------------------ |
| `migrate status`                | Safe            | Read-only                      |
| `migrate diff`                  | Safe            | Read-only, shows changes       |
| `migrate diff --script`         | Safe            | Outputs SQL preview            |
| `validate`                      | Safe            | Checks schema syntax           |
| `migrate dev --create-only`     | Safe            | Creates file only              |
| `migrate resolve --applied`     | Metadata        | Marks migration as applied     |
| `migrate resolve --rolled-back` | Metadata        | Marks migration as rolled back |
| `db pull`                       | Safe            | Modifies schema.prisma only    |
| `db execute`                    | Caution         | Depends on SQL content         |
| `migrate dev`                   | Modifies DB     | May prompt for reset           |
| `migrate deploy`                | Modifies DB     | Production deployment          |
| `migrate reset`                 | **DESTRUCTIVE** | Last resort only               |

## Output Format

When diagnosing, always present:

```
## Diagnosis
**Problem**: [Category from table above]
**Root Cause**: [Specific explanation]
**Evidence**: [Output from diagnostic commands]

## Options (Ranked by Safety)

### Option 1: Surgical Fix (RECOMMENDED)
**Risk**: None - only modifies migration metadata
**Data Impact**: All application data preserved
[Specific commands - invoke prisma-surgical-fixes for details]

### Option 2: [Alternative if applicable]

### Option 3: Full Reset (LAST RESORT)
**Risk**: HIGH - destroys all data
**When appropriate**: Only if you explicitly want fresh database

## Recommendation
I recommend Option 1. Proceed? (I will not execute without confirmation)
```

## Prevention

### Never Edit Applied Migrations

Once a migration has been applied (exists in `_prisma_migrations`), **never edit
the migration.sql file**. Instead:

- Create a new migration with the fix
- Or update the checksum if the edit was cosmetic (whitespace, comments)

### Use `--create-only` for Review

```bash
npx prisma migrate dev --name my_change --create-only
# Review packages/database/prisma/migrations/<timestamp>_my_change/migration.sql
# If good, run: npx prisma migrate dev
# If bad, delete the folder and try again
```

## Docker Access (Wine Cellar)

```bash
# Access database in Docker
docker exec -it wine-cellar-db psql -U postgres -d wine_cellar

# Or use DATABASE_URL from .env
source .env && psql "$DATABASE_URL"
```

## Handling User Objections

| User Says                 | Response                                               |
| ------------------------- | ------------------------------------------------------ |
| "Just reset it"           | Offer surgical fix first, explain it's faster          |
| "SQL seems risky"         | Offer to execute it for them via `db execute`          |
| "I don't care about data" | Acknowledge, but still present surgical option first   |
| "I know what I'm doing"   | Respect autonomy, but ensure they understand tradeoffs |

If user insists on reset after seeing alternatives, proceed — but only after
surgical option was offered.

## Common Rationalizations (Red Flags)

If you're thinking:

- "Reset will be faster" — STOP. Surgical fix takes 30 seconds.
- "It's just dev data" — STOP. User may have test data they need.
- "I'll just try reset" — STOP. Diagnose first.
- "The surgical fix is complex" — STOP. It's one SQL statement.

**All of these mean: Run diagnostics, offer surgical option first.**
