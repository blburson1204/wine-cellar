---
name: feature-capture-idea
description:
  Use when you have an idea for a future feature while working on current
  feature - quickly captures idea to future-work.md without disrupting flow
model: claude-haiku-4-5-20251001
---

# Capture Idea

## Overview

Lightning-fast idea capture that doesn't break your focus on current work.
Prevents idea loss while maintaining concentration on active feature.

**Core principle:** Capture and continue - don't context switch.

## When to Use

**Use this skill when:**

- ✅ Working on active feature
- ✅ Idea for future feature strikes
- ✅ Don't want to lose the idea
- ✅ Don't want to context switch

**Don't use this skill when:**

- ❌ Ready to start implementing idea now (use start-feature instead)
- ❌ Idea needs detailed specification (use `/specify` instead)
- ❌ No active feature (just edit future-work.md directly)

## What This Skill Does

### Step 1: Minimal Prompting

- Prompt for feature number (e.g., "089")
- Prompt for one-line description (e.g., "Export reports to Excel")

### Step 2: Quick Append

- Get current date
- Append formatted entry to `.claude/session-context/future-work.md`:

  ```markdown
  ## Feature NNN - Description

  - **Captured**: YYYY-MM-DD
  - **Status**: Idea
  - **Description**: [User's description]
  - **Notes**: [Optional - any context user mentioned]
  ```

### Step 3: Auto-Commit

- Stage the file: `git add .claude/session-context/future-work.md`
- Commit change: `git commit -m "idea: Feature NNN - Brief description"`
- Commits to current branch

### Step 4: Quick Confirmation

- Confirm to user:

  ```
  💡 Idea captured: Feature NNN - Description

  Saved to: .claude/session-context/future-work.md

  Returning to Feature [current]...
  ```

## Example Usage

### During Active Feature Work

```
[You're coding Feature 088 - Enhanced Reporting]
[Inspiration strikes about Excel export]

You: "Skill: feature-capture-idea"
AI: "Feature number? (e.g., 089)"
You: "089"
AI: "Brief description?"
You: "Export reports to Excel with formatting"

AI: [Appends to future-work.md]
AI: [Commits change]

AI: "💡 Idea captured: Feature 089 - Export reports to Excel
     Saved to future-work.md

     Returning to Feature 088..."

[You continue working on Feature 088 without disruption]
```

### With Additional Context

```
You: "Skill: feature-capture-idea"
AI: "Feature number?"
You: "089"
AI: "Brief description?"
You: "Excel export - use exceljs library, support .xlsx format"

AI: "💡 Idea captured: Feature 089 - Excel export
     Details saved
     Back to Feature 088..."
```

## Implementation Steps for AI

1. **Prompt** for feature number
2. **Prompt** for brief description
3. **Get current date** (YYYY-MM-DD format)
4. **Append entry** to future-work.md:
   - Header: `## Feature NNN - [description]`
   - Captured date
   - Status: Idea
   - Description from user
5. **Commit** the change
6. **Confirm** to user with one line
7. **Return focus** to current feature

## File Format

Appended content should match:

```markdown
## Feature 089 - Export Reports to Excel

- **Captured**: 2025-01-18
- **Status**: Idea
- **Description**: Export reports to Excel with formatting
- **Notes**: Consider using exceljs library, support .xlsx format
```

(Note: Blank line after entry for separation)

## Error Handling

| Error                        | Action                                             |
| ---------------------------- | -------------------------------------------------- |
| future-work.md doesn't exist | WARN - "Creating future-work.md" then proceed      |
| Git commit fails             | WARN - "Manual commit needed" but idea still saved |
| Invalid feature number       | WARN - "Use sequential numbers" but proceed        |

## Quick Reference

**One-line summary:** Idea strikes → capture-idea → 30 seconds → back to work

**Time to execute:** 15-30 seconds **Manual alternative:** 2-3 minutes, easy to
forget **Success rate:** 100% (very simple operation)

## Integration with Other Skills

**Before:** Working on feature (any state) **After:** Continue working on
current feature **Later:** Review future-work.md → `/specify` → start-feature

## Tips for Effective Use

1. **Keep descriptions brief** - One sentence is perfect
2. **Don't overthink** - Just capture, refine later
3. **Use sequential numbers** - Avoid conflicts
4. **Add context if helpful** - But keep it quick
5. **Review periodically** - Clean up future-work.md weekly

## What Makes This Different

**vs. Manual editing:**

- ✅ No context switch to editor
- ✅ Consistent formatting
- ✅ Auto-stages and commits
- ✅ Faster (30 sec vs 3 min)

**vs. `/specify` immediately:**

- ✅ Doesn't disrupt current work
- ✅ No premature specification
- ✅ Captures raw idea quickly
- ✅ Formal spec comes later

**vs. Text file note:**

- ✅ Git tracked
- ✅ Structured format
- ✅ AI can read and reference
- ✅ Integrated with workflow

## Session Context Integration

**Current work is preserved:**

- Doesn't modify current-work.md
- Doesn't switch branches
- Doesn't stop Docker
- Returns focus immediately

**Future work is queued:**

- Ideas accumulate in future-work.md
- Review when current feature ships
- Pick best idea for next feature
- Run SpecKit workflow when ready

## Common Patterns

### Capture Multiple Ideas in Session

```
[During one coding session]
Skill: feature-capture-idea → Feature 089
Skill: feature-capture-idea → Feature 090
Skill: feature-capture-idea → Feature 091

[All saved to future-work.md]
[Continue working on current feature]
```

### Capture Related Ideas

```
Feature 089 - Excel export
Feature 090 - PDF export
Feature 091 - CSV export with custom delimiter

[Group related ideas by sequential numbering]
```

### Add Technical Notes

```
Description: "Real-time WebSocket notifications"
Notes: "Research Socket.io vs native WebSockets, consider scaling with Redis"
```

## Lifecycle of a Captured Idea

1. **Capture** (this skill)
   - Status: Idea
   - Stored in future-work.md

2. **Review** (weekly or when ready for next feature)
   - Read future-work.md
   - Pick most valuable idea

3. **Specify** (SpecKit)
   - Run: `/specify 089-excel-export`
   - Create formal specification
   - Update future-work.md status to "Specified"

4. **Plan** (SpecKit)
   - Run: `/plan 089-excel-export`
   - Create technical plan
   - Update status to "Planned"

5. **Implement** (start-feature)
   - Run: `Skill: feature-start` with 089
   - Begin TDD implementation
   - Update status to "In Progress"

6. **Ship** (ship-feature)
   - Run: `Skill: feature-ship`
   - Feature merged to main
   - Update status to "Shipped"

7. **Archive** (manual)
   - Move entry to bottom of future-work.md
   - Or delete if no longer needed

## Example future-work.md After Several Captures

```markdown
# Future Work - Feature Ideas Backlog

## Captured Ideas

## Feature 089 - Export Reports to Excel

- **Captured**: 2025-01-18
- **Status**: Idea
- **Description**: Export reports with formatting
- **Notes**: Use exceljs, support .xlsx

## Feature 090 - Real-time Notifications

- **Captured**: 2025-01-18
- **Status**: Idea
- **Description**: WebSocket notifications for report completion
- **Notes**: Research Socket.io vs native

## Feature 091 - Scheduled Reports

- **Captured**: 2025-01-19
- **Status**: Idea
- **Description**: Cron-based report generation and email delivery
- **Notes**: Use node-cron, integrate with existing email service
```
