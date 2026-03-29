---
meta:
  spec_id: '008-feature-004-automatic'
  spec_name: 'Automatic Jira status sync during SpecKit implementation'
  status: complete
  phase: complete
  created: '2026-03-28'
  updated: '2026-03-28'

summary:
  goals:
    - {
        id: G1,
        description:
          'Automatically push task status changes to Jira when tasks.json is
          written',
        priority: HIGH,
      }
    - {
        id: G2,
        description:
          'Eliminate manual update_task_status calls during implementation',
        priority: HIGH,
      }
    - {
        id: G3,
        description:
          'Fail-open so Jira outages never block implementation work',
        priority: HIGH,
      }
    - {
        id: G4,
        description:
          'Prompt for initial Jira sync at end of /tasks so the entire flow is
          seamless',
        priority: MEDIUM,
      }
  constraints:
    - {
        id: C1,
        description:
          'Must use existing sync_spec_to_jira and update_task_status MCP tools
          — no new MCP tools',
        type: TECHNICAL,
      }
    - {
        id: C2,
        description:
          'Must follow fail-open pattern established by slack-notify.sh',
        type: TECHNICAL,
      }
    - {
        id: C3,
        description:
          'jira-sync.json presence is the only activation signal — no separate
          toggle',
        type: DESIGN,
      }
    - {
        id: C4,
        description:
          'Jira sync prompt in /tasks must be skippable and non-blocking',
        type: DESIGN,
      }
  decisions:
    - {
        id: D1,
        decision: 'PostToolUse:Write hook pattern (same as slack-notify.sh)',
        rationale:
          'Proven pattern, consistent with existing hooks, fires on tasks.json
          writes',
      }
    - {
        id: D2,
        decision:
          'Shell script calls Node.js dispatcher (mirrors Slack architecture)',
        rationale:
          'Hook scripts are bash, MCP interaction needs Node — same split as
          Slack',
      }
    - {
        id: D3,
        decision: 'Jira sync prompt added to end of /tasks command',
        rationale:
          'Tasks just got created — earliest useful moment to populate Jira.
          Arms the auto-sync hook before /implement starts.',
      }

critical_requirements:
  type: feature-minor
  ui_changes: none
---

# Feature Specification: Automatic Jira Status Sync

**Spec**: `008-feature-004-automatic` **Created**: 2026-03-28 **Status**:
Complete **Input**: User description: "Feature 004 - Automatic Jira status sync
during SpecKit implementation"

---

## User Scenarios & Testing

### Primary User Story

After running `/tasks` to generate the task list, the developer is prompted:
"Sync tasks to Jira? [Y/n]". If they say yes, `sync_spec_to_jira` runs
immediately, creating the Epic and Stories in Jira and producing
`jira-sync.json`. From that point on, every task status change during
`/implement` (whether via Ralph loop, manual task updates, or direct writes)
automatically pushes to Jira without any further manual intervention. The entire
flow — from task generation to Jira board fully in sync — requires exactly one
"Y" from the developer.

### Acceptance Scenarios

**Initial sync prompt (in `/tasks`)**:

1. **Given** `/tasks` has just written tasks.json, **When** Jira MCP server is
   configured (env vars present), **Then** the developer is prompted "Sync tasks
   to Jira? [Y/n]".

2. **Given** the developer answers "Y" to the Jira sync prompt, **When**
   `sync_spec_to_jira` completes successfully, **Then** `jira-sync.json` is
   created in the spec directory and a summary of created Epic + Stories is
   displayed.

3. **Given** the developer answers "n" to the Jira sync prompt, **When**
   `/tasks` completes, **Then** no Jira sync occurs and no `jira-sync.json` is
   created. The developer can manually run `sync_spec_to_jira` later.

4. **Given** Jira MCP server is NOT configured (missing env vars or server
   unavailable), **When** `/tasks` completes, **Then** no Jira prompt is shown
   at all.

