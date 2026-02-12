---
# Context Optimization Metadata
meta:
  spec_id: '006'
  spec_name: jira-integration-map
  status: draft
  phase: specify
  created: '2026-02-12'
  updated: '2026-02-12'

# Quick Reference (for checkpoint resume)
summary:
  goals:
    - {
        id: G1,
        description: 'Push SpecKit task output to Jira as Epic/Story hierarchy',
        priority: HIGH,
      }
    - {
        id: G2,
        description:
          'Build MCP server so Claude Code can interact with Jira natively',
        priority: HIGH,
      }
    - {
        id: G3,
        description: 'Keep Jira status in sync with SpecKit task progress',
        priority: MEDIUM,
      }
  constraints:
    - {
        id: C1,
        description:
          'Must not require changes to existing SpecKit pipeline output',
        type: TECHNICAL,
      }
    - {
        id: C2,
        description: 'Must work with Jira Cloud REST API',
        type: TECHNICAL,
      }
    - {
        id: C3,
        description: 'Credentials must never be committed to repo',
        type: SECURITY,
      }
    - {
        id: C4,
        description:
          'Sync is one-way push (SpecKit → Jira) with read-back for status
          display',
        type: SCOPE,
      }
  decisions:
    - {
        id: D1,
        decision: 'MCP server is the primary integration mechanism',
        rationale: 'Claude Code can invoke tools directly; avoids separate CLI',
      }
    - {
        id: D2,
        decision: 'One-way push with read-back sync model',
        rationale:
          'SpecKit remains source of truth; Jira may gain stories independently
          but does not modify SpecKit state',
      }
    - {
        id: D3,
        decision:
          'Separate jira-sync.json per spec directory for mapping storage',
        rationale: 'Clean separation; tasks.json schema unchanged',
      }
    - {
        id: D4,
        decision:
          'API token auth initially, structured for OAuth 2.0 addition later',
        rationale: 'Team/company use anticipated; OAuth needed eventually',
      }

# CRITICAL REQUIREMENTS - Must verify during implementation
critical_requirements:
  type: feature-major
  ui_changes: none
---

# Feature Specification: Jira Integration for SpecKit

**Feature Directory**: `006-jira-integration-map` **Created**: 2026-02-12
**Status**: Draft **Input**: User description: "Map SpecKit /tasks output to
Jira tickets. Spec → Epic, Tasks → Stories. Custom MCP server for Jira tailored
to SpecKit Epic→Task hierarchy."

---

## Quick Guidelines

- Focus on WHAT users need and WHY
- Avoid HOW to implement (no tech stack, APIs, code structure)
- Written for understanding requirements, not implementation details

---

## Clarifications

### Session 2026-02-12

- Q: What is the sync direction? → A: One-way push with read-back. SpecKit
  pushes to Jira and can read Jira status for display, but never writes back to
  tasks.json. New stories/tasks added directly in Jira are observed but do not
  modify SpecKit state. Watch for whether Jira-side additions eventually need to
  flow back.
- Q: Where should the SpecKit↔Jira ID mapping be stored? → A: Separate
  `jira-sync.json` file in each spec directory. Keeps tasks.json schema
  untouched.
- Q: How should the system handle conflicts when Jira stories were manually
  modified? → A: Warn on conflict and skip conflicting stories. Sync only
  non-conflicting items, log warnings for divergent ones. Monitor frequency to
  determine if manual resolution (stricter handling) is needed later.
- Q: How should T-VERIFY tasks appear in Jira? → A: Sync as Sub-tasks under the
  Epic. Distinguishes verification gates from implementation Stories visually
  and semantically.
- Q: When a task is removed from tasks.json after initial sync, what happens to
  the Jira story? → A: Transition the Jira story to "Won't Do" status. Company
  uses a standardized Jira workflow, so this transition is expected to be
  available.
- Q: Is API token authentication sufficient, or is OAuth 2.0 needed? → A: API
  token now, design auth layer for OAuth 2.0 addition later. Team/company use is
  anticipated, so the auth abstraction should accommodate both.

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a solo developer using SpecKit to manage feature work, I want to push my
spec's task breakdown to Jira so that my project board reflects the same work
structure I'm executing in Claude Code. When I complete tasks via `/implement`,
I want Jira stories to update automatically, keeping stakeholders (or my own
tracking) in sync without manual ticket management.

### Acceptance Scenarios

