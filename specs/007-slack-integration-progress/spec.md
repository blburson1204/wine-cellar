---
# Context Optimization Metadata
meta:
  spec_id: '007'
  spec_name: slack-integration-progress
  status: draft
  phase: specify
  created: 2026-03-27
  updated: 2026-03-27

# Quick Reference (for checkpoint resume)
summary:
  goals:
    - {
        id: G1,
        description:
          'Send Slack notifications on SpecKit phase transitions and task
          completions',
        priority: HIGH,
      }
    - {
        id: G2,
        description: 'Support personal webhook mode for solo developers',
        priority: HIGH,
      }
    - {
        id: G3,
        description: 'Support MCP server mode for team visibility',
        priority: MEDIUM,
      }
  constraints:
    - {
        id: C1,
        description: 'Must not block SpecKit pipeline on notification failures',
        type: TECHNICAL,
      }
    - {
        id: C2,
        description: 'Must follow existing MCP server pattern from jira-mcp',
        type: TECHNICAL,
      }
    - {
        id: C3,
        description:
          'Slack API tokens and webhook URLs must never be committed',
        type: SECURITY,
      }
  decisions:
    - {
        id: D1,
        decision:
          'Dual-mode architecture: webhook (personal) + MCP server (team)',
        rationale:
          'Webhooks are zero-config for solo use; MCP server enables richer team
          interactions',
      }
    - {
        id: D2,
        decision:
          'New package at packages/slack-mcp following jira-mcp patterns',
        rationale:
          'Consistent monorepo structure and proven MCP server architecture',
      }

# CRITICAL REQUIREMENTS - Must verify during implementation
critical_requirements:
  type: feature-major
  ui_changes: none
---

# Feature Specification: Slack Integration — SpecKit Progress Notifications

**Feature Branch**: `007-slack-integration-progress` **Created**: 2026-03-27
**Status**: Draft **Input**: User description: "Slack integration - Progress
notifications for SpecKit phases/tasks. Webhook for personal use, MCP server for
team use. Notify on phase transitions, task completions, and key milestones
during SpecKit workflows."

---

## Clarifications

### Session 2026-03-27

- Q: How should the system detect SpecKit phase transitions? → A: Both — hooks
  for automatic webhook mode, MCP tools for team/manual mode (C)
- Q: What counts as a "key milestone" beyond phase transitions and task
  completions? → A: Spec created, all tasks complete (summary), verify passed
  (A)
- Q: Should notification types be configurable, or all-or-nothing? → A: Start
  with all-or-nothing, add filtering later (C)
- Q: Does this spec include modifying existing SpecKit hooks to trigger
  notifications, or just the package? → A: Package + modify existing hooks to
  also fire Slack notifications (C)
- Q: Should the MCP server mirror jira-mcp's `update_task_status` tool? → A:
  Minimal now (`send_progress` + `get_spec_status`), design for extensibility
  (C)
- Q: For webhook mode, should there be a configurable HTTP timeout? → A:
  Configurable via `SLACK_TIMEOUT_MS` env var (B)

---

## User Scenarios & Testing

### Primary User Story

As a developer using SpecKit, I want to receive Slack notifications when phases
transition (specify → plan → tasks → implement → verify), when tasks complete,
and at key milestones, so I have a passive record of project progress without
checking the terminal.

### Secondary User Story

As a team lead, I want an MCP server that posts SpecKit progress to a shared
Slack channel so the team has visibility into feature development status.

### Acceptance Scenarios

1. **Given** a configured webhook URL in environment, **When** a SpecKit phase
   transitions (e.g., specify → plan), **Then** a formatted Slack message is
   posted to the configured channel with spec name, old phase, new phase, and
   timestamp.

2. **Given** a configured webhook URL, **When** a task completes during
   `/implement`, **Then** a Slack message is posted with task ID, description,
   and completion status (pass/fail).

3. **Given** the MCP server is running, **When** a client calls the
   `send_progress` tool, **Then** a rich Slack message is posted to the
   configured channel.

4. **Given** the MCP server is running, **When** a client calls the
   `get_spec_status` tool with a spec ID, **Then** the current phase, completed
   tasks, and remaining tasks are returned.

5. **Given** an invalid or expired webhook URL, **When** a notification is
   attempted, **Then** the failure is logged but does not block the SpecKit
   pipeline.

6. **Given** no Slack configuration is present, **When** SpecKit runs, **Then**
   no notifications are sent and no errors occur (graceful no-op).

### Edge Cases

- What happens when Slack rate-limits the webhook? Notifications should be
  dropped with a warning log, not queued or retried.
- What happens when the webhook URL is malformed? Fail on startup validation
  with a clear error message.
- What happens when multiple specs run concurrently? Each notification must
  include the spec ID to avoid confusion.
- What happens during network outages? Notifications silently fail; SpecKit
  pipeline continues unaffected.

## Requirements

### Functional Requirements

- **FR-001**: System MUST send a Slack notification when a SpecKit phase
  transitions (specify → plan → tasks → implement → verify). In webhook mode,
  existing SpecKit hooks MUST be modified to trigger notifications
  automatically. In MCP mode, the `send_progress` tool is called explicitly by
  the client.
