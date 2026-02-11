# ATOM Gate Execution

> How T-VERIFY quality gates work with the evidence system

## Gate Types

Our quality gates match the wine-cellar npm scripts:

| Gate ID            | Command                 | Block Condition       |
| ------------------ | ----------------------- | --------------------- |
| T-VERIFY-TYPECHECK | `npm run type-check`    | TypeScript errors     |
| T-VERIFY-LINT      | `npm run lint`          | ESLint violations     |
| T-VERIFY-FORMAT    | `npm run format:check`  | Prettier violations   |
| T-VERIFY-TEST      | `npm test`              | Any test failure      |
| T-VERIFY-COVERAGE  | `npm run test:coverage` | Coverage below target |

## Evidence Format (NDJSON)

Each T-VERIFY task gets an evidence file at
`specs/{NNN}-{name}/evidence/{task-id}.ndjson`. Each line is a JSON record:

```json
{
  "timestamp": "2026-02-11T14:30:00Z",
  "status": "pass",
  "summary": "799 tests passed",
  "command": "npm test",
  "exit_code": 0
}
```

### Required Fields

| Field       | Type   | Description              |
| ----------- | ------ | ------------------------ |
| `timestamp` | string | ISO 8601 UTC             |
| `status`    | string | `pass` or `fail`         |
| `summary`   | string | Human-readable result    |
| `command`   | string | Command that was run     |
| `exit_code` | number | Exit code of the command |

## Freshness Check

The `record-verification.sh` Stop hook enforces a 30-minute freshness window.
Evidence older than 30 minutes is considered stale and blocks session end.

## Execution Flow

```
Session end requested
  → record-verification.sh reads current-work.md
  → Finds active spec → reads tasks.json
  → For each T-VERIFY task:
      → Check evidence/{task-id}.ndjson exists
      → Parse last line for status + timestamp
      → Verify status=pass AND timestamp < 30 min old
  → All pass → allow session end
  → Any missing/stale/failed → block with details
```

## Fail-Open Conditions

The gate system is designed to fail-open (allow through) when:

- No `current-work.md` exists
- No active spec in `current-work.md`
- No `tasks.json` found
- No T-VERIFY tasks in `tasks.json`
- JSON parse errors in any file

This ensures hooks never block non-spec work or break on infrastructure issues.
