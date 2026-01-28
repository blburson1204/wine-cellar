---
name: feature-start
description:
  OPTIONAL skill for feature branch workflow - validates clean state, creates
  branch, updates session context, starts Docker. For mainline development, skip
  this skill and commit directly to main.
model: claude-haiku-4-5-20251001
---

# Start Feature

## 🚨 MANDATORY Prerequisites Check

**BEFORE using this skill, verify ALL prerequisites exist:**

1. **Spec must exist**: `specs/NNN-feature-name/spec.md`
2. **Plan must exist**: `specs/NNN-feature-name/plan.md`
3. **Tasks must exist**: `specs/NNN-feature-name/tasks.md`

**If ANY are missing:**

- ❌ **DO NOT proceed with implementation**
- ❌ **DO NOT run start-feature script**
- ✅ **BLOCK and tell user what's missing**
- ✅ **Suggest**: `/plan NNN-feature` or `/tasks NNN-feature`

**NEVER bypass this check. Implementation without plan.md and tasks.md violates
the workflow.**

## Overview

Automates the transition from **completed** SpecKit specification to active
feature development. Ensures clean working state, creates properly named branch,
updates AI context, and starts development environment.

**Core principle:** One command to go from **fully planned** spec to coding.

## Workflow Choice

**Branch creation is a TOOL, not a REQUIREMENT. Choose the workflow that fits
your task:**

### Mainline Development (Simple Changes)

For straightforward features that don't require isolation:

- ✅ Skip this skill entirely
- ✅ Commit directly to `main` branch
- ✅ Use standard git commands: `git commit`, `git push`
- ✅ Tests still mandatory before commits

### Feature Branch Development (Complex Work)

For complex features requiring isolation or collaboration:

- ✅ Use this skill to create a feature branch
- ✅ Automated branch creation and context setup
- ✅ Safer for experimental or multi-session work
- ✅ Easier to review and integrate later

**Neither approach is "better" - choose based on your needs.**

## Using the Start-Feature Script (For Feature Branch Workflow)

**If you choose feature branch development, use the start-feature script:**

```bash
.specify/scripts/bash/start-feature.sh <spec-number>

# Example:
.specify/scripts/bash/start-feature.sh 091
.specify/scripts/bash/start-feature.sh 091 --no-docker  # Skip Docker startup
```

This script:

1. ✅ Validates spec exists
2. ✅ Creates feature branch
3. ✅ Updates session context automatically
4. ✅ Starts Docker environment

**For mainline development:** Skip this script and commit directly to main
branch using standard git commands.

## When to Use

**Use this skill when you want FEATURE BRANCH workflow AND all files exist:**

- ✅ **spec.md exists**: Feature requirements defined (`/specify` complete)
- ✅ **plan.md exists**: Technical approach planned (`/plan` complete)
- ✅ **tasks.md exists**: Implementation tasks broken down (`/tasks` complete)
- ✅ Ready to begin implementation
- ✅ Want automated branch creation and context setup
- ✅ Need Docker environment started
- ✅ Prefer working in isolation from main branch

**SKIP this skill when:**

- ⏭️ **Simple changes**: Working directly on main branch (mainline development)
- ⏭️ **Quick fixes**: Not using SpecKit framework at all
- ⏭️ **Ad-hoc work**: No need for branch isolation

**DON'T use this skill when:**

- ❌ **Missing spec.md** (run `/specify NNN-feature` first)
- ❌ **Missing plan.md** (run `/plan NNN-feature` first)
- ❌ **Missing tasks.md** (run `/tasks NNN-feature` first)
- ❌ Already on a feature branch (finish current feature first)
- ❌ Just exploring ideas (use `Skill: feature-capture-idea` instead)

**The skill will REFUSE to run if any prerequisites are missing.**

## Prerequisites (For Feature Branch Workflow Only)

**These prerequisites only apply if you're using feature branch workflow:**

1. **SpecKit specification must exist** at `specs/NNN-feature-name/spec.md`
2. **Git available** (standard git)
3. **Plan.md should exist** (run `/plan NNN-feature` if not)
4. **Tasks.md should exist** (run `/tasks NNN-feature` if not)

**For mainline development:** You can start coding directly on main branch
without this skill.

## What This Skill Does

**The script handles everything automatically. AI just runs:**

```bash
.specify/scripts/bash/start-feature.sh <spec-number>
```

### What the Script Does:

1. **Validates git is available** - Checks for git
2. **Finds the spec** - Matches `specs/NNN-*/` directory
3. **Creates feature branch** - Creates branch using git
4. **Updates session context** - Writes
   `.claude/session-context/current-work.md`
5. **Starts Docker** - Runs `docker compose up -d` in background
6. **Reports success** - Shows next steps

### Script Output Example:

