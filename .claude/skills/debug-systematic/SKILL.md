---
name: debug-systematic
description:
  Use when encountering any bug, test failure, or unexpected behavior, before
  proposing fixes - four-phase framework (root cause investigation, pattern
  analysis, hypothesis testing, implementation) that ensures understanding
  before attempting solutions
---

# Systematic Debugging

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom
fixes are failure.

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## The Four Phases

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Messages** - Stack traces, line numbers, error codes. Don't
   skip.
2. **Reproduce Consistently** - If not reproducible, gather more data, don't
   guess.
3. **Check Recent Changes** - Git diff, new dependencies, config changes.
4. **Trace Data Flow** - Where does bad value originate? Use LSP to trace
   callers.
5. **Add Diagnostic Logging** - For multi-component systems, log at each
   boundary.

**For deep call stack issues, use:** `Skill: debug-rca`

### Phase 2: Pattern Analysis

1. **Find Working Examples** - What similar code works?
2. **Compare Differences** - List every difference, however small.
3. **Understand Dependencies** - What settings, config, environment?

### Phase 3: Hypothesis and Testing

1. **Form Single Hypothesis** - "I think X is the cause because Y"
2. **Test Minimally** - Smallest possible change, one variable at a time
3. **Verify Before Continuing** - Didn't work? New hypothesis. Don't stack
   fixes.

### Phase 4: Implementation

1. **Create Failing Test** - Use `Skill: test-tdd`
2. **Implement Single Fix** - ONE change, no "while I'm here" improvements
3. **Verify Fix** - Test passes, no regressions

**If 3+ fixes failed:** Question the architecture, not the fix. Discuss with
human partner.

## Red Flags - STOP and Return to Phase 1

- "Quick fix for now, investigate later"
- "Just try changing X and see"
- Proposing solutions before tracing data flow
- "I don't fully understand but this might work"
- "One more fix attempt" (when already tried 2+)

## Search Tools

| Task                        | Tool                                                 |
| --------------------------- | ---------------------------------------------------- |
| Find where function defined | `mcp__cclsp__find_definition`                        |
| Find all call sites         | `mcp__cclsp__find_references`                        |
| Find what calls this        | `mcp__cclsp__incomingCalls`                          |
| Find error patterns         | `Grep(pattern, path, output_mode: "content", -C: 3)` |

## Common Rationalizations

| Excuse                       | Reality                               |
| ---------------------------- | ------------------------------------- |
| "Simple, don't need process" | Simple bugs have root causes too      |
| "Emergency, no time"         | Systematic is FASTER than thrashing   |
| "Just try this first"        | First fix sets the pattern            |
| "Multiple fixes saves time"  | Can't isolate what worked             |
| "I see the problem"          | Seeing symptoms ≠ understanding cause |

## Quick Reference

| Phase             | Key Activities                 | Success Criteria            |
| ----------------- | ------------------------------ | --------------------------- |
| 1. Root Cause     | Read errors, reproduce, trace  | Understand WHAT and WHY     |
| 2. Pattern        | Find working examples, compare | Identify differences        |
| 3. Hypothesis     | Form theory, test minimally    | Confirmed or new hypothesis |
| 4. Implementation | Create test, fix, verify       | Bug resolved, tests pass    |
