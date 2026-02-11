# ATOM Framework

> **A**nthropic **T**ask **O**perations **M**anager - Minimal hook system for
> context preservation and safety enforcement

ATOM provides lightweight hooks for stale file prevention, dangerous command
blocking, context preservation during compaction, and verification evidence
enforcement.

## Philosophy

**Lean by Design**: Captures context only at critical moments (compaction) and
prevents errors (stale edits, dangerous commands). No continuous monitoring, no
autonomous task loops.

**Token Budget**: 6 hooks across 4 event types, zero runtime overhead outside
triggered events.

## Active Hooks

| Event            | Hook                           | Timeout | Purpose                         |
| ---------------- | ------------------------------ | ------- | ------------------------------- |
| PreToolUse:Edit  | `pre-edit-verify.sh`           | 3s      | Stale file prevention           |
| PreToolUse:Bash  | `forbidden-command-blocker.sh` | 3s      | Dangerous command blocking      |
| PreToolUse:Write | `file-placement-guard.sh`      | 3s      | Repo root file prevention       |
| PreCompact       | `precompact.sh`                | 2s      | Context snapshot before compact |
| SessionStart     | `session-start.sh`             | 2s      | Compaction recovery             |
| Stop             | `record-verification.sh`       | 5s      | T-VERIFY evidence gate          |

## How Each Hook Works

### pre-edit-verify.sh (PreToolUse:Edit)

Verifies `old_string` exists in the target file before allowing an Edit. Catches
stale-file edits where the file has changed since it was last read.

- Empty `old_string` → allow (prepend operation)
- File doesn't exist → deny
- `old_string` not found → deny with "re-read {file} before editing"

### forbidden-command-blocker.sh (PreToolUse:Bash)

Blocks dangerous commands:

| Pattern                           | Action                                      |
| --------------------------------- | ------------------------------------------- |
| `npx prisma db push`              | Deny — use `npm run db:push` (safe wrapper) |
| `git push --force` to main/master | Deny — force push to main blocked           |
| `git reset --hard`                | Deny — unconditionally blocked              |

### file-placement-guard.sh (PreToolUse:Write)

Blocks creation of `.sh`, `.sql`, `.py` files in the repo root. These belong in
`scripts/` subdirectories. Only blocks NEW file creation — editing existing
files is allowed.

### precompact.sh (PreCompact)

Saves a one-line snapshot before compaction: `spec:{id}|task:{id}|time:{HH:MM}`
→ `.claude/session-context/compaction-snapshot.txt`

### session-start.sh (SessionStart)

Restores context after compaction by reading the snapshot file. Also cleans up
old background task output files (>7 days).

### record-verification.sh (Stop)

Blocks session end if T-VERIFY tasks lack fresh evidence (< 30 min). Reads
`current-work.md` for active spec, checks `tasks.json` for T-VERIFY tasks,
validates evidence in `specs/{NNN}/evidence/{task-id}.ndjson`.

**Fail-open**: No active spec, no tasks.json, or no T-VERIFY tasks → allows
through.

## Evidence System

Evidence files use NDJSON format, stored per-task:

```
specs/{NNN}-{name}/
  evidence/
    T-VERIFY-LINT.ndjson      # Append-only verdicts
    T-VERIFY-TEST.ndjson      # Append-only verdicts
    ...
```

Each line is a JSON object with: `timestamp`, `status` (pass/fail), `summary`,
`command`, `exit_code`.

## Design Principles

1. **Fail-open**: All hooks allow through on error (exit 0 always)
2. **JSON output**: All decisions via stdout JSON
3. **Minimal tokens**: PreToolUse hooks cost 0 tokens (block before LLM)
4. **One-time recovery**: Compaction snapshots are deleted after use

## Configuration

All hooks registered in `.claude/settings.json`. See each hook file for detailed
comments.

## Origin

Adapted from Bryan's Framework v3 (February 2026). See
`documents/bryan-framework-v3-adoption-plan.md` for full adoption rationale.
