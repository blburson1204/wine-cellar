---
model: sonnet
description: Execute tasks with fresh context per iteration (Ralph Loop pattern)
argument-hint: (spec-id)
commandId: ralph
version: 1.0.0
created: '2026-01-25'
updated: '2026-01-25'
maintainer: '@speckit'
category: speckit
deprecated: false
modelReason:
  "Implementation execution benefits from Sonnet's code generation quality"
---

# /ralph

Execute tasks from a SpecKit spec using the Ralph Loop pattern - fresh context
per iteration to avoid context pollution.

## Overview

Ralph Loop spawns a fresh Claude session for each task iteration, preventing
accumulated context from degrading quality. Each session reads the PRD file,
executes ONE task, updates the PRD status, and exits.

**Based on:** [snarktank/ralph](https://github.com/snarktank/ralph)

## When to Use

| Use Ralph Loop                    | Use /implement               |
| --------------------------------- | ---------------------------- |
| Long specs (20+ tasks)            | Short specs (<20 tasks)      |
| Context-sensitive tasks           | Simple sequential tasks      |
| Multi-day implementation          | Single-session work          |
| Tasks requiring fresh perspective | Tasks with file dependencies |

## Arguments

$ARGUMENTS - Specification ID to execute.

Format: `124` or `124-feature-name`

## Prerequisites

- tasks.json must exist in spec directory
- Docker not required (file operations only)
- Git repository (for status tracking)

## Execution Steps

### Step 1: Validate Spec

```bash
SPEC_DIR=$(find specs -maxdepth 1 -type d -name "$ARGUMENTS*" | head -1)
if [[ ! -f "$SPEC_DIR/tasks.json" ]]; then
    echo "Error: No tasks.json found. Run /tasks first."
    exit 1
fi
```

### Step 2: Convert tasks.json to prd.json

Transform SpecKit tasks.json format to Ralph prd.json format:

**tasks.json (input):**

```json
{
  "tasks": [
    {
      "id": "T001",
      "description": "Add model field to commands",
      "status": "pending",
      "phase": "3"
    }
  ]
}
```

**prd.json (output):**

```json
{
  "tasks": [
    {
      "id": "T001",
      "description": "Add model field to commands",
      "status": "pending",
      "notes": "Phase 3"
    }
  ]
}
```

**Conversion rules:**

- `status: "pending"` → `status: "pending"`
- `status: "completed"` → `status: "done"`
- `phase` → embedded in `notes`
- Other fields preserved

Create prd.json in spec directory:

```bash
PRD_FILE="$SPEC_DIR/prd.json"
```

### Step 3: Execute Ralph Loop

```bash
./scripts/ralph/ralph.sh --prd "$PRD_FILE" --tool claude
```

The loop:

1. Reads prd.json
2. Finds first pending task
3. Spawns fresh Claude session with CLAUDE.md template
4. Claude executes ONE task
5. Claude updates prd.json status to "done"
6. Loop repeats until all tasks complete
7. Outputs `<promise>COMPLETE</promise>` on success

### Step 4: Sync Back to tasks.json

After Ralph Loop completes, sync completed statuses back:

```bash
# Update tasks.json from prd.json
jq --slurpfile prd "$PRD_FILE" '
  .tasks |= map(
    . as $task |
    ($prd[0].tasks[] | select(.id == $task.id).status) as $status |
    if $status == "done" then .status = "completed" else . end
  )
' "$SPEC_DIR/tasks.json" > "$SPEC_DIR/tasks.json.tmp"
mv "$SPEC_DIR/tasks.json.tmp" "$SPEC_DIR/tasks.json"
```

## Example Usage

```bash
# Execute spec 169
/ralph 169

# Execute spec with full name
/ralph 169-framework-update-v1
```

## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Ralph Loop Starting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRD: specs/169-framework-update-v1/prd.json
Tool: claude
Max iterations: 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 Ralph Loop - Iteration 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Next task: T054
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 All tasks complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<promise>COMPLETE</promise>
```

## Options

| Option             | Default | Description                         |
| ------------------ | ------- | ----------------------------------- |
| `--max-iterations` | 3       | Max loop iterations before stopping |
| `--tool`           | claude  | Tool to use (claude or amp)         |

Pass options after spec ID:

```bash
/ralph 169 --max-iterations 20
```

## Error Handling

| Error                   | Cause                   | Resolution                            |
| ----------------------- | ----------------------- | ------------------------------------- |
| No tasks.json           | SpecKit not initialized | Run /tasks first                      |
| Max iterations reached  | Tasks not completing    | Check task complexity, increase limit |
| Claude exits with error | Implementation issue    | Check task, fix manually, re-run      |

## Cleanup

After successful completion:

- prd.json remains in spec directory (for audit)
- tasks.json updated with completed statuses
- Git status shows modified files

## Comparison to /implement

| Aspect            | /ralph                  | /implement             |
| ----------------- | ----------------------- | ---------------------- |
| Context per task  | Fresh                   | Accumulated            |
| Token usage       | Higher (fresh sessions) | Lower (single session) |
| Best for          | Long/complex specs      | Short/simple specs     |
| Task independence | Required                | Not required           |
| Error recovery    | Automatic (fresh start) | Manual                 |

## AI Execution Instructions

When user runs `/ralph`:

1. **Parse $ARGUMENTS** - Extract spec ID
2. **Find spec directory** - `specs/$ARGUMENTS*`
3. **Validate tasks.json exists**
4. **Convert tasks.json → prd.json** using jq transformation
5. **Execute ralph.sh** with prd.json path
6. **Wait for completion** - watch for `<promise>COMPLETE</promise>`
7. **Sync prd.json → tasks.json** status updates
8. **Report results**

**DO:**

- Validate spec exists before running
- Create prd.json in spec directory
- Use `--tool claude` by default
- Sync status back to tasks.json after completion

**DON'T:**

- Run without tasks.json
- Skip validation step
- Leave prd.json out of sync with tasks.json
