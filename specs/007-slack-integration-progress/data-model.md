# Data Model: Slack Integration — SpecKit Progress Notifications

**Date**: 2026-03-27 | **Spec**: 007-slack-integration-progress

---

## Entities

This feature has no database entities (no Prisma changes). All data is transient
— configuration from env vars, event payloads constructed per-notification, and
spec state read from the filesystem.

---

## Configuration Model

### SlackConfig

Loaded once at startup via Zod validation. Two modes determined by which env
vars are present.

| Field        | Source              | Required        | Default | Validation                                        |
| ------------ | ------------------- | --------------- | ------- | ------------------------------------------------- |
| `webhookUrl` | `SLACK_WEBHOOK_URL` | No\*            | —       | Valid URL, starts with `https://hooks.slack.com/` |
| `botToken`   | `SLACK_BOT_TOKEN`   | No\*            | —       | Non-empty string, starts with `xoxb-`             |
| `channel`    | `SLACK_CHANNEL`     | If botToken set | —       | Non-empty string                                  |
| `timeoutMs`  | `SLACK_TIMEOUT_MS`  | No              | `5000`  | Positive integer, max 30000                       |

\*At least one of `webhookUrl` or `botToken` must be present. If neither is set,
the system operates in no-op mode.

### Mode Detection

```
if webhookUrl → WEBHOOK mode (personal, hooks fire automatically)
if botToken + channel → MCP mode (team, tools called explicitly)
if both → BOTH modes active
if neither → NO-OP mode (silent, no errors)
```

---

## Event Types

### NotificationEvent

Represents a single SpecKit event to notify about.

| Field       | Type                                                     | Description                                    |
| ----------- | -------------------------------------------------------- | ---------------------------------------------- |
| `type`      | `'phase_transition' \| 'task_completion' \| 'milestone'` | Event category                                 |
| `specId`    | `string`                                                 | Spec number (e.g., "007")                      |
| `specName`  | `string`                                                 | Spec name (e.g., "slack-integration-progress") |
| `timestamp` | `string`                                                 | ISO 8601 timestamp                             |
| `details`   | `PhaseTransition \| TaskCompletion \| Milestone`         | Type-specific payload                          |

### PhaseTransition

| Field       | Type           | Description    |
| ----------- | -------------- | -------------- |
| `fromPhase` | `SpecKitPhase` | Previous phase |
| `toPhase`   | `SpecKitPhase` | New phase      |

### TaskCompletion

| Field             | Type                      | Description                    |
| ----------------- | ------------------------- | ------------------------------ |
| `taskId`          | `string`                  | Task identifier (e.g., "T001") |
| `taskDescription` | `string`                  | Short description              |
| `status`          | `'completed' \| 'failed'` | Outcome                        |

### Milestone

| Field       | Type                                                        | Description            |
| ----------- | ----------------------------------------------------------- | ---------------------- |
| `milestone` | `'spec_created' \| 'all_tasks_complete' \| 'verify_passed'` | Milestone type         |
| `summary`   | `string`                                                    | Human-readable summary |

### SpecKitPhase

```typescript
type SpecKitPhase = 'specify' | 'plan' | 'tasks' | 'implement' | 'verify';
```

---

## SpecProgress (MCP Read Model)

Parsed from spec frontmatter + tasks.json on demand. Not persisted.

| Field            | Type           | Source                                    |
| ---------------- | -------------- | ----------------------------------------- |
| `specId`         | `string`       | spec.md frontmatter `meta.spec_id`        |
| `specName`       | `string`       | spec.md frontmatter `meta.spec_name`      |
| `phase`          | `SpecKitPhase` | spec.md frontmatter `meta.phase`          |
| `totalTasks`     | `number`       | tasks.json `.tasks.length`                |
| `completedTasks` | `number`       | tasks.json count where status = completed |
| `failedTasks`    | `number`       | tasks.json count where status = failed    |
| `pendingTasks`   | `number`       | tasks.json count where status = pending   |

---

## State Management

**No persistent state file.** Unlike jira-mcp (which maintains jira-sync.json),
this integration is stateless. Each notification is independent — no sync state,
no content hashing, no mapping tables. This keeps the implementation simple and
avoids state drift.
