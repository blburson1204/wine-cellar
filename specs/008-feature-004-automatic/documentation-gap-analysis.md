# Documentation Gap Analysis

**Spec**: 008-feature-004-automatic **Date**: 2026-03-28 **Analyst**:
documentation-reconciliation agent

---

## Phase 1: Change Classification

### Files Changed

| File                                                     | Type                                                  | Classification                                                        |
| -------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| `packages/jira-mcp/src/types.ts`                         | Added `JiraNotifyEvent`, `JiraNotifyResult` types     | SKIP — minor type additions, not architectural                        |
| `packages/jira-mcp/src/notify.ts`                        | New file: Jira status sync dispatcher (public module) | HIGH — new module added to existing MCP package src                   |
| `.claude/hooks/speckit/jira-notify.sh`                   | New PostToolUse:Write hook                            | HIGH — new hook changes behavior of all tasks.json writes             |
| `.claude/settings.json`                                  | Registered jira-notify.sh                             | HIGH — hook list is documented in CLAUDE.md and atom.md               |
| `.claude/commands/tasks.md`                              | Added Jira sync prompt to Post-Generation             | MEDIUM — behavior change to existing command, self-documented in file |
| `packages/jira-mcp/__tests__/unit/notify.test.ts`        | New unit tests                                        | SKIP — implementation detail                                          |
| `packages/jira-mcp/__tests__/integration/notify.test.ts` | New integration tests                                 | SKIP — implementation detail                                          |

---

## HIGH Priority Gaps

### GAP-1: CLAUDE.md — SpecKit Hooks section out of date

**Current**: Lists 3 SpecKit hooks (`post-tasks-reconciliation.sh`,
`slack-notify.sh`, `slack-milestone.sh`).

**Drift**: `jira-notify.sh` is now registered as a 4th PostToolUse:Write hook.

**Target doc**: `CLAUDE.md` → "SpecKit Hooks" section

---

### GAP-2: documents/project-summary.md — SpecKit hooks count and jira-mcp src listing

**Current (two sub-gaps)**:

1. Line 116: `.claude/hooks/speckit/` described as "Post-tasks reconciliation,
   Slack notifications (3 hooks)" — count is now 4.
2. Line 99 (jira-mcp src): described as "config, jira-client, sync-engine,
   mapper, hash" — `notify` module is missing.
3. Line 594: Jira MCP test count listed as "46 tests" — new notify tests bring
   the count to ~63.

**Target doc**: `documents/project-summary.md`

---

### GAP-3: documents/project-summary.md — jira-speckit MCP server description

**Current**: Does not mention automatic status sync or the notify dispatcher
pattern.

**Assessment**: The existing description is accurate (tools, env vars, test
count). The notify dispatcher is an internal implementation detail of how
jira-notify.sh works. The only doc-level change needed is the test count. This
sub-gap is covered by GAP-2 item 3.

---

## MEDIUM Priority Gaps

### GAP-4: /tasks command behavior change

**Assessment**: The modified behavior (Jira sync prompt after tasks.json write)
is already fully documented in the updated `.claude/commands/tasks.md` at the
"Post-Generation → Jira sync prompt" section. No additional docs needed.

---

## SKIP Items

| Item                                    | Reason                                                |
| --------------------------------------- | ----------------------------------------------------- |
| `JiraNotifyEvent` type                  | Minor type addition — internal to jira-mcp package    |
| `JiraNotifyResult` type                 | Minor type addition — internal to jira-mcp package    |
| `notify.test.ts` (unit)                 | Test implementation detail                            |
| `notify.test.ts` (integration)          | Test implementation detail                            |
| `jira-notify.sh` activation logic       | Implementation detail of the hook                     |
| Status mapping `SPECKIT_TO_JIRA_STATUS` | Internal constant, follows existing Jira MCP patterns |

---

## Docs to Update

1. `CLAUDE.md` — SpecKit Hooks section: add `jira-notify.sh` entry
2. `documents/project-summary.md` — three targeted edits:
   - speckit hooks count: "3 hooks" → "4 hooks"
   - jira-mcp src list: add `notify`
   - jira-mcp test count: "46 tests" → "~63 tests"