**Automatic status sync (PostToolUse hook)**:

5. **Given** a spec with `jira-sync.json` present (initial sync already done),
   **When** a task status changes from `pending` to `in_progress` in tasks.json,
   **Then** the corresponding Jira Story transitions to the mapped "In Progress"
   status.

6. **Given** a spec with `jira-sync.json` present, **When** a task status
   changes from `in_progress` to `completed` in tasks.json, **Then** the
   corresponding Jira Story transitions to the mapped "Done" status.

7. **Given** a spec with `jira-sync.json` present, **When** multiple tasks
   change status in a single tasks.json write, **Then** each changed task
   triggers an individual status update call.

8. **Given** a spec directory with NO `jira-sync.json`, **When** tasks.json is
   written, **Then** the hook exits silently (no Jira calls, no errors).

9. **Given** a spec with `jira-sync.json` present, **When** the Jira API is
   unreachable or returns an error, **Then** the hook logs the error to stderr
   and exits 0 (fail-open), never blocking the developer's work.

10. **Given** a spec with `jira-sync.json` present, **When** a task status does
    not change (same status before and after), **Then** no Jira call is made for
    that task.

### Edge Cases

- What happens when `/tasks` is re-run on a spec that already has
  `jira-sync.json`? **Skip the prompt** — Jira is already synced, no need to ask
  again.
- What happens when the developer says "Y" but `sync_spec_to_jira` fails?
  **Display the error and continue** — `/tasks` completes normally, developer
  can retry manually.
- What happens when `jira-sync.json` exists but a task ID has no mapping (new
  task added after initial sync)? **Skip that task silently** — it needs a
  re-sync, not an auto-update.
- What happens when the tasks.json file is brand new (first write, no previous
  file to diff)? **Treat all non-pending tasks as changes** — if a task is
  already `in_progress` or `completed` in the first write, push those statuses.
- What happens when `jira-sync.json` is malformed or unreadable? **Exit
  silently** — fail-open.
- What happens when tasks.json write contains subtasks (T-VERIFY tasks)?
  **Include them** — T-VERIFY tasks have Jira Sub-task mappings in
  jira-sync.json and should sync like any other task.

## Requirements

### Functional Requirements

**Initial sync prompt (in `/tasks`)**:

- **FR-001**: The `/tasks` command MUST prompt "Sync tasks to Jira? [Y/n]" after
  writing tasks.json, but only when the Jira MCP server is available.
- **FR-002**: When the developer answers "Y", the system MUST call
  `sync_spec_to_jira` with the spec directory and display the sync summary (Epic
  key, number of Stories created).
- **FR-003**: When the developer answers "n" or the Jira MCP server is
  unavailable, the system MUST skip silently and complete `/tasks` normally.
- **FR-004**: The prompt MUST NOT appear if `jira-sync.json` already exists in
  the spec directory (re-running `/tasks` on an already-synced spec).

**Automatic status sync (PostToolUse hook)**:

- **FR-005**: System MUST detect task status changes by comparing new tasks.json
  content against the existing file on disk (same diffing approach as
  slack-notify.sh).
- **FR-006**: System MUST read `jira-sync.json` from the spec directory to
  obtain task-to-Jira-key mappings.
- **FR-007**: System MUST call a Node.js dispatcher for each task whose status
  changed, passing `specDir`, `taskId`, and the new `status`.
- **FR-008**: System MUST skip tasks that have no mapping in `jira-sync.json`
  (unmapped task IDs).
- **FR-009**: System MUST exit 0 in all error scenarios (fail-open): missing
  jira-sync.json, malformed JSON, network failures, MCP tool errors.
- **FR-010**: System MUST only fire for tasks.json/prd.json writes within
  `specs/*/` directories (same path matching as slack-notify.sh).
- **FR-011**: System MUST be registered as a PostToolUse:Write hook in
  `.claude/settings.json`.
