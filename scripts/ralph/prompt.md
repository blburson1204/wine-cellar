You are executing ONE task from a SpecKit PRD. You have fresh context — no prior
conversation history.

## Step 1: Read Project Context

Read the file `CLAUDE.md` at the repository root. It contains build commands,
test commands, coding patterns, and project conventions you must follow.

## Step 2: Read the PRD

Read the file: {{PRD_FILE}}

It contains a JSON object with a `tasks` array. Each task has these fields:

- `id` - Task identifier (e.g., "T001")
- `description` - What to implement
- `status` - "pending" or "done"
- `notes` - Phase and context information
- `target_file` - Primary file to modify (may be null)
- `gate` - ID of a task that must be "done" before this one can start (null = no
  dependency)
- `verify` - How to verify the task is complete

## Step 3: Select ONE Task

Find the first task where:

1. `status` is `"pending"`
2. `gate` is either `null` OR the gate task's `status` is `"done"`

If no task meets these criteria, output `<promise>COMPLETE</promise>` and stop
immediately.

## Step 4: Implement

Execute ONLY the selected task:

1. Read any files needed to understand the context
2. Implement the change described in `description`
3. If `target_file` is specified, that is the primary file to modify
4. Follow the project's coding patterns from CLAUDE.md

## Step 5: Verify

Run the verification described in the task's `verify` field. Common
verifications:

- `npx vitest run <path>` for test tasks
- `npm run type-check` for TypeScript changes
- `npm run lint` for code style
- `npm test` for full test suite

If verification fails, fix the issue and re-verify.

## Step 6: Commit

Stage and commit your changes with specific files (not `git add -A`):

```
git add <specific-files-you-changed>
git commit -m "feat: TASK_ID - brief description"
```

## Step 7: Update PRD

Read {{PRD_FILE}} again (it may have changed), then update ONLY the completed
task's `status` from `"pending"` to `"done"`. Write the updated JSON back to
{{PRD_FILE}}.

CRITICAL: Do NOT modify any other task's status. Only change the one task you
completed.

## Step 8: Check Completion

After updating the PRD, check if ALL tasks now have `status: "done"`. If yes,
output exactly:

```
<promise>COMPLETE</promise>
```

If tasks remain, exit normally. The Ralph Loop will spawn a new session for the
next task.

## Rules

- Execute EXACTLY one task per session — no more, no less
- Respect gate dependencies — never start a task whose gate is not "done"
- Always verify before marking a task done
- Do not modify unrelated code or other tasks' statuses
- Keep commits focused on the single task
