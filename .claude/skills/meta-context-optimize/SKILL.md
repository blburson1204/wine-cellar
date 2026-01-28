---
name: meta-context-optimize
description:
  Use when hitting context limits, delegating complex phases, or managing
  long-running SpecKit sessions - documents subagent delegation patterns for
  context isolation
---

# Context Optimization

## Overview

This skill documents patterns for managing Claude Code context efficiently
during long-running SpecKit sessions. Use these patterns when:

- Context window is filling up (75%+ usage)
- Complex phases require deep exploration
- Multiple parallel workstreams need isolation
- Session needs to pause and resume later

**Core principle:** Keep the main conversation focused; delegate exploratory
work to subagents.

## When to Use This Skill

**Use this skill when:**

- Working on complex SpecKit features (10+ tasks)
- Session has been running for 30+ minutes
- Multiple research threads need parallel exploration
- Need to preserve context for future sessions

**Don't use this skill when:**

- Simple, quick tasks (< 10 minutes)
- Single-file changes
- Direct questions that don't require exploration

## Pattern 1: Subagent Delegation

Delegate exploratory or intensive work to subagents using the Task tool. Each
subagent gets its own context window, preserving the main conversation.

### When to Delegate

| Situation               | Delegate? | Rationale                                |
| ----------------------- | --------- | ---------------------------------------- |
| Codebase exploration    | YES       | Lots of file reads fill context          |
| Pattern discovery       | YES       | Multiple grep/glob operations            |
| Research gathering      | YES       | External docs, API exploration           |
| Implementation tasks    | MAYBE     | Only if isolated (different files)       |
| Quick lookups           | NO        | Faster to do inline                      |
| User interaction needed | NO        | Subagents can't ask clarifying questions |

### How to Delegate

```
# Single delegation
Task(
  subagent_type="Explore",
  prompt="Search for status enum patterns in this codebase. Look for enums like CollectionJobStatus, find the naming convention (UPPERCASE vs lowercase), and report examples."
)

# Parallel delegation (launch ALL in single message)
Task(subagent_type="Explore", prompt="Search for auth middleware patterns...")
Task(subagent_type="Explore", prompt="Search for API response formats...")
Task(subagent_type="Explore", prompt="Search for data source naming...")
```

### Delegation Best Practices

1. **Be specific in prompts**: Include exactly what you need returned
2. **Request structured output**: Ask for tables, lists, or specific formats
3. **Limit scope**: "Search in apps/api/" not "search everywhere"
4. **Use Explore for discovery**: Best for codebase pattern finding
5. **Use general-purpose for complex tasks**: When agent needs to do multiple
   steps

## Pattern 2: Frontmatter for Efficient Reads

SpecKit templates include YAML frontmatter that summarizes key information. Read
frontmatter (~200 tokens) instead of full files (~2500 tokens) when you need
status, not content.

### Frontmatter Locations

| Artifact | Frontmatter Contains                                                                          |
| -------- | --------------------------------------------------------------------------------------------- |
| spec.md  | meta (spec_id, status, phase), summary (goals, constraints, decisions), critical_requirements |
| plan.md  | meta (spec_id, phase), summary (tech_stack, external_deps, test_strategy, deployment)         |
| tasks.md | meta (spec_id, phase), summary (total_tasks, completed, blocked, current_task, next_task)     |

### Reading Frontmatter Only

To read just the frontmatter without loading the full file:

```
Read(file_path="specs/107-feature/spec.md", limit=30)
```

This returns the first 30 lines, which includes all frontmatter for quick status
checks.

### When to Read Full vs Frontmatter

| Need                         | Action                           |
| ---------------------------- | -------------------------------- |
| Check spec status            | Read frontmatter only (limit=30) |
| Get current task             | Read tasks.md frontmatter only   |
| Understand full requirements | Read full spec.md                |
| Implement a specific task    | Read relevant section of plan.md |

## Pattern 3: Checkpoint and Resume

Use `/checkpoint` and `/resume-spec` commands to preserve and restore session
state across conversations.

### Checkpoint Workflow

