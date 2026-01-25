---
model: sonnet
description:
  Execute implementation tasks sequentially (default) or in parallel
  (--parallel)
argument-hint: (spec-id) (--parallel)
commandId: implement
version: 2.2.0
created: '2025-10-09'
updated: '2026-01-09'
maintainer: '@speckit'
category: speckit
deprecated: false
delegatesTo: null
modelReason:
  "Implementation benefits from Sonnet's balance of quality and speed for code
  generation"
changelog:
  - version: 2.2.0
    date: '2026-01-09'
    changes:
      'Changed default to sequential inline execution (70K tokens vs 194K
      parallel). Added --parallel flag for opt-in agent delegation.'
---

## Model Selection

**Recommended:** sonnet (Sonnet 4.5) **Reason:** Implementation sessions benefit
from Sonnet's excellent code generation quality at lower cost compared to Opus.
Sonnet provides the right balance for task execution.

If not on Sonnet, suggest: "For optimal implementation, consider
`/model sonnet`"

---

# /implement

Execute tasks from tasks.json sequentially inline (default) or with parallel
execution via phase-executor agent (--parallel flag).

## Pre-Execution Assessment

Before starting, which optional skills apply?

- [ ] UI changes? → design-system, figma
- [ ] Debugging? → systematic-debugging
- [ ] Architecture decisions? → arch
- [ ] Database changes? → prisma
- [ ] Core component changes? → update-documentation (auto-triggered during
      implementation)

## Overview

This command executes implementation tasks **sequentially by default**, which is
appropriate for 70-80% of specs where tasks depend on each other or touch shared
files. Sequential execution uses ~70K tokens per session.

For large specs with many independent tasks, use `--parallel` to delegate to the
phase-executor agent, which spawns parallel subagents but uses ~194K tokens per
session.

**Default behavior (sequential):**

- Execute tasks inline in the current session
- No agent spawned
- Tasks run in dependency order
- ~70K tokens per session

**With --parallel flag:**

- Delegate to phase-executor agent
- Parallel subagents for [P] tasks
- Automatic conflict detection
- ~194K tokens per session

## Prerequisites

- A valid `tasks.json` file must exist in the spec directory
- SpecKit workflow: `/specify`, `/plan`, and `/tasks` completed first

## Arguments

$ARGUMENTS - Specification and options to execute. Options:

- Spec ID: `124` or `124-agent-implementation`
- Empty: Auto-detect from session context
- `--parallel` - Use phase-executor agent for parallel execution (194K tokens)

## Execution

### Step 1: Validate Prerequisites

```bash
.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks
```

Parse output for:

- `FEATURE_DIR`: Absolute path to spec directory
- `AVAILABLE_DOCS`: List of available documents

If tasks.json not found: Error "No tasks.json found. Run /tasks first."

### Step 2: Parse Current State

Read tasks.json and extract:

- Current phase (first incomplete phase)
- Task counts (total, completed, remaining)
- Tasks marked with [P] for parallel execution
- Task dependencies (GATE markers)

### Step 3: Choose Execution Mode

**If --parallel flag is present:**

1. Read the agent template at `.claude/agents/phase-executor.md`
2. Fill in placeholders:
   - `{SPEC_ID}`: From $ARGUMENTS or auto-detected
   - `{TASKS_PATH}`: Computed as `{FEATURE_DIR}/tasks.json`
   - `{CURRENT_PHASE}`: Auto-detected from tasks.json
3. Spawn the agent:
   ```
   Task({
     subagent_type: "general-purpose",
     description: "Execute tasks from tasks.json with parallel execution",
     prompt: "[phase-executor.md template with placeholders filled]"
   })
   ```
4. Report agent results

**If --parallel flag is NOT present (default):**

1. Execute tasks sequentially inline in current session
2. Read current phase tasks from tasks.json
3. For each incomplete task in dependency order:
   - Read target file if specified
   - Implement the task changes
   - **Check for documentation impacts** (auto-trigger if core component
     modified):
     - Core components: Service Modules (`packages/services/**/*.ts`), API
       endpoints (`apps/api/**/*.ts`), DB schema
       (`packages/database/prisma/schema.prisma`), UI components
       (`packages/ui/**/*.tsx`), jobs (`packages/job-dispatcher/**/*.ts`)
     - If detected: `Skill: update-documentation` identifies affected docs
     - Creates TodoWrite tasks for CRITICAL/IMPORTANT updates
     - User can complete updates now OR defer with explicit acknowledgment
   - Update tasks.json to mark task completed
   - Add evidence and completion timestamp
4. Report progress after each task

### Step 4: Report Results

Display execution summary including:

- Phase progress (X/Y tasks completed)
- Completed tasks list
- Remaining tasks list
- Next steps recommendation
- Token usage comparison (sequential vs parallel)

## What the Phase-Executor Agent Does (--parallel mode)

When `--parallel` flag is used, the delegated agent handles:

