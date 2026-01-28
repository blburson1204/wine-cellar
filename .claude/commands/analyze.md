---
model: opus
description: Analyze spec.md for quality issues and apply guided fixes
argument-hint: (spec-id)
commandId: analyze
version: 2.0.0
created: '2025-10-09'
updated: '2025-12-26'
maintainer: '@speckit'
category: speckit
deprecated: false
delegatesTo: spec-fixer
allowed-tools: [Read, Grep, Glob, Task]
---

# /analyze

Analyze spec.md for quality issues and apply guided fixes using the spec-fixer
agent.

## Overview

This command follows the **command wrapper pattern**: validate → parse →
delegate. It performs initial analysis, then delegates to the spec-fixer agent
which handles finding categorization, edit proposals, and per-issue approval
workflow.

## Prerequisites

- A valid `spec.md` file must exist in the spec directory
- SpecKit workflow: at minimum `/specify` completed

## Arguments

$ARGUMENTS - Specification to analyze. Options:

- Spec ID: `124` or `124-agent-implementation`
- Empty: Auto-detect from session context

## Execution

### Step 1: Validate Prerequisites

```bash
.specify/scripts/bash/check-prerequisites.sh --json --require-spec
```

Parse output for:

- `FEATURE_DIR`: Absolute path to spec directory
- `AVAILABLE_DOCS`: List of available documents

If spec.md not found: Error "No spec.md found. Run /specify first."

### Step 2: Run Initial Analysis

Check for common issues:

```bash
# Check for required sections
grep -c "## Requirements" {SPEC_PATH}
grep -c "## Test Strategy" {SPEC_PATH}
grep -c "## Error Handling" {SPEC_PATH}

# Find ambiguous language
grep -n -E "should|may|might|can|handle|manage|deal with" {SPEC_PATH}

# Find placeholders
grep -n -E "TODO|TKTK|XXX|\?\?\?|<placeholder>" {SPEC_PATH}

# Check for common typos
grep -in -E "teh|recieve|seperate|occured" {SPEC_PATH}
```

Compile initial findings list with locations.

### Step 3: Delegate to Spec-Fixer Agent

Read the agent template at `.claude/agents/spec-fixer.md`

Fill in placeholders:

- `{SPEC_ID}`: From $ARGUMENTS or auto-detected
- `{SPEC_PATH}`: Computed as `{FEATURE_DIR}/spec.md`
- `{FINDINGS}`: Structured list from initial analysis

Spawn the agent:

```
Task({
  subagent_type: "general-purpose",
  description: "Analyze and fix spec.md",
  prompt: "[spec-fixer.md template with placeholders filled, including initial findings]"
})
```

### Step 4: Interactive Approval Flow

The agent will present each finding for approval:

```markdown
## Finding 1/8 (P1 - Blocking)

**Issue:** Missing "Test Strategy" section **Location:** After "## Requirements"
section **Impact:** Cannot proceed to /plan without test strategy

**Proposed Edit:** [Shows diff]

**Your choice:** [Approve] [Reject] [Modify]
```

User responds to each finding:

- **Approve**: Agent applies the proposed edit
- **Reject**: Agent skips this finding
- **Modify**: User provides alternative content, agent applies that

### Step 5: Report Summary

Display agent output including:

- Total findings by severity
- Applied vs rejected fixes
- Remaining issues requiring attention
- Next steps recommendation

## What the Spec-Fixer Agent Does

The delegated agent handles:

1. **Finding Categorization**: Sorts issues by severity (P1-P4)
2. **Edit Generation**: Creates old_string → new_string proposals
3. **Per-Issue Approval**: Presents each finding with approve/reject/modify
   options
4. **Edit Application**: Uses Edit tool to apply approved changes
5. **Tracking**: Records applied vs rejected changes
6. **Summary Report**: Generates final status with remaining issues

## Finding Categories

| Severity | Description              | Auto-Fix?          | Examples                |
| -------- | ------------------------ | ------------------ | ----------------------- |
| P1       | Missing required section | Template provided  | Missing "Test Strategy" |
| P2       | Ambiguous requirement    | Needs user input   | "Should handle errors"  |
| P3       | Style inconsistency      | Yes, with approval | Mixed heading styles    |
| P4       | Minor typo               | Yes, with approval | "teh" → "the"           |

## Example Usage

```
/analyze 124
/analyze 124-agent-implementation
/analyze
```

## Expected Output

```markdown
## Analysis Findings

**Spec:** 124-agent-implementation **Total Issues:** 8

| Severity       | Count | Action             |
| -------------- | ----- | ------------------ |
| P1 (Blocking)  | 2     | Review immediately |
| P2 (Ambiguous) | 3     | Need clarification |
| P3 (Style)     | 2     | Auto-fixable       |
| P4 (Typo)      | 1     | Auto-fixable       |

---

## Finding 1/8 (P1 - Blocking)

**Issue:** Missing "Test Strategy" section ...

[Interactive approval workflow continues]

---

## Summary

| Category | Total | Applied | Rejected |
| -------- | ----- | ------- | -------- |
| P1       | 2     | 2       | 0        |
| P2       | 3     | 2       | 1        |
| P3       | 2     | 2       | 0        |
| P4       | 1     | 1       | 0        |

**Next Steps:**

1. Review applied changes: `git diff specs/124/spec.md`
2. Address rejected findings manually
3. Re-run `/analyze` to verify
4. Proceed to `/plan`
```

## Error Scenarios

| Error                 | Cause                       | Resolution                        |
| --------------------- | --------------------------- | --------------------------------- |
| No spec.md found      | SpecKit not initialized     | Run `/specify` first              |
| Empty spec.md         | File exists but empty       | Run `/specify` to populate        |
| No issues found       | Spec is clean               | Proceed to `/plan`                |
| Edit failed           | File permission or conflict | Review error, retry edit          |
| All findings rejected | User declined all fixes     | Spec unchanged, manual fix needed |

## Relationship to Other Commands

| Command      | Purpose             | Order                   |
| ------------ | ------------------- | ----------------------- |
| `/specify`   | Create spec.md      | 1st                     |
| `/analyze`   | Review spec quality | After specify, optional |
| `/plan`      | Create plan.md      | 2nd                     |
| `/tasks`     | Create tasks.md     | 3rd                     |
| `/implement` | Execute tasks       | 4th                     |

## AI Execution Instructions

When user runs `/analyze`:

1. **Parse arguments** - Extract spec ID if provided
2. **Run prerequisites check** - Execute check-prerequisites.sh
3. **Validate spec.md** - Confirm file exists
4. **Run initial analysis** - Grep for common issues
5. **Load agent template** - Read `.claude/agents/spec-fixer.md`
6. **Spawn agent** - Use Task tool with placeholders + findings
7. **Interactive flow** - Present findings, collect approvals
8. **Report summary** - Show final status from agent

**Command Wrapper Pattern:**

```
validate → parse → delegate → interact → report
    ↓         ↓        ↓          ↓         ↓
  check     grep     spawn     approve   summary
 prereqs  for issues  agent   each fix
```

**DO:**

- Always validate prerequisites first
- Run initial analysis to seed findings
- Delegate to spec-fixer agent
- Present each finding for approval (per-issue workflow)
- Report summary of applied vs rejected fixes

**DON'T:**

- Apply fixes without user approval
- Skip P1 blocking issues
- Modify files outside the spec directory
- Batch multiple fixes without individual review
- Continue if spec.md doesn't exist
