---
meta:
  spec_id: '008-feature-004-automatic'
  spec_name: 'Automatic Jira status sync during SpecKit implementation'
  phase: plan
  updated: '2026-03-28'

summary:
  tech_stack: [TypeScript, Bash, Node.js]
  external_deps: [Jira REST API v3]
  test_strategy: { unit: 30, integration: 55, manual: 15 }
  deployment: immediate
---

# Implementation Plan: Automatic Jira Status Sync

**Branch**: `008-feature-004-automatic` | **Date**: 2026-03-28 | **Spec**:
[spec.md](spec.md) **Input**: Feature specification from
`/specs/008-feature-004-automatic/spec.md`

## Summary

Two-part feature that makes Jira sync seamless in the SpecKit workflow:

1. **`/tasks` prompt**: After writing tasks.json, prompt the developer to sync
   to Jira via `sync_spec_to_jira`. One-time "Y" that creates the Epic + Stories
   and arms the auto-sync.
2. **PostToolUse hook**: A bash hook (`jira-notify.sh`) that detects task status
   changes in tasks.json writes and dispatches to a Node.js script (`notify.js`)
   that calls the Jira REST API to transition issue statuses.

Both components follow established patterns: the `/tasks` prompt follows the
`/specify` type-confirmation pattern, and the hook mirrors `slack-notify.sh` +
`slack-mcp/notify.js` exactly.

## Technical Context

**Language/Version**: TypeScript (ES2022), Bash **Primary Dependencies**:
`@wine-cellar/jira-mcp` (existing), Jira REST API v3 **Storage**: N/A (reads
jira-sync.json, tasks.json from disk — no database) **Testing**: Vitest (unit +
integration tests in `packages/jira-mcp/__tests__/`) **Target Platform**: macOS
(developer tooling) **Project Type**: Monorepo tooling extension
**Constraints**: Fail-open (never block developer work), fire-and-forget Jira
calls

## Constitution Check

- [x] **Test-First Development**: Tests for notify.js dispatcher + hook behavior
- [x] **Specification-Driven**: Following SpecKit pipeline
- [x] **Verification Before Completion**: T-FINAL gate
- [x] **Skills Before Action**: Skill manifest checked at /specify and /plan
- [x] **Code Review Compliance**: code-review agent in T-FINAL

No AI/ML involvement — skip XAI section.

## Project Structure

### Documentation (this feature)

```
specs/008-feature-004-automatic/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0.1 research
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 quickstart
└── contracts/           # Phase 1 contracts
    └── notify-contract.ts
```

### Source Code (repository root)

```
packages/jira-mcp/
├── src/
│   └── notify.ts          # NEW: CLI dispatcher (mirrors slack-mcp/src/notify.ts)
├── build/
│   └── notify.js          # Built output (called by hook)
└── __tests__/
    ├── unit/
    │   └── notify.test.ts # NEW: Unit tests for notify logic
    └── integration/
        └── notify.test.ts # NEW: Integration tests for CLI + file I/O

.claude/
├── hooks/speckit/
│   └── jira-notify.sh    # NEW: PostToolUse:Write hook
├── commands/
│   └── tasks.md          # MODIFIED: Add Jira sync prompt at end
└── settings.json         # MODIFIED: Register jira-notify.sh hook
```

## Phase 0.1: Research & Testing Strategy

### Research

**All technical context is resolved** — no unknowns:

1. **Hook pattern**: Fully understood from `slack-notify.sh` (204 lines). Same
   stdin JSON format, same path matching, same fail-open pattern.
2. **Notify.js pattern**: Fully understood from `slack-mcp/src/notify.ts` (153
   lines). Same CLI entry point, same fire-and-forget, same processEvent
   pattern.
3. **Jira API integration**: Fully understood from existing
   `jira-mcp/src/jira-client.ts` and `update_task_status` MCP tool. The
   notify.js dispatcher needs to replicate the transition logic from
   `index.ts:123-248` but as a standalone CLI script (not MCP).
4. **`/tasks` command**: Template-based markdown command. Adding a prompt
   section at the end is a markdown edit, not code change.

**Key architectural decision**: The notify.js dispatcher does NOT go through the
MCP server. It directly uses `JiraClient` and `loadConfig()` from the existing
jira-mcp package, just as slack-mcp's notify.ts directly uses `SlackClient` and
`loadConfig()`. This avoids MCP protocol overhead for a fire-and-forget hook
call.

### Testing Strategy

| Check            | Output                                                                |
| ---------------- | --------------------------------------------------------------------- |
| External APIs    | Jira REST API v3 → Risk: MEDIUM (mock at JiraClient boundary)         |
| Test types       | Unit + Integration                                                    |
| E2E permitted?   | No (external API)                                                     |
| Mocking strategy | Mock JiraClient methods (getIssue, getTransitions, performTransition) |

**Testing Summary**:

