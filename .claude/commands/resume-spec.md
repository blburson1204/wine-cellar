---
model: sonnet
description: Load checkpoint and announce current state to resume work on a spec
argument-hint: [spec-id]
---

# /resume-spec

Load a checkpoint and announce current state to resume work on a spec.

**When to use**: At the start of a new session to quickly resume work on a spec
that was previously checkpointed.

## Usage

```
/resume-spec [spec-id]
```

**Arguments:**

- `spec-id` - (required) The spec ID to resume (e.g., "107")

## Behavior

1. **Find latest checkpoint for spec**:
   - Look in `.claude/checkpoints/{specId}/`
   - Find all checkpoint files (`specify.json`, `plan.json`, `tasks.json`)
   - Select the highest phase checkpoint (tasks > plan > specify)

2. **Read checkpoint JSON**:
   - Parse the checkpoint file
   - Extract meta, artifacts, git, and session information

3. **Validate git state** (advisory, not blocking):
   - Compare checkpoint branch/commit with current state
   - If branch changed: WARN "Branch changed: was {old}, now {new}"
   - If commit changed: INFO "Repository has new commits since checkpoint"
   - If status differs: INFO "Working directory state differs"

4. **Read artifact frontmatter for current context**:
   - Read spec.md frontmatter → goals, constraints, decisions
   - Read plan.md frontmatter → tech_stack, external_deps, test_strategy
   - Read tasks.md frontmatter → total_tasks, completed, current_task, next_task

5. **Announce current state**:

   ```
   Resuming spec 107: awards-collection

   Phase: plan (completed)
   Last checkpoint: 2025-12-23T10:30:00Z
   Git: main @ abc123 (INFO: 3 new commits since checkpoint)

   Summary from last session:
   > Completed planning phase. Key decisions: ...

   Current status:
   - Spec: approved
   - Plan: complete
   - Tasks: not started

   Next step: Execute /tasks to generate implementation tasks

   Quick actions:
   - /tasks 107 - Generate implementation tasks
   - /checkpoint 107 - Create new checkpoint
   ```

6. **Update session context** (if `.claude/session-context/current-work.md`
   exists):
   - Update current spec reference
   - Log resume event

## Output

- Current state clearly announced
- Git state validated with warnings if changed
- Next steps provided
- Ready to continue work

## Examples

```
/resume-spec 107               # Resume spec 107
/resume-spec 110               # Resume spec 110
```

## Error Handling

| Error                    | Action                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| Spec ID not provided     | ERROR - "Spec ID required: /resume-spec [spec-id]"                                            |
| No checkpoint found      | WARN - "No checkpoint for spec {specId}. Reading artifacts directly..." then read frontmatter |
| Checkpoint JSON invalid  | ERROR - "Checkpoint corrupted. Delete and re-checkpoint."                                     |
| Spec directory not found | ERROR - "No spec found for ID {specId}"                                                       |
| Artifact missing         | WARN - Include in status as "not found"                                                       |

## Notes

- If no checkpoint exists, the command still works by reading artifact
  frontmatter directly
- Git warnings are informational - work can proceed even if git state changed
- Session summary from checkpoint helps recover context quickly
- Consider running /checkpoint after making progress to save updated state