1. **Complete a phase**: Finish /specify, /plan, or /tasks
2. **Create checkpoint**: Run `/checkpoint [spec-id]`
3. **Resume later**: In new session, run `/resume-spec [spec-id]`

### What Gets Preserved

| Component            | Preserved In               |
| -------------------- | -------------------------- |
| Current phase        | Checkpoint JSON            |
| Artifact frontmatter | Checkpoint JSON            |
| Git state            | Checkpoint JSON            |
| Session summary      | Checkpoint JSON (optional) |
| Next step            | Checkpoint JSON            |

### What Doesn't Get Preserved

- Conversation history (use summary to capture key points)
- In-flight thinking (complete current thought before checkpoint)
- Uncommitted code changes (git status is captured, not diffs)

## Pattern 4: Context Budget Management

Monitor context usage and take action before hitting limits.

### Context Thresholds

| Usage  | Status | Action                                           |
| ------ | ------ | ------------------------------------------------ |
| < 50%  | Green  | Work normally                                    |
| 50-75% | Yellow | Consider delegation for exploratory work         |
| 75-90% | Orange | Delegate actively, checkpoint before heavy reads |
| > 90%  | Red    | Checkpoint immediately, start new session        |

### Reducing Context Load

1. **Delegate exploration**: Use Task tool for codebase searches
2. **Read frontmatter first**: Only load full files when needed
3. **Summarize findings**: After exploration, capture key findings in a few
   lines
4. **Checkpoint regularly**: Don't wait for limits, checkpoint at phase
   boundaries
5. **Start fresh for new features**: Don't mix multiple features in one session

## Pattern 5: Parallel Execution

When multiple independent tasks exist, launch them in parallel to save time and
context.

### Identifying Parallel Opportunities

Tasks can run in parallel when:

- They touch different files
- They don't depend on each other's output
- They're read-only explorations

### Parallel Execution Example

```
# Tasks.md shows [P] markers for parallel tasks
- [ ] T002 [P] Extend frontmatter in spec-template.md
- [ ] T003 [P] Add frontmatter to plan-template.md
- [ ] T004 [P] Add frontmatter to tasks-template.json

# Launch all in single message:
Task(subagent_type="general-purpose", prompt="Extend frontmatter in spec-template.md per plan.md Phase 1 schema...")
Task(subagent_type="general-purpose", prompt="Add frontmatter to plan-template.md per plan.md Phase 1 schema...")
Task(subagent_type="general-purpose", prompt="Add frontmatter to tasks-template.json per plan.md Phase 1 schema...")
```

## Getting Oriented Protocol

When starting a new session (especially after /resume-spec), follow this
protocol:

### Session Start Checklist

1. **Check for active work**: Read `.claude/session-context/current-work.md` (if
   exists)
2. **Resume if applicable**: Run `/resume-spec [spec-id]` to load checkpoint
3. **Verify git state**: `git status` to confirm clean working directory
4. **Read frontmatter**: Quick check of spec/plan/tasks status
5. **Confirm context**: "Working on spec 107 at tasks phase, next task is T005"

### Avoiding Context Pitfalls

| Pitfall                           | Prevention                         |
| --------------------------------- | ---------------------------------- |
| Re-reading files you already read | Note what you've read in TodoWrite |
| Deep exploration inline           | Delegate to subagents              |
| No checkpoints                    | Checkpoint at every phase boundary |
| Mixing features                   | One feature per session            |
| Ignoring warnings                 | Pay attention to context usage     |

## Quick Reference

**Delegate to subagents:**

- Codebase exploration
- Pattern discovery
- Research gathering
- Parallel implementation

**Read frontmatter only:**

- Status checks
- Progress tracking
- Context recovery

**Checkpoint when:**

- Phase completes
- Context at 75%+
- Before major exploration
- Before ending session

**Start new session when:**

- Context at 90%+
- Starting new feature
- Significant time gap

## Integration with Other Skills

| Skill               | Integration                                        |
| ------------------- | -------------------------------------------------- |
| feature-start       | Sets up session context, consider checkpoint after |
| feature-ship        | Clean up and checkpoint before merge               |
| debug-systematic    | Delegate deep debugging to subagents               |
| workflow-brainstorm | Keep in main context (needs user interaction)      |