- **FR-012**: System MUST map SpecKit statuses to Jira statuses using the
  mappings already defined in jira-mcp config (pending→To Do, in_progress→In
  Progress, completed→Done, blocked→Blocked).
- **FR-013**: System MUST handle the "first write" case where no previous
  tasks.json exists by treating the initial state as all-pending.

### Key Entities

- **jira-sync.json**: Per-spec file created by `sync_spec_to_jira`. Contains
  task-to-Jira-key mappings. Its presence signals Jira integration is active for
  that spec.
- **tasks.json**: SpecKit task file written during `/tasks` and updated during
  `/implement`. Contains task IDs and statuses.
- **jira-notify.js**: Node.js dispatcher script (in `packages/jira-mcp/`) that
  accepts task change events and calls the Jira API to transition issue
  statuses. Mirrors the `packages/slack-mcp/build/notify.js` pattern.

### Test Strategy

**Test Type Classification**:

| FR     | Primary Test Type   | Reason                                                    |
| ------ | ------------------- | --------------------------------------------------------- |
| FR-001 | Manual verification | `/tasks` command template change — verified by inspection |
| FR-002 | Integration         | Calls `sync_spec_to_jira` MCP tool (mocked at boundary)   |
| FR-003 | Manual verification | Skip path in `/tasks` template                            |
| FR-004 | Integration         | Checks jira-sync.json existence before prompting          |
| FR-005 | Integration         | Requires file I/O and JSON diffing                        |
| FR-006 | Integration         | Reads jira-sync.json from disk                            |
| FR-007 | Integration         | Calls external dispatcher (mocked at boundary)            |
| FR-008 | Unit                | Pure logic: filter unmapped task IDs                      |
| FR-009 | Integration         | Error path testing with simulated failures                |
| FR-010 | Unit                | Path pattern matching                                     |
| FR-011 | Manual verification | Hook registration in settings.json                        |
| FR-012 | Unit                | Status mapping logic                                      |
| FR-013 | Integration         | File existence check + default state                      |

**This Feature**:

- Feature type: [X] Backend-heavy [ ] Frontend-heavy [ ] Mixed
- Unit: 30% | Integration: 55% | Manual: 15%

**Estimated Test Count**: 14-18 tests based on 13 functional requirements

### Error Handling & Recovery

**Error Scenarios**:

| Error Scenario                          | Type      | User Message                        | Recovery Action                       |
| --------------------------------------- | --------- | ----------------------------------- | ------------------------------------- |
| Jira MCP server unavailable (in /tasks) | Expected  | No prompt shown                     | Skip Jira prompt entirely             |
| sync_spec_to_jira fails (in /tasks)     | Transient | Display error, suggest manual retry | Continue /tasks normally              |
| jira-sync.json missing (in hook)        | Expected  | None (silent skip)                  | Exit 0                                |
| jira-sync.json malformed (in hook)      | Permanent | stderr log                          | Exit 0                                |
| tasks.json parse failure (in hook)      | Permanent | stderr log                          | Exit 0                                |
| Jira API unreachable (in hook)          | Transient | stderr log                          | Exit 0, next write retries naturally  |
| Dispatcher returns error (in hook)      | Transient | stderr log                          | Exit 0, continue with remaining tasks |
| Task ID not in jira-sync.json (in hook) | Expected  | None (silent skip)                  | Skip task, continue                   |

**Resumability**:

- [x] Operation can resume from last checkpoint? Yes — each tasks.json write
      re-diffs, so missed updates get caught on the next write.
- [x] Idempotency guaranteed? Yes — transitioning to the same Jira status is a
      no-op.

### UI/Design Reference

**Feature Classification**:

- [x] **Backend-only** (no UI changes) - Skip design sections

---

## Review Checklist (Gate)

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Test strategy defined
- [x] Error handling defined (if can fail)
- [x] UI complexity classified (if has UI)

---