```
📋 Found spec: 091-fpds-dispatcher
   Path: specs/091-fpds-dispatcher/spec.md

🔀 Creating feature branch: 091-fpds-dispatcher
✅ Branch '091-fpds-dispatcher' created successfully
📝 Updated session context

============================================
✅ Ready to build: 091-fpds-dispatcher
============================================

Branch:  091-fpds-dispatcher
Spec:    specs/091-fpds-dispatcher/spec.md
Context: .claude/session-context/current-work.md

Next steps:
  1. Review plan.md for technical approach
  2. Review tasks.md for implementation checklist
  3. Begin TDD implementation (write tests first)
  4. Commit changes with: git commit -m "message"
```

## Error Handling

| Error                 | Action                                                    |
| --------------------- | --------------------------------------------------------- |
| Git not available     | FAIL - "Git required. Install git"                        |
| Spec doesn't exist    | FAIL - "Spec not found. Run `/specify NNN-feature` first" |
| Multiple spec matches | FAIL - "Multiple specs found for NNN: [list]"             |
| Branch creation fails | FAIL - "Branch creation failed. Check git status"         |
| Docker fails to start | WARN - "Docker failed. Start manually with docker-dev.sh" |

## Resuming Existing Work (New Session)

**Starting a NEW Claude Code session on EXISTING feature?**

Use `resume-feature.sh` instead - it sets context without creating a new branch:

```bash
.specify/scripts/bash/resume-feature.sh <spec-number>

# Example:
.specify/scripts/bash/resume-feature.sh 091
```

This:

1. Verifies feature branch exists
2. Updates session context to the feature
3. Shows current progress (tasks completed)
4. Does NOT create a new branch

**When to use which:** | Scenario | Script | |----------|--------| | First time
working on spec | `start-feature.sh` | | New Claude session, same feature |
`resume-feature.sh` | | Want to see what branch I'm on | `git branch` or
`git status` |

## Implementation Steps for AI

### Step 1: MANDATORY Prerequisites Validation

**BEFORE running any commands, validate ALL files exist:**

```bash
# Check each required file exists
ls specs/NNN-feature-name/spec.md    # Must exist
ls specs/NNN-feature-name/plan.md    # Must exist
ls specs/NNN-feature-name/tasks.md   # Must exist
```

**If ANY file is missing:**

- ❌ STOP immediately
- ❌ DO NOT run start-feature script
- ✅ Tell user exactly which files are missing
- ✅ Suggest appropriate command: `/plan NNN` or `/tasks NNN`

### Step 2: Run the Script (Only After All Prerequisites Exist)

```bash
.specify/scripts/bash/start-feature.sh <spec-number>
```

The script handles all validation, branch creation, and context setup.

**Just run the script:**

```bash
.specify/scripts/bash/start-feature.sh <spec-number>
```

**If script not available, manual steps:**

1. Verify git available: `which git`
2. Find spec: `ls -d specs/${FEATURE_NUM}-*/`
3. Create branch: `git checkout -b "${BRANCH_NAME}"`
4. Update `.claude/session-context/current-work.md`
5. Start Docker: `./scripts/docker/docker-dev.sh`

## Quick Reference

**One-line summary:** SpecKit spec complete → choose workflow → coding with TDD

**Workflow options:**

- **Mainline**: Skip this skill, commit to main directly
- **Feature branch**: Use this skill for automated branch setup

**Time to execute:** 30-60 seconds (feature branch workflow) **Manual
alternative:** 8 steps, 2-3 minutes, error-prone **Success rate:** High
(validates everything first)

## Integration with Other Skills

**Before:** `/specify`, `/plan`, `/tasks` (SpecKit workflow) **After:** Normal
development → `Skill: feature-ship` **During:** `Skill: feature-capture-idea`
(for new ideas)

## Session Context Contract

**This skill promises to:**

- Create current-work.md with all required fields
- Set Status to "Starting"
- Populate Next Session with TDD reminder
- Set Blockers to "None"

**User promises to:**

- Update current-work.md at end of each session
- Mark tasks done in "Last Session"
- Update "Next Session" with what's next
- Update "Blockers" if blocked

## Tips for Effective Use

1. **Choose your workflow first** - Simple changes? Use mainline. Complex
   features? Use feature branches.
2. **For mainline development** - Skip this skill entirely, commit directly to
   main
3. **For feature branches** - Validate prerequisites first (spec.md, plan.md,
   tasks.md)
4. **Never skip SpecKit workflow** - Run `/specify`, `/plan`, `/tasks` in
   sequence before implementation
5. **If files are missing, STOP** - Don't try to implement without proper
   planning
6. **Commit before invoking** - Clean working tree is required (feature branch
   workflow)
7. **Let Docker start fully** - Wait for "ready" message
8. **Review plan.md immediately** - Understand the technical approach
9. **Begin with tests** - Follow TDD discipline from day one

## Workflow Enforcement

**This skill is a CHOKEPOINT that prevents implementation without proper
planning:**

- ✅ It forces you to check prerequisites before coding
- ✅ It blocks if plan.md or tasks.md are missing
- ✅ It ensures you follow the complete SpecKit → Plan → Tasks → Implementation
  flow
- ✅ Future AI instances will hit the same enforcement
