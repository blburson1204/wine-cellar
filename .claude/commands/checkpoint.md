---
model: sonnet
description:
  Create a checkpoint to preserve session state at a SpecKit phase boundary
argument-hint: (spec-id)
---

# /checkpoint

Create a checkpoint to preserve session state at a SpecKit phase boundary.

**When to use**: After completing a SpecKit phase (specify, plan, tasks) to
preserve session state for later resume.

## Usage

```
/checkpoint [spec-id]
```

**Arguments:**

- `spec-id` - (optional) The spec ID (e.g., "107"). If not provided, attempts to
  detect from session context or current working directory.

## Behavior

1. **Identify current spec**:
   - From argument if provided
   - From `.claude/session-context/current-work.md` if exists
   - From current branch name pattern (`NNN-feature-name`)
   - If cannot determine: ERROR "Cannot determine spec ID - please provide as
     argument"

2. **Detect current phase** from existing artifacts:
   - Check `specs/{specId}-*/spec.md` exists → at least "specify" phase
   - Check `specs/{specId}-*/plan.md` exists → at least "plan" phase
   - Check `specs/{specId}-*/tasks.md` exists → at least "tasks" phase
   - Determine highest phase reached

3. **Read frontmatter from each artifact**:
   - Parse YAML frontmatter from spec.md (if exists)
   - Parse YAML frontmatter from plan.md (if exists)
   - Parse YAML frontmatter from tasks.md (if exists)

4. **Capture git state**:

   ```bash
   git rev-parse --abbrev-ref HEAD   # branch name
   git rev-parse --short HEAD        # commit hash
   git status --porcelain            # clean/dirty status
   ```

5. **Create checkpoint JSON** at `.claude/checkpoints/{specId}/{phase}.json`:

   ```json
   {
     "$schema": "checkpoint-v1",
     "meta": {
       "specId": "107",
       "specName": "awards-collection",
       "phase": "plan",
       "timestamp": "2025-12-23T10:30:00Z",
       "claudeVersion": "opus-4.5"
     },
     "artifacts": {
       "spec": {
         "path": "specs/107-awards-collection/spec.md",
         "exists": true,
         "frontmatter": {
           /* parsed frontmatter */
         }
       },
       "plan": {
         "path": "specs/107-awards-collection/plan.md",
         "exists": true,
         "frontmatter": {
           /* parsed frontmatter */
         }
       },
       "tasks": {
         "path": "specs/107-awards-collection/tasks.md",
         "exists": false
       }
     },
     "git": {
       "branch": "main",
       "lastCommit": "abc123",
       "status": "clean"
     },
     "session": {
       "summary": "Completed planning phase. Key decisions: ...",
       "nextStep": "Execute /tasks to generate implementation tasks"
     }
   }
   ```

6. **Prompt for session summary** (optional):
   - Ask: "Brief summary of what was accomplished? (press Enter to skip)"
   - If provided, include in checkpoint JSON

7. **Announce checkpoint creation**:

   ```
   Checkpoint created for spec 107 at plan phase

   Saved to: .claude/checkpoints/107/plan.json

   Git state: main @ abc123 (clean)
   Next step: Execute /tasks to generate implementation tasks

   To resume later: /resume-spec 107
   ```

## Output

- Checkpoint JSON file created at `.claude/checkpoints/{specId}/{phase}.json`
- Summary of what was captured
- Reminder of how to resume

## Examples

```
/checkpoint                    # Auto-detect spec from context
/checkpoint 107                # Explicit spec ID
/checkpoint 107-awards         # With feature name (spec ID extracted)
```

## Error Handling

| Error                    | Action                                                   |
| ------------------------ | -------------------------------------------------------- |
| Cannot determine spec ID | ERROR - "Provide spec ID as argument"                    |
| Spec directory not found | ERROR - "No spec found for ID {specId}"                  |
| No artifacts exist       | ERROR - "No spec.md found - run /specify first"          |
| Git command fails        | WARN - Include "git unavailable" in checkpoint, continue |
| Write permission denied  | ERROR - "Cannot write to .claude/checkpoints/"           |

## Notes

- Checkpoints are cumulative: `plan.json` includes spec frontmatter,
  `tasks.json` includes all previous
- Git status is informational - checkpoint works even if git is dirty
- Session summary is optional but helpful for context recovery
- Multiple checkpoints at same phase overwrite previous (only latest preserved)
