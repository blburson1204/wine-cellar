---
# Context Optimization Metadata
meta:
  spec_id: '006'
  spec_name: jira-integration-map
  phase: plan
  updated: '2026-02-12'

# Quick Reference (for checkpoint resume)
summary:
  tech_stack: [TypeScript, '@modelcontextprotocol/sdk', 'zod@3', Vitest]
  external_deps: ['Jira Cloud REST API v3']
  test_strategy: { unit: 40%, integration: 50%, e2e: 10% }
  deployment: immediate
---

# Implementation Plan: Jira Integration for SpecKit

**Branch**: `006-jira-integration-map` | **Date**: 2026-02-12 | **Spec**:
[spec.md](spec.md) **Input**: Feature specification from
`specs/006-jira-integration-map/spec.md`

## Summary

Build an MCP server (`packages/jira-mcp/`) that maps SpecKit task output to Jira
tickets. Specs become Epics, tasks become Stories, T-VERIFY tasks become
Sub-tasks. One-way push with read-back — SpecKit is source of truth, Jira is the
projection.

The MCP server exposes 3 tools: `sync_spec_to_jira`, `get_jira_status`, and
`update_task_status`. Configured in `.claude/settings.json` and authenticated
via environment variables.

## Technical Context

**Language/Version**: TypeScript (ES2022, Node16 modules) **Primary
Dependencies**: `@modelcontextprotocol/sdk`, `zod@3` **Storage**: File-based
(`jira-sync.json` per spec directory) **Testing**: Vitest (mocked Jira API via
manual mocks) **Target Platform**: Local dev tooling (Node.js MCP server, stdio
transport) **Project Type**: Monorepo package (`packages/jira-mcp/`)
**Constraints**: STDIO transport — no `console.log()`, stderr only for debug

## Constitution Check

| Principle                           | Status | Notes                                          |
| ----------------------------------- | ------ | ---------------------------------------------- |
| I. Test-First Development           | PASS   | TDD for all sync logic, Jira client, MCP tools |
| II. Specification-Driven            | PASS   | Full SpecKit pipeline in progress              |
| III. Verification Before Completion | PASS   | Mocked integration tests verify Jira API calls |
| IV. Skills Before Action            | PASS   | Skill manifest checked at /specify and /plan   |
| V. Code Review Compliance           | PASS   | Will run code-reviewer agent before merge      |

**AI/ML**: Not applicable — skip XAI section.

## Project Structure

### Documentation (this feature)

```
specs/006-jira-integration-map/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 research output
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 verification scenarios
├── contracts/           # Phase 1 type contracts
│   ├── mcp-tools.ts     # MCP tool input/output shapes
│   ├── jira-api.ts      # Jira REST API types
│   └── sync-state.ts    # jira-sync.json schema
├── skill-log.md         # Skill manifest tracking
└── tasks.md             # Phase 2 output (/tasks command)
```

### Source Code (repository root)

```
packages/jira-mcp/
├── package.json           # @wine-cellar/jira-mcp
├── tsconfig.json          # ES2022, Node16
├── vitest.config.ts       # Test config
├── src/
│   ├── index.ts           # MCP server entry point + tool registration
│   ├── config.ts          # Load env vars, validate config
│   ├── jira-client.ts     # Jira REST API client (HTTP layer)
│   ├── sync-engine.ts     # Core sync logic (create/update/conflict/remove)
│   ├── mapper.ts          # SpecKit task → Jira issue field mapping
│   ├── hash.ts            # Content hashing for conflict detection
│   └── types.ts           # Shared TypeScript types
├── __tests__/
│   ├── unit/
│   │   ├── config.test.ts
│   │   ├── mapper.test.ts
│   │   └── hash.test.ts
│   └── integration/
│       ├── sync-engine.test.ts
│       ├── jira-client.test.ts
│       └── mcp-tools.test.ts
└── build/                 # Compiled output (gitignored)
```

**Structure Decision**: New monorepo package at `packages/jira-mcp/`. Already
covered by `packages/*` workspace glob — no root config changes needed. Named
`@wine-cellar/jira-mcp` following existing convention.

---

## Phase 0.1: Research & Testing Strategy