1. **Given** a completed `/tasks` phase with a valid `tasks.json`, **When** the
   developer invokes the Jira sync tool, **Then** a Jira Epic is created with
   the spec name and all tasks are created as Stories linked to that Epic, with
   T-VERIFY tasks created as Sub-tasks.

2. **Given** an existing Jira Epic previously synced from a spec, **When** the
   developer runs sync again after completing tasks, **Then** the corresponding
   Jira Stories are updated to reflect the new status (e.g., pending →
   in_progress → completed).

3. **Given** a task with a `gate` dependency on another task, **When** stories
   are created in Jira, **Then** the dependency is represented as a "Blocked by"
   link between the stories.

4. **Given** no Jira credentials are configured, **When** the developer invokes
   the sync tool, **Then** the system provides a clear error message explaining
   what credentials are needed and where to configure them.

5. **Given** a Jira project that uses custom issue types or workflows, **When**
   the developer attempts to sync, **Then** the system uses configurable
   mappings (with sensible defaults) rather than assuming specific Jira project
   configuration.

6. **Given** a Jira story that was manually modified (summary, description, or
   status changed outside SpecKit), **When** sync runs, **Then** the system
   detects the conflict, logs a warning, and skips that story while syncing all
   non-conflicting items.

7. **Given** a task that was removed from `tasks.json` after a previous sync,
   **When** sync runs, **Then** the corresponding Jira story is transitioned to
   "Won't Do" status.

### Edge Cases

- What happens when a Jira Epic already exists for this spec but individual
  stories were manually modified in Jira? System warns and skips conflicting
  stories; syncs non-conflicting ones. Frequency monitored for potential
  escalation to manual resolution.
- What happens when a task is added to `tasks.json` after initial sync? New
  stories created, existing ones untouched.
- What happens when a task is removed from `tasks.json` after initial sync?
  Corresponding Jira story transitioned to "Won't Do" status.
- What happens when the Jira API is unreachable? Graceful failure with retry
  guidance, no local state corruption.
- What happens when the Jira project has required custom fields? System fails
  fast with a descriptive error listing the required fields that could not be
  populated. (Deferred: configurable custom field mapping may be added later if
  needed.)
- What happens when new stories are added directly in Jira (not from SpecKit)?
  They are visible via `get_jira_status` read-back but do not modify SpecKit
  state. Watch for whether bidirectional sync is needed.

---

## Requirements _(mandatory)_

### Functional Requirements

**Core Sync (one-way push with read-back)**

- **FR-001**: System MUST create a Jira Epic from a SpecKit spec, using
  `spec_name` as the Epic title and spec summary as the description
- **FR-002**: System MUST create Jira Stories from each implementation task in
  `tasks.json`, linked to the parent Epic
- **FR-003**: System MUST map task `status` values to Jira workflow transitions
  (pending → To Do, in_progress → In Progress, completed → Done)
- **FR-004**: System MUST represent task `gate` dependencies as "Blocked by"
  issue links in Jira
- **FR-005**: System MUST be idempotent — re-running sync on the same spec MUST
  update existing issues rather than creating duplicates
- **FR-006**: System MUST store the mapping between SpecKit task IDs and Jira
  issue keys in a `jira-sync.json` file within the spec directory (tasks.json
  schema remains unchanged)
- **FR-016**: System MUST detect when a Jira story has been manually modified
  since last sync, warn the user, and skip that story (sync non-conflicting
  items only)
- **FR-017**: System MUST transition Jira stories to "Won't Do" when the
  corresponding task is removed from `tasks.json`

**MCP Server**

- **FR-007**: System MUST expose Jira integration as an MCP server that Claude
  Code can invoke via tool calls
- **FR-008**: MCP server MUST provide a `sync_spec_to_jira` tool that accepts a
  spec directory path and pushes to Jira
- **FR-009**: MCP server MUST provide a `get_jira_status` tool that returns
  current Jira status for a synced spec (read-back: includes stories added
  directly in Jira)
- **FR-010**: MCP server MUST provide a `update_task_status` tool that syncs a
  single task's status change to Jira

**Configuration**

- **FR-011**: System MUST support configuration for Jira instance URL, project
  key, and authentication credentials
- **FR-012**: System MUST support API token authentication (Jira Cloud), with
  the auth layer structured to accommodate OAuth 2.0 addition later
- **FR-013**: System MUST allow configurable mapping of SpecKit phases to Jira
  components or labels
- **FR-014**: Credentials MUST be stored outside the repository (environment
  variables or external config file)

**T-VERIFY Task Handling**

- **FR-015**: System MUST sync T-VERIFY tasks as Jira Sub-tasks under the Epic,
  visually and semantically distinct from implementation Stories

