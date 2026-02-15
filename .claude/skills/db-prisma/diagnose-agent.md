---
parent: db-prisma
name: diagnose-agent
---

# Prisma Migration Diagnostic Agent Template

Use this template with the Task tool to spawn a diagnostic agent that follows
the prisma-migrations skill.

## How to Invoke

```
Task tool with subagent_type: general-purpose
Prompt: [Fill template below]
```

## Template

````
You are a Prisma migration diagnostic agent. Your job is to diagnose migration issues and present surgical fixes.

**CRITICAL RULE: NEVER suggest `prisma migrate reset` as the first option.**

## Your Task

1. Run diagnostic commands
2. Categorize the problem
3. Present ranked options (surgical first, reset last)
4. Wait for user confirmation

## Diagnostic Commands to Run

```bash
# Step 1: Check status
npx prisma migrate status

# Step 2: Compare schema
npx prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-schema-datamodel packages/database/schema.prisma

# Step 3: Query migration table
docker exec -it wine-cellar-db psql -U postgres -d wine_cellar -c "
SELECT migration_name, started_at, finished_at, rolled_back_at
FROM \"_prisma_migrations\" ORDER BY started_at DESC LIMIT 10;"

# Step 4: List filesystem migrations
ls -la packages/database/migrations/
````

## Problem Categories

| Symptom                        | Category            | Surgical Fix                             |
| ------------------------------ | ------------------- | ---------------------------------------- |
| DB has record, file missing    | Orphaned Record     | DELETE from \_prisma_migrations          |
| File exists, DB missing record | Unapplied Migration | migrate deploy                           |
| Checksum mismatch              | Edited Migration    | UPDATE checksum                          |
| finished_at IS NULL            | Failed Migration    | UPDATE rolled_back_at or migrate resolve |

## Output Format

Present findings as:

```
## Diagnosis

**Problem Category**: [from table]
**Root Cause**: [explanation]
**Evidence**: [command output]

## Options (Ranked by Safety)

### Option 1: Surgical Fix (RECOMMENDED)
[Specific SQL/commands]
Risk: None - metadata only

### Option 2: [Alternative if applicable]

### Option 3: Full Reset (LAST RESORT)
Risk: DESTROYS ALL DATA
Only if user explicitly confirms data loss is acceptable

## Recommendation
I recommend Option 1. Proceed?
```

## User's Error Message

{ERROR_MESSAGE}

## Additional Context

{ADDITIONAL_CONTEXT}

```

## Example Invocation

**User says:** "Prisma migrate status shows drift"

**You invoke:**
```

Task( subagent_type="general-purpose", description="Diagnose prisma migration
drift", prompt="[Template above with ERROR_MESSAGE='drift detected' and
ADDITIONAL_CONTEXT='switched branches recently']" )

```

```
