# Context Management

Managing AI context windows and token budgets effectively.

## What's Automatic vs Manual

### Automatic (No Action Required)

| Feature                        | Description                                      |
| ------------------------------ | ------------------------------------------------ |
| Prompt caching                 | Anthropic caches repeated prompts automatically  |
| Conversation summarization     | Long conversations are auto-summarized           |
| **Compaction recovery (ATOM)** | `precompact.sh` + `session-start.sh` handle this |

### Manual (Your Responsibility)

| Feature             | How to Use                            |
| ------------------- | ------------------------------------- |
| Checkpoints         | Run `/checkpoint` at phase boundaries |
| Subagent delegation | Use Task tool for exploration         |
| Session boundaries  | Start new sessions for new features   |

## Getting Oriented Protocol

When starting a new session:

1. **Check session context**: Read `.claude/session-context/current-work.md`
2. **Resume from checkpoint**: `/resume-spec [spec-id]`
3. **Verify git state**: `git status`
4. **Announce orientation**: State spec, task, branch status

## When to Start a New Session

| Condition            | Action                           |
| -------------------- | -------------------------------- |
| Context at 90%+      | Checkpoint and start fresh       |
| Starting new feature | New session (don't mix features) |
| Significant time gap | Resume with `/resume-spec`       |
| Major phase change   | Consider fresh start             |

## Context Budget Guidelines

| Usage  | Status | Recommendation                |
| ------ | ------ | ----------------------------- |
| < 50%  | Green  | Work normally                 |
| 50-75% | Yellow | Delegate exploration          |
| 75-90% | Orange | Checkpoint, delegate actively |
| > 90%  | Red    | Checkpoint immediately        |

## Best Practices

**DO**: Checkpoint at phase boundaries, delegate exploration to subagents, one
feature per session, use `/resume-spec` to start sessions.

**DON'T**: Re-read files unnecessarily, do deep exploration inline, mix features
in one session, wait until context is exhausted.
