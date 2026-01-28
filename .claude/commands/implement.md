---
model: sonnet
description:
  Execute implementation tasks with fresh context per task (delegates to /ralph)
argument-hint: (spec-id)
commandId: implement
version: 3.0.0
created: '2025-10-09'
updated: '2026-01-25'
maintainer: '@speckit'
category: speckit
deprecated: false
delegatesTo: ralph
modelReason:
  "Implementation benefits from Sonnet's balance of quality and speed for code
  generation"
changelog:
  - version: 3.0.0
    date: '2026-01-25'
    changes:
      'Simplified to delegate to /ralph for fresh context per task. Removed
      inline execution mode that caused context accumulation.'
  - version: 2.2.1
    date: '2026-01-25'
    changes: 'Fixed invalid flags in check-prerequisites.sh call.'
  - version: 2.2.0
    date: '2026-01-09'
    changes: 'Added --parallel flag for opt-in agent delegation.'
---

## Model Selection

**Recommended:** sonnet (Sonnet 4.5) **Reason:** Implementation sessions benefit
from Sonnet's excellent code generation quality at lower cost compared to Opus.

---

# /implement

Execute tasks from tasks.json with **fresh context per task** via the Ralph Loop
pattern.

## Overview

This command delegates to `/ralph` which spawns a fresh Claude session for each
task. This prevents context accumulation that degrades quality over long
implementation sessions.

**How it works:**

1. Validate prerequisites and tasks.json exist
2. Delegate to `/ralph` for task execution
3. Each task runs in a fresh context
4. State persists via tasks.json updates

**Benefits:**

- Fresh context per task (no context rot)
- State persists via filesystem (tasks.json, git)
- Automatic error recovery (fresh start on failure)
- Consistent quality regardless of spec size

## Prerequisites

- A valid `tasks.json` file must exist in the spec directory
- SpecKit workflow: `/specify`, `/plan`, and `/tasks` completed first

## Arguments

$ARGUMENTS - Specification to execute:

- Spec ID: `124` or `124-agent-implementation`
- Empty: Auto-detect from session context

## Execution

### Step 1: Validate Prerequisites

```bash
# If spec ID provided:
.specify/scripts/bash/check-prerequisites.sh --json --feature "$SPEC_ID"

# If no spec ID, auto-detect:
.specify/scripts/bash/check-prerequisites.sh --json
```

Parse output for:

- `FEATURE_DIR`: Absolute path to spec directory

Verify tasks.json exists:

```bash
[ -f "$FEATURE_DIR/tasks.json" ] || error "No tasks.json found. Run /tasks first."
```

### Step 2: Delegate to /ralph

Invoke the `/ralph` command with the spec ID:

```
Skill: ralph
Args: $SPEC_ID
```

This will:

1. Convert tasks.json to prd.json format
2. Execute ralph.sh which spawns fresh Claude sessions per task
3. Sync completed statuses back to tasks.json

### Step 3: Report Results

After `/ralph` completes, display:

- Total tasks completed
- Any remaining tasks
- Next steps

## Example Usage

```bash
/implement 124
/implement 124-agent-implementation
/implement
```

## Expected Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Ralph Loop Starting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRD: specs/124-feature/prd.json
Tool: claude
Max iterations: 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 Ralph Loop - Iteration 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Next task: T001
[Fresh context executes task...]
Task T001 complete.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 Ralph Loop - Iteration 2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Next task: T002
[Fresh context executes task...]
Task T002 complete.

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 All tasks complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<promise>COMPLETE</promise>
```

## Error Scenarios

| Error                  | Cause                   | Resolution                            |
| ---------------------- | ----------------------- | ------------------------------------- |
| No tasks.json found    | SpecKit not initialized | Run `/specify`, `/plan`, `/tasks`     |
| Max iterations reached | Tasks not completing    | Check task complexity, increase limit |
| Task failed            | Implementation error    | Ralph auto-retries with fresh context |

## Relationship to Other Commands

| Command      | Purpose                                     | Order                |
| ------------ | ------------------------------------------- | -------------------- |
| `/specify`   | Create spec.md                              | 1st                  |
| `/plan`      | Create plan.md                              | 2nd                  |
| `/tasks`     | Create tasks.json                           | 3rd                  |
| `/implement` | Execute tasks (delegates to /ralph)         | 4th                  |
| `/ralph`     | Low-level task execution with fresh context | Called by /implement |

## AI Execution Instructions

When user runs `/implement`:

1. **Parse arguments** - Extract spec ID
2. **Run prerequisites check** - Execute check-prerequisites.sh
3. **Validate tasks.json** - Confirm file exists
4. **Delegate to /ralph** - Invoke the ralph skill with spec ID
5. **Report completion** - Show final status after ralph completes

**Execution Pattern:**

```
validate → delegate to /ralph → report
    ↓            ↓                ↓
  check       fresh           summary
 prereqs    context/task
```

**DO:**

- Always validate prerequisites first
- Delegate to /ralph for task execution
- Let ralph handle fresh context per task
- Report final status after completion

**DON'T:**

- Execute tasks inline (causes context accumulation)
- Skip the /ralph delegation
- Override ralph's fresh context behavior