### Key Entities

- **Spec-Epic Mapping**: Represents the link between a SpecKit spec directory
  and a Jira Epic. Contains spec_id, Jira Epic key, last sync timestamp. Stored
  in `jira-sync.json`.
- **Task-Story Mapping**: Represents the link between a SpecKit task ID and a
  Jira Story/Sub-task key. Contains task_id, Jira issue key, last synced status,
  last synced hash (for conflict detection). Stored in `jira-sync.json`.
- **Sync Configuration**: Jira instance URL, project key, credential reference,
  issue type mappings, workflow transition mappings.

### Test Strategy _(mandatory)_

**Test Type Classification**:

| FR                               | Primary Test Type  | Reason                                 |
| -------------------------------- | ------------------ | -------------------------------------- |
| FR-001 to FR-006, FR-016, FR-017 | Integration        | Requires Jira API interaction (mocked) |
| FR-007 to FR-010                 | Integration        | MCP server protocol compliance         |
| FR-011 to FR-014                 | Unit               | Configuration loading and validation   |
| FR-015                           | Unit + Integration | Mapping logic and Sub-task creation    |

**This Feature**:

- Feature type: [X] Backend-heavy [ ] Frontend-heavy [ ] Mixed
- Unit: 40% | Integration: 50% | E2E: 10%

**Estimated Test Count**: ~30-40 tests based on 17 functional requirements

### Error Handling & Recovery _(mandatory)_

**Error Scenarios**:

| Error Scenario                           | Type      | User Message                                                                                      | Recovery Action                                 |
| ---------------------------------------- | --------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| No credentials configured                | Permanent | "Jira credentials not found. Set JIRA_URL, JIRA_EMAIL, and JIRA_API_TOKEN environment variables." | Provide setup instructions                      |
| Invalid credentials (401)                | Permanent | "Jira authentication failed. Check your API token."                                               | Re-prompt for credentials                       |
| Jira project not found                   | Permanent | "Jira project '{key}' not found. Verify the project key in your config."                          | Check config                                    |
| Network timeout                          | Transient | "Jira API unreachable. Will retry."                                                               | Retry with exponential backoff (max 3 attempts) |
| Rate limited (429)                       | Transient | "Jira rate limit hit. Waiting {n} seconds."                                                       | Respect Retry-After header                      |
| Partial sync failure (some stories fail) | Transient | "Synced {n}/{total} tasks. Failed: {list}. Run sync again to retry."                              | Idempotent retry                                |
| Workflow transition not allowed          | Permanent | "Cannot transition {key} from {from} to {to}. Check Jira workflow."                               | Log and continue with other tasks               |
| Conflict detected (manual Jira edit)     | Permanent | "Story {key} modified in Jira since last sync. Skipping. Run with --force to overwrite."          | Skip and warn; manual review                    |
| Required custom fields missing           | Permanent | "Jira project requires fields: {list}. Configure custom field mapping or contact project admin."  | Fail fast with guidance                         |
| "Won't Do" transition unavailable        | Permanent | "Cannot transition {key} to 'Won't Do'. Workflow may not support this transition."                | Log warning, leave story as-is                  |

**Resumability**:

- [x] Operation can resume from last checkpoint? (idempotent sync picks up where
      it left off)
- [x] Idempotency guaranteed? (uses stored task-to-issue mapping to avoid
      duplicates)

### UI/Design Reference

**Feature Classification**:

- [x] **Backend-only** (no UI changes) - Skip design sections

---

## Open Questions Summary

All 7 original questions resolved during `/clarify` session 2026-02-12. One item
deferred:

- ~~**Conflict resolution strategy**~~ → Resolved: Warn and skip conflicting
  stories
- ~~**Removed task handling**~~ → Resolved: Transition to "Won't Do"
- ~~**Required custom fields**~~ → Resolved: Fail fast with descriptive error;
  configurable custom field mapping deferred to future iteration if needed
- ~~**Mapping storage location**~~ → Resolved: `jira-sync.json` in spec
  directory
- ~~**OAuth requirement**~~ → Resolved: API token now, auth layer structured for
  OAuth later
- ~~**T-VERIFY handling**~~ → Resolved: Sub-tasks under Epic
- ~~**Sync direction**~~ → Resolved: One-way push with read-back; monitor for
  bidirectional need

---

## Review Checklist (Gate)

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Test strategy defined
- [x] Error handling defined
- [x] UI complexity classified (backend-only)

---