```
Feature type: Backend-heavy (tooling)
Quota risks: None (all Jira calls mocked in tests)
Estimated tests: 14-18
Distribution: Unit 30%, Integration 55%, Manual 15%
```

**Output**: [research.md](research.md)

## Phase 0.2: Permissions Design

**Skipped** — no roles/permissions in spec.

## Phase 0.3: Integration Analysis

### Codebase Pattern Discovery

| Pattern Area   | Finding                                                       |
| -------------- | ------------------------------------------------------------- |
| Hook pattern   | PostToolUse:Write bash scripts in `.claude/hooks/speckit/`    |
| Notify pattern | Node.js CLI dispatcher in `packages/*/build/notify.js`        |
| Config loading | `loadConfig()` reads env vars with Zod validation             |
| Status mapping | `mapStatusToTransition()` in `mapper.ts`                      |
| Fail-open      | `trap 'exit 0' ERR` in bash, `process.exit(0)` always in Node |
| JSON diffing   | Read old file from disk, parse new content from stdin JSON    |

### Code Reuse Analysis

| Pattern Needed          | Source                        | Decision                                                                       |
| ----------------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| Hook script structure   | `slack-notify.sh`             | **REUSE** — copy structure, replace Slack-specific logic with Jira             |
| Node.js CLI dispatcher  | `slack-mcp/src/notify.ts`     | **REUSE** — same pattern: parse event → load config → create client → dispatch |
| JiraClient              | `jira-mcp/src/jira-client.ts` | **REUSE** — import directly, same package                                      |
| loadConfig()            | `jira-mcp/src/config.ts`      | **REUSE** — import directly, same package                                      |
| mapStatusToTransition() | `jira-mcp/src/mapper.ts`      | **REUSE** — import directly, same package                                      |
| jira-sync.json reading  | `jira-mcp/src/index.ts:56-74` | **REUSE** — same readFile + JSON.parse pattern                                 |

**Everything needed already exists.** No new patterns, utilities, or
abstractions required. The notify.ts is a thin integration layer over existing
jira-mcp exports.

## Phase 0.4: Design Pre-flight

**Skipped** — Backend-only, no UI changes.

## Phase 0.5: Infrastructure & Migrations

**Skipped** — No new env vars (reuses existing `JIRA_*` vars), no database
migrations, no deprecations. The hook and notify.js use the same Jira
credentials already configured for the MCP server.

## Phase 1: Design & Contracts

### Data Model

No new data entities. Feature reads two existing file formats:

1. **jira-sync.json** — existing format from `sync_spec_to_jira` (see
   `types.ts:JiraSyncState`)
2. **tasks.json** — existing SpecKit format (see `types.ts:SpecKitTasksFile`)

The hook receives PostToolUse JSON on stdin (existing Claude Code hook format).

**Output**: [data-model.md](data-model.md)

### Contracts

**Notify event contract** — the interface between `jira-notify.sh` (bash) and
`notify.js` (Node):

```typescript
interface JiraNotifyEvent {
  specDir: string; // Absolute path to spec directory
  taskId: string; // SpecKit task ID (e.g., "T001")
  newStatus: string; // New SpecKit status (pending|in_progress|completed|blocked)
}
```

The bash hook constructs one event per changed task and calls
`node notify.js '<event-json>'` for each.

**Output**: [contracts/notify-contract.ts](contracts/notify-contract.ts)

### Quickstart

**Output**: [quickstart.md](quickstart.md)

## Phase 2: Task Planning Approach

**Strategy**: Implementation follows the standard TDD flow.

| From           | Task Type                              | Order |
| -------------- | -------------------------------------- | ----- |
| Contracts      | notify-contract.ts types               | 1st   |
| notify.ts      | Unit tests → implementation            | 2nd   |
| jira-notify.sh | Hook script (mirrors slack-notify.sh)  | 3rd   |
| tasks.md       | `/tasks` command template modification | 4th   |
| settings.json  | Hook registration                      | 5th   |
| T-FINAL        | Verification gate                      | Last  |

**Key constraints**:

- Tests mock at JiraClient boundary (no real Jira calls)
- Hook script tested via integration tests (stdin → stdout)
- `/tasks` prompt is a markdown template change (manual verification)

## Progress Tracking

| Phase                  | Status      | Skip If           |
| ---------------------- | ----------- | ----------------- |
| 0.1 Research + Testing | [X]         | Never             |
| 0.2 Permissions        | [X] SKIPPED | No roles in spec  |
| 0.3 Integration        | [X]         | Never             |
| 0.4 Design Pre-flight  | [X] SKIPPED | Backend-only      |
| 0.5 Infrastructure     | [X] SKIPPED | No env/migrations |
| 1 Design & Contracts   | [X]         | -                 |
| 2 Task Planning        | [X]         | -                 |

**Gates**: Constitution Check PASS, All NEEDS CLARIFICATION resolved

---