_MANDATORY — completed_

### Research

All technical unknowns resolved. See [research.md](research.md) for full
details.

| Unknown                   | Resolution                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| MCP SDK TypeScript API    | `McpServer` + `registerTool()` + `StdioServerTransport`. Zod-native input schemas.                                 |
| Jira Epic→Story linking   | Uses "Epic Link" custom field (not standard issue links). Field ID varies by project — must be discovered via API. |
| Jira Sub-task creation    | `issuetype: { name: "Sub-task" }` with `parent: { key: "EPIC-KEY" }`                                               |
| Jira transition discovery | Must call `GET /transitions` to find transition IDs. IDs vary by workflow.                                         |
| Package placement         | `packages/jira-mcp/` — reuses monorepo infra, already in workspace glob                                            |

### Testing Strategy

| Check            | Output                                                     |
| ---------------- | ---------------------------------------------------------- |
| External APIs    | Jira Cloud REST API → Risk: MEDIUM                         |
| Test types       | Unit + Integration (mocked Jira API)                       |
| E2E permitted?   | No — external API. Manual E2E only with test Jira project. |
| Mocking strategy | Jira HTTP client → manual mock returning canned responses  |

**Testing Summary**:

```
Feature type: Backend-heavy
Quota risks: Jira API rate limits (mitigated by mocking)
Estimated tests: 30-40
Distribution: Unit 40%, Integration 50%, E2E 10% (manual)
```

**GATE**: HIGH-RISK API constraint does not apply (Jira is not in blocked list).
E2E deferred to manual testing with Brian's test project.

**Output**: [research.md](research.md)

---

## Phase 0.2: Permissions Design

_SKIP — No roles/permissions in spec. This is dev tooling with single-user
auth._

---

## Phase 0.3: Integration Analysis

_MANDATORY — completed_

### Codebase Pattern Discovery

| Pattern Area   | Finding                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| Zod schemas    | `z.object().strict()`, field-level messages, `z.infer<T>` exports       |
| Error handling | `AppError` base class + subclasses (`ValidationError`, `NotFoundError`) |
| Logging        | Winston with contextual factory, stderr-safe for MCP (adapt)            |
| Testing        | Vitest, forked pool, 80% coverage thresholds, v8 provider               |
| Module system  | ESM throughout (`"type": "module"`)                                     |

### Code Reuse Analysis

| Pattern Needed | Existing                          | Decision                                                       |
| -------------- | --------------------------------- | -------------------------------------------------------------- |
| Zod validation | `apps/api/src/schemas/`           | REUSE — MCP SDK uses Zod natively, same patterns apply         |
| Error classes  | `apps/api/src/errors/AppError.ts` | EXTEND — Create `JiraError` subclass adapted for MCP responses |
| Logger         | `apps/api/src/utils/logger.ts`    | ADAPT — Winston to stderr only (STDIO constraint)              |
| Vitest config  | `apps/api/vitest.config.ts`       | REUSE — Same structure, adjust paths                           |
| HTTP client    | None exists                       | CREATE — New Jira-specific HTTP client with auth               |

### Data Contracts

| Entity       | SpecKit Format                          | Jira Format               | Sync File Format             |
| ------------ | --------------------------------------- | ------------------------- | ---------------------------- |
| Spec/Epic    | `tasks.json` root                       | Epic issue                | `jira-sync.json` epic field  |
| Task/Story   | Task object in array                    | Story/Sub-task issue      | `jira-sync.json` tasks array |
| Status       | `pending/in_progress/completed/blocked` | Workflow transition names | `lastSyncedStatus`           |
| Dependencies | `gate` field (task ID)                  | "Blocked by" issue link   | Not stored (derived)         |

**GATE**: Patterns identified, reuse documented. No LSP verification needed (new
package, no existing callers).

---

## Phase 0.4: Design Pre-flight

_SKIP — Backend-only feature (ui_changes: none)._

---

## Phase 0.5: Infrastructure & Migrations

_CONDITIONAL — Env vars required, MCP server config needed._

### Environment Variables