- **FR-002**: System MUST send a Slack notification when a task completes during
  `/implement`, including task ID and pass/fail status.
- **FR-003**: System MUST support a webhook mode that posts to an incoming
  webhook URL configured via environment variable (`SLACK_WEBHOOK_URL`).
- **FR-004**: System MUST support an MCP server mode that exposes tools for
  sending progress updates and querying spec status.
- **FR-005**: System MUST include spec ID, spec name, and timestamp in every
  notification.
- **FR-006**: System MUST NOT block or slow down the SpecKit pipeline if Slack
  notifications fail.
- **FR-007**: System MUST gracefully no-op when no Slack configuration is
  present.
- **FR-008**: System MUST validate configuration on startup and surface clear
  errors for invalid values (malformed URLs, missing tokens).
- **FR-009**: MCP server MUST expose a `send_progress` tool for posting
  arbitrary progress messages.
- **FR-010**: MCP server MUST expose a `get_spec_status` tool that returns
  current phase and task completion summary for a given spec.
- **FR-011**: System MUST format messages using Slack Block Kit for readability
  (phase emoji, color-coded status, structured fields).
- **FR-012**: System MUST support configuring the target Slack channel via
  environment variable (`SLACK_CHANNEL`) for MCP server mode. Webhook mode does
  not need channel override (channel is baked into the webhook URL).
- **FR-013**: System MUST send milestone notifications for: spec created, all
  tasks complete (summary), and verify passed.
- **FR-014**: System MUST modify existing SpecKit hooks (phase transition, task
  completion) to call the Slack notification package when `SLACK_WEBHOOK_URL` is
  configured.
- **FR-015**: System MUST support a configurable HTTP timeout via
  `SLACK_TIMEOUT_MS` environment variable (default: 5000ms).
- **FR-016**: MCP server MUST be designed for extensibility, allowing additional
  tools (e.g., `update_task_status`) to be added in future without refactoring.

### Key Entities

- **Notification**: A single Slack message representing a SpecKit event (phase
  transition, task completion, or milestone). Contains: spec ID, spec name,
  event type, details, timestamp.
- **SlackConfig**: Configuration for connecting to Slack. Webhook mode:
  `SLACK_WEBHOOK_URL`. MCP mode: `SLACK_BOT_TOKEN`, `SLACK_CHANNEL`. Shared:
  `SLACK_TIMEOUT_MS` (optional, default 5000ms).
- **SpecProgress**: Summary of a spec's current state — phase, total tasks,
  completed tasks, failed tasks.

### Test Strategy

**Test Type Classification**:

| FR     | Primary Test Type | Reason                                      |
| ------ | ----------------- | ------------------------------------------- |
| FR-001 | Integration       | Hook integration + message formatting       |
| FR-002 | Integration       | Task completion event + message formatting  |
| FR-003 | Unit              | Webhook client with mocked HTTP             |
| FR-004 | Integration       | MCP server tool registration + dispatch     |
| FR-005 | Unit              | Message payload construction                |
| FR-006 | Integration       | Failure isolation behavior                  |
| FR-007 | Unit              | Config detection and no-op path             |
| FR-008 | Unit              | Config validation logic                     |
| FR-009 | Integration       | MCP tool handler                            |
| FR-010 | Integration       | MCP tool handler + spec file parsing        |
| FR-011 | Unit              | Block Kit message formatting                |
| FR-012 | Unit              | Channel config resolution                   |
| FR-013 | Integration       | Milestone event detection + message content |
| FR-014 | Integration       | Hook modification + notification dispatch   |
| FR-015 | Unit              | Timeout config parsing and application      |
| FR-016 | Unit              | Extensible tool registration pattern        |

**This Feature**:

- Feature type: [X] Backend-heavy [ ] Frontend-heavy [ ] Mixed
- Unit: 50% | Integration: 50% | E2E: 0%

**Estimated Test Count**: ~50 tests based on 16 functional requirements

### Error Handling & Recovery

| Error Scenario           | Type      | User Message                            | Recovery Action            |
| ------------------------ | --------- | --------------------------------------- | -------------------------- |
| Invalid webhook URL      | Permanent | "Invalid SLACK_WEBHOOK_URL format"      | Fail startup validation    |
| Webhook POST fails (4xx) | Permanent | Logged warning, no user message         | Drop notification silently |
| Webhook POST fails (5xx) | Transient | Logged warning, no user message         | Drop notification silently |
| Slack rate limit (429)   | Transient | Logged warning, no user message         | Drop notification silently |
| Network timeout          | Transient | Logged warning, no user message         | Drop notification silently |
| Missing bot token (MCP)  | Permanent | "SLACK_BOT_TOKEN required for MCP mode" | Fail startup validation    |
| Spec file not found      | Permanent | Return error in MCP tool response       | Return error details       |

**Resumability**:

- [x] Operation can resume from last checkpoint? (each notification is
      independent; no state to resume)
- [x] Idempotency guaranteed? (duplicate notifications are acceptable — no side
      effects beyond messaging)

---

## Open Questions

_All questions resolved during clarification session 2026-03-27. No outstanding
items._

---

## Review Checklist (Gate)

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Test strategy defined
- [x] Error handling defined
- [x] UI complexity classified (backend-only)

---
