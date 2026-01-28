---
model: sonnet
description:
  Quick session handoff - creates a resume prompt for starting fresh sessions
---

Create a handoff for session resume.

## Step 0: Find a Clean Stopping Point (BEFORE creating handoff)

Do NOT create a handoff if you are mid-task. First:

1. **Check current state:**
   - Am I mid-file-edit? → Complete the edit or revert
   - Am I mid-test-run? → Let it finish
   - Am I mid-todo-item? → Complete the atomic unit or note exactly where
     stopped
   - Are there uncommitted changes? → Note them explicitly

2. **If mid-task, either:**
   - Complete the current atomic unit of work (preferred), OR
   - Revert to last clean state and note what was attempted

3. **Clean stopping points include:**
   - Todo item marked complete
   - Test passing (or failing with known reason)
   - Commit created
   - File saved in working state
   - Clear decision point reached

Only proceed to handoff creation once at a clean boundary.

---

Output TWO things:

## 1. Brief Status (3-5 bullets)

What's done, what's in progress, any blockers or discoveries.

## 2. Resume Prompt

In a fenced code block I can copy-paste after `/clear`:

A self-contained prompt that gives the next session everything needed to
continue seamlessly.

**Required context (include ALL that apply):**

- The spec/task being worked on (with file path if applicable)
- Current todo list state (copy the actual todos if active)
- Exact next action to take (be specific: "Run `npm test` to verify fix" not
  "continue testing")
- Decisions made during this session and WHY (the reasoning is often more
  important than the decision)
- Approaches that were tried and rejected (so the next session doesn't retry
  them)
- Gotchas, edge cases, or surprises discovered
- Errors encountered and how they were resolved (or not)
- Assumptions made that might need revisiting
- Relevant file paths for quick orientation
- State of environment (running processes, uncommitted changes, branch name)

**Context quality check:** Before finalizing, ask yourself: "If I had zero
memory of this session, would this prompt let me continue without
re-investigating anything?" If not, add more detail.

The resume prompt must work standalone - assume the next session starts with
zero context.