| Variable           | Service  | Source      | Required |
| ------------------ | -------- | ----------- | -------- |
| `JIRA_URL`         | jira-mcp | Environment | Yes      |
| `JIRA_EMAIL`       | jira-mcp | Environment | Yes      |
| `JIRA_API_TOKEN`   | jira-mcp | Environment | Yes      |
| `JIRA_PROJECT_KEY` | jira-mcp | Environment | Yes      |

**Note**: These are passed to the MCP server process via the `env` field in
`.claude/settings.json` MCP server config. They are NOT added to any `.env` file
in the repo.

### MCP Server Registration

New entry in `.claude/settings.json`:

```json
{
  "mcpServers": {
    "jira-speckit": {
      "command": "node",
      "args": ["packages/jira-mcp/build/index.js"]
    }
  }
}
```

Environment variables are set in the user's shell profile or passed explicitly.

### Migrations

None — no database changes.

### Deprecations

None.

### Deployment Order

```
1. Build package: npm run build -w packages/jira-mcp
2. Configure MCP: Add to .claude/settings.json
3. Set env vars: Export JIRA_* variables
4. Restart Claude Code session
```

**Rollout**: Immediate (dev tooling, no staged rollout needed)

**GATE**: Infrastructure documented, no migrations.

---

## Phase 1: Design & Contracts

_Prerequisites: Phases 0.1-0.5 complete._

### Entities

See [data-model.md](data-model.md) for full entity definitions:

- **JiraSyncState** — Root sync state file per spec directory
- **EpicMapping** — Jira Epic ↔ SpecKit spec link
- **TaskMapping** — Jira Story/Sub-task ↔ SpecKit task link with content hash
- **JiraSyncConfig** — Configuration loaded from env vars

### API Contracts

See [contracts/](contracts/) for TypeScript interface definitions:

- **MCP Tools** ([mcp-tools.ts](contracts/mcp-tools.ts)):
  - `sync_spec_to_jira` — Full spec push with create/update/conflict/remove
  - `get_jira_status` — Read-back with sync status comparison
  - `update_task_status` — Single task status transition

- **Jira API** ([jira-api.ts](contracts/jira-api.ts)):
  - Issue CRUD, transitions, issue links, JQL search
  - Atlassian Document Format (minimal)

- **Sync State** ([sync-state.ts](contracts/sync-state.ts)):
  - `jira-sync.json` schema with versioning

### Quickstart Test Scenarios

See [quickstart.md](quickstart.md) for 6 verification scenarios mapping to spec
acceptance criteria.

**Output**: data-model.md, contracts/\*, quickstart.md

---

## Phase 2: Task Planning Approach

_Executed by `/tasks` command, NOT `/plan`._

**Strategy**: Generate tasks from Phase 1 contracts, constrain by Phase 0.1
testing estimates.

| From          | Task Type                                                                | Order |
| ------------- | ------------------------------------------------------------------------ | ----- |
| Package setup | Scaffold `packages/jira-mcp/` with package.json, tsconfig, vitest        | 1st   |
| Contracts     | Config validation, Jira client types, sync state types                   | 2nd   |
| Core logic    | Jira HTTP client, mapper, hash, sync engine                              | 3rd   |
| MCP tools     | Register 3 tools with MCP SDK, wire to sync engine                       | 4th   |
| Tests         | Unit tests for config/mapper/hash, integration tests for sync/client/MCP | 5th   |
| Integration   | MCP server config in .claude/settings.json, quickstart verification      | 6th   |

**Constraints**: E2E limited to manual testing with Brian's Jira test project.
All automated tests use mocked Jira API.

---

## Progress Tracking

| Phase                  | Status         | Skip If           |
| ---------------------- | -------------- | ----------------- |
| 0.1 Research + Testing | [X]            | Never             |
| 0.2 Permissions        | [X] SKIP       | No roles in spec  |
| 0.3 Integration        | [X]            | Never             |
| 0.4 Design Pre-flight  | [X] SKIP       | Backend-only      |
| 0.5 Infrastructure     | [X]            | No env/migrations |
| 1 Design & Contracts   | [X]            | —                 |
| 2 Task Planning        | [X] Documented | —                 |

**Gates**: Constitution Check PASS, All NEEDS CLARIFICATION resolved, All phases
complete.

---

_Ready for `/tasks` command._
