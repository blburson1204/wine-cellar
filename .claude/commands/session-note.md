---
model: haiku
description:
  Add quick note about non-SpecKit work to current-work.md for session
  continuity
argument-hint: [note-text]
---

# /session-note

Add a quick note about non-SpecKit work to current-work.md for session
continuity.

**When to use**: After investigations, debugging, decisions, or ad-hoc fixes
that aren't part of a formal spec.

## Usage

```
/session-note [note text]
```

**Arguments:**

- `note text` - (required) Brief description of what you worked on (50-100 chars
  recommended)

**Examples:**

```
/session-note Audited Docker bundling - issue resolved via commits ba5fa161, 071094fa
/session-note Debugged Prisma migration drift - root cause: missing migration file
/session-note Architecture decision: Use in-memory cache for simplicity
/session-note Fixed deployment docs - ECS stack configuration updated
```

## Behavior

1. **Read current-work.md** to preserve existing structure
2. **Add new entry** to "Recent Sessions" section with timestamp
3. **Prune old entries** - keep only 5 most recent
4. **Update file** preserving all other content

### Entry Format

```markdown
## Recent Sessions

- 2026-01-10 14:30: [note text]
- 2026-01-10 10:15: [previous note] ...
```

### Token Budget

- Max 5 entries (~250 tokens total)
- Oldest entry auto-pruned when adding 6th
- Compact format: date, time, note

## Implementation Steps

### Step 1: Validate Input

Check that note text is provided:

```bash
if [ -z "$ARGUMENTS" ]; then
  echo "Error: Note text required"
  echo "Usage: /session-note [note text]"
  exit 1
fi
```

### Step 2: Read Current Work

```bash
CURRENT_WORK=".claude/session-context/current-work.md"

if [ ! -f "$CURRENT_WORK" ]; then
  # Create minimal current-work.md if doesn't exist
  cat > "$CURRENT_WORK" << 'EOF'
# Current Work: No Active Spec

**Status**: Available for new work
**Updated**: $(date -u +%Y-%m-%d)

## Recent Sessions

(No sessions logged yet)
EOF
fi
```

### Step 3: Extract Existing Sessions

```bash
# Extract everything before "## Recent Sessions"
BEFORE_SESSIONS=$(sed -n '1,/^## Recent Sessions/p' "$CURRENT_WORK" | sed '$d')

# Extract everything after "## Recent Sessions" (other sections)
AFTER_SESSIONS=$(sed -n '/^## Recent Sessions/,/^$/!p' "$CURRENT_WORK" | sed '1,/^## Recent Sessions/d')

# Extract existing session entries (lines starting with "- 2")
EXISTING_ENTRIES=$(grep '^- 20[0-9][0-9]-' "$CURRENT_WORK" 2>/dev/null || echo "")
```

### Step 4: Add New Entry

```bash
# Format: - YYYY-MM-DD HH:MM: [note text]
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M")
NEW_ENTRY="- ${TIMESTAMP}: ${ARGUMENTS}"

# Combine with existing entries
if [ -n "$EXISTING_ENTRIES" ]; then
  ALL_ENTRIES="${NEW_ENTRY}
${EXISTING_ENTRIES}"
else
  ALL_ENTRIES="$NEW_ENTRY"
fi
```

### Step 5: Prune to Max 5 Entries

```bash
# Keep only first 5 lines
PRUNED_ENTRIES=$(echo "$ALL_ENTRIES" | head -5)
```

### Step 6: Rebuild File

Use the Edit tool to update the Recent Sessions section:

```
Edit(
  file_path: ".claude/session-context/current-work.md",
  old_string: [entire Recent Sessions section including old entries],
  new_string: [Recent Sessions section with new entries]
)
```

**Important:** Preserve all other sections (Progress, Completed Tasks, Resume
Command, etc.)

### Step 7: Update Timestamp

Update the "Updated:" field at the top of the file to current date.

## Output Format

### Success Output

```markdown
Session note added to current-work.md

**Note:** [note text] **Timestamp:** YYYY-MM-DD HH:MM UTC

Recent sessions (5 max):

- 2026-01-10 14:30: [new note]
- 2026-01-10 10:15: [previous note]
- 2026-01-09 16:45: [older note] ...

{if entry pruned} Note: Oldest entry pruned to maintain 5-entry limit. {endif}
```

## Behavior with Active Specs

When a spec is active (current-work.md shows "Spec NNN - feature-name"):

- **Preserve all spec-related sections:**
  - Progress (N/M tasks)
  - Completed Tasks
  - Next task info

- **Add Recent Sessions section** after Progress, before Completed Tasks:

```markdown
# Current Work: Spec 167 - skills-in-skills

**Status**: Phase 3 - Implementation (IN PROGRESS) **spec_id**: 167 **Updated**:
2026-01-10

## Progress

- **Completed**: 35/38 tasks
- **Next**: T036: Final verification

## Recent Sessions

- 2026-01-10 14:30: Debugged test failure in audit skill
- 2026-01-10 10:15: Added LSP navigation examples

## Completed Tasks

...
```

## Edge Cases

| Scenario                    | Handling                                 |
| --------------------------- | ---------------------------------------- |
| current-work.md missing     | Create minimal file with note            |
| No Recent Sessions section  | Add section with new note                |
| Empty note text             | ERROR - require note                     |
| Very long note (>200 chars) | WARN but accept                          |
| Spec active                 | Add Recent Sessions after Progress       |
| No spec active              | Add Recent Sessions after Last Completed |

## Integration with Hooks

The `session-start.sh` hook already reads current-work.md, so Recent Sessions
will:

- ✅ Survive compaction (included in session start context)
- ✅ Be available on session resume
- ✅ Provide continuity across `/clear`

## File Structure Preservation

**If no active spec:**

```
# Current Work: No Active Spec
## Last Completed
## Recent Sessions  ← Added here
## Resume Command
```

**If active spec:**

```
# Current Work: Spec NNN - name
## Progress
## Recent Sessions  ← Added here
## Completed Tasks
## Resume Command
```

## Notes

- Session notes are **manual** - command must be explicitly invoked
- Notes are **append-only** - no editing of past entries
- Notes are **timestamped UTC** for consistency
- Notes **survive compaction** via session-start hook
- Notes **complement** SpecKit tracking (don't replace it)

## Quick Reference

```bash
# After investigation
/session-note Found root cause: missing ENV variable

# After decision
/session-note Decision: Use EventBridge over polling

# After debugging
/session-note Fixed Docker bundling - commits ba5fa161, 071094fa

# After maintenance
/session-note Updated deployment docs - ECS configuration
```

Context: $ARGUMENTS