1. **Task Parsing**: Identifies current phase and all tasks within it
2. **Parallel Detection**: Finds [P] markers for parallel-eligible tasks
3. **Conflict Analysis**: Checks if parallel tasks touch the same files
4. **Parallel Execution**: Spawns up to 4 concurrent Task calls for [P] tasks
5. **Sequential Execution**: Runs dependent tasks in order
6. **Progress Updates**: Marks tasks [x] in tasks.json as completed
7. **Phase Reporting**: Reports phase status and readiness for next phase

**When to use --parallel:**

- Large specs with 10+ independent tasks
- Tasks don't touch the same files
- No complex dependencies between tasks
- Willing to spend 194K tokens for faster completion

## Example Usage

**Sequential (default - 70K tokens):**

```
/implement 124
/implement 124-agent-implementation
/implement
```

**Parallel (opt-in - 194K tokens):**

```
/implement 124 --parallel
/implement 124-agent-implementation --parallel
/implement --parallel
```

## Expected Output

```markdown
## Phase Execution Progress

**Spec:** 124-agent-implementation **Phase:** 3.3 - Core Implementation

### Executing Parallel Batch 1

| Task | Status     | Duration |
| ---- | ---------- | -------- |
| T015 | ✓ Complete | 45s      |
| T016 | ✓ Complete | 38s      |
| T017 | ✓ Complete | 52s      |

### Completed This Session

- [x] T015 Enhance auto-fixer agent template
- [x] T016 Enhance deployment-monitor agent template
- [x] T017 Create dispatcher-deployer agent template

### Remaining in Phase

- [ ] T022 Create /implement command
- [ ] T023 Create /analyze command

**Progress:** 7/10 tasks (70%) **Next:** Complete remaining tasks, then run
`/implement` for next phase
```

## Error Scenarios

| Error                    | Cause                          | Resolution                          |
| ------------------------ | ------------------------------ | ----------------------------------- |
| No tasks.json found      | SpecKit not initialized        | Run `/specify`, `/plan`, `/tasks`   |
| All phase tasks complete | Phase finished                 | Proceed to next phase automatically |
| Task failed              | Implementation error           | Review error, fix, re-run           |
| File conflict detected   | Parallel tasks touch same file | Agent falls back to sequential      |
| GATE not passed          | Prerequisite tasks incomplete  | Complete prerequisite tasks first   |

## UI Verification Integration

When implementing UI-affecting tasks, the executor automatically detects and
triggers visual verification.

### Detection

A task is considered UI-affecting if:

- `target_file` matches `apps/web/src/app/**/*.tsx`
- `target_file` matches `apps/web/src/components/**/*.tsx`
- `target_file` matches `packages/ui/**/*.tsx`

### Workflow

```
UI Task Completion → Visual Verification → Mark Complete
        ↓                    ↓                  ↓
   T-IMPL-001        Run /verify-ui       Update status
   Status: done      Check baselines      Evidence recorded
```

### Automatic Actions

When a UI task completes:

1. **Detect UI files modified**: Check `git diff` for UI paths
2. **Trigger verification prompt**: Remind to run `/verify-ui` or visual tests
3. **Check baseline status**: Verify visual baselines exist for affected pages
4. **Update evidence**: Record verification results in task evidence

### Manual Override

Skip visual verification with `--skip-visual`:

```
/implement 158 --skip-visual
```

Use when:

- UI changes are backend-only (no visual impact)
- Visual baselines already updated manually
- Rapid iteration before final verification

---

## Relationship to Other Commands

| Command      | Purpose             | Order             |
| ------------ | ------------------- | ----------------- |
| `/specify`   | Create spec.md      | 1st               |
| `/plan`      | Create plan.md      | 2nd               |
| `/tasks`     | Create tasks.json   | 3rd               |
| `/analyze`   | Review spec quality | Anytime           |
| `/implement` | Execute tasks       | 4th (after tasks) |
| `/verify-ui` | Visual verification | After UI tasks    |

## AI Execution Instructions

When user runs `/implement`:

1. **Parse arguments** - Extract spec ID and check for --parallel flag
2. **Run prerequisites check** - Execute check-prerequisites.sh
3. **Validate tasks.json** - Confirm file exists
4. **Read current state** - Count completed/remaining tasks
5. **Choose execution mode:**
   - **If --parallel flag present:** Load phase-executor agent template, spawn
     agent
   - **If no --parallel flag (default):** Execute tasks sequentially inline
6. **Report results** - Show phase completion status

**Sequential Execution Pattern (default):**

```
validate → parse → execute inline
    ↓         ↓         ↓
  check     read    implement
 prereqs  tasks.json  + update
```

**Parallel Execution Pattern (--parallel):**

```
validate → parse → delegate
    ↓         ↓        ↓
  check     read    spawn
 prereqs  tasks.json  agent
```

**DO:**

- Always validate prerequisites first
- Default to sequential inline execution (70K tokens)
- Only delegate to agent if --parallel flag present
- Update tasks.json after each completed task (sequential mode)
- Report progress incrementally

**DON'T:**

- Spawn agent without --parallel flag
- Skip validation step
- Continue if tasks.json doesn't exist
- Forget to update task status and evidence after completion
