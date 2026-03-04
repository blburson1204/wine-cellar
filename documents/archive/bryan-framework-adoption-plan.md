# Bryan's Framework Adoption Plan

**Created**: January 21, 2026 **Status**: ARCHIVED (Installed January 24, 2026)
**Superseded by**: [v2](bryan-framework-v2-adoption-plan.md),
[v3](bryan-framework-v3-adoption-plan.md)

## Overview

This document captures the plan to adopt selected components from Bryan's Claude
Code framework (`_bg_template/`) into the wine-cellar project. The goal is to
learn professional/commercial development practices while keeping overhead
appropriate for a single-developer project.

## Framework Source

All components come from: `_bg_template/` directory in wine-cellar repo.

---

## Components to Adopt

### Tier 1: Skills (8 total)

| Skill                          | Source Path                                                          | Purpose                                                                                        |
| ------------------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| using-superpowers              | `_bg_template/claude/skills/using-superpowers/SKILL.md`              | Meta-skill: "Check for skills first" - enforces skill usage before any task                    |
| test-driven-development        | `_bg_template/claude/skills/test-driven-development/SKILL.md`        | Enforces Red-Green-Refactor cycle. "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST"           |
| verification-before-completion | `_bg_template/claude/skills/verification-before-completion/SKILL.md` | Prevents "should work" claims. Forces fresh verification evidence before any completion claim. |
| systematic-debugging           | `_bg_template/claude/skills/systematic-debugging/SKILL.md`           | Four-phase debugging: Root Cause → Pattern Analysis → Hypothesis Testing → Implementation      |
| code-review-quality            | `_bg_template/claude/skills/code-review-quality/skill.md`            | **Workflow** for when/how to trigger code reviews. Dispatches code-reviewer agent.             |
| rca                            | `_bg_template/claude/skills/rca/SKILL.md`                            | Root Cause Analysis - traces bugs backward through call stack to find original trigger         |
| accessibility                  | `_bg_template/claude/skills/accessibility/SKILL.md`                  | WCAG 2.2 compliance for UI work (forms, tables, modals)                                        |
| security-review                | `_bg_template/claude/skills/security-review/SKILL.md`                | OWASP-based security checks. Modes: --quick, --comprehensive, --constitutional                 |

### Tier 1: Agents (3 total)

| Agent         | Source Path                                   | Purpose                                                                                    |
| ------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| code-reviewer | `_bg_template/claude/agents/code-reviewer.md` | Performs code review: categorizes issues (Critical/Important/Minor), gives merge verdict   |
| test-analyzer | `_bg_template/claude/agents/test-analyzer.md` | Categorizes test failures by severity (P1-P5), detects flaky tests, prioritizes fix order  |
| auto-fixer    | `_bg_template/claude/agents/auto-fixer.md`    | Fixes lint/TypeScript/import errors automatically. Max 3 attempts, then escalates to user. |

### Tier 1: SpecKit Lite (Commands + Simplified Templates)

| Component  | Source Path                                 | Purpose                                       |
| ---------- | ------------------------------------------- | --------------------------------------------- |
| /specify   | `_bg_template/claude/commands/specify.md`   | Create feature specification from description |
| /plan      | `_bg_template/claude/commands/plan.md`      | Generate implementation plan from spec        |
| /tasks     | `_bg_template/claude/commands/tasks.md`     | Generate tasks.json with dependency ordering  |
| /implement | `_bg_template/claude/commands/implement.md` | Execute tasks sequentially or in parallel     |

**SpecKit Infrastructure** (from `_bg_template/specify/`):

| Component                    | Purpose                         | Customization                             |
| ---------------------------- | ------------------------------- | ----------------------------------------- |
| `scripts/bash/*.sh`          | Workflow automation (8 scripts) | Use as-is                                 |
| `templates/spec-template.md` | Feature specification template  | **Simplify** - remove enterprise sections |
| `templates/plan-template.md` | Implementation plan template    | Use as-is                                 |
| `templates/tasks-*.json`     | Task generation schemas         | Use as-is                                 |
| `memory/constitution.md`     | Project principles              | **Customize** for wine-cellar             |

**Why "Lite"**: The full SpecKit templates include enterprise sections (SAM.gov
API limits, SOC2/GDPR compliance, data sensitivity classification, portal
permissions) that don't apply to wine-cellar. We'll simplify these.

### Tier 2: Consider Later

| Component | Type    | Notes                                             |
| --------- | ------- | ------------------------------------------------- |
| /clarify  | Command | Socratic exploration of requirements before /plan |
| /analyze  | Command | Review spec quality                               |

### Tier 3: Skip (Enterprise Overhead)

- Data sensitivity classification sections in templates
- Portal/permission layer sections in templates
- compliance-auditor agent
- ship-jobs, ship-app skills
- AWS-specific skills
- phase-executor agent (parallel execution - overkill for solo dev)
- Ralph looping / compaction hooks
- pre-edit-verify hook (adds friction without significant benefit)

---

## Existing Skill Rename

**Issue**: Current `code-review-standards` skill is a reference document
(tooling setup), not a workflow. Bryan's `code-review-quality` is the workflow.

**Action**: Rename existing skill to clarify purpose.

| Current                                 | Rename To                          | Reason                                                                              |
| --------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| `.claude/skills/code-review-standards/` | `.claude/skills/coding-standards/` | It's about tooling setup (ESLint, Prettier, TypeScript config), not review workflow |

---

## Installation Steps

### Step 1: Rename Existing Skill

```bash
cd /Users/brian/Documents/BLB\ Coding/wine-cellar
mv .claude/skills/code-review-standards .claude/skills/coding-standards
```

### Step 2: Copy Skills (8 skills)

```bash
# Copy all Tier 1 skills
cp -r _bg_template/claude/skills/using-superpowers .claude/skills/
cp -r _bg_template/claude/skills/test-driven-development .claude/skills/
cp -r _bg_template/claude/skills/verification-before-completion .claude/skills/
cp -r _bg_template/claude/skills/systematic-debugging .claude/skills/
cp -r _bg_template/claude/skills/code-review-quality .claude/skills/
cp -r _bg_template/claude/skills/rca .claude/skills/
cp -r _bg_template/claude/skills/accessibility .claude/skills/
cp -r _bg_template/claude/skills/security-review .claude/skills/
```

### Step 3: Copy Agents (3 agents)

```bash
# Create agents directory if it doesn't exist
mkdir -p .claude/agents

# Copy agents
cp _bg_template/claude/agents/code-reviewer.md .claude/agents/
cp _bg_template/claude/agents/test-analyzer.md .claude/agents/
cp _bg_template/claude/agents/auto-fixer.md .claude/agents/
```

### Step 4: Install SpecKit Lite

```bash
# Copy SpecKit commands
mkdir -p .claude/commands
cp _bg_template/claude/commands/specify.md .claude/commands/
cp _bg_template/claude/commands/plan.md .claude/commands/
cp _bg_template/claude/commands/tasks.md .claude/commands/
cp _bg_template/claude/commands/implement.md .claude/commands/

# Copy SpecKit infrastructure (note: install as .specify with dot prefix)
cp -r _bg_template/specify .specify

# Create specs directory for feature specifications
mkdir -p specs
```

### Step 5: Customize SpecKit Templates

After copying, simplify the templates for wine-cellar:

**`.specify/templates/spec-template.md`** - Remove these enterprise sections:

- Data Sensitivity Classification
- Portal Placement (superadmin/admin/app)
- Permissions & Access Control (complex role tables)
- Audit & Compliance Requirements (SOC2, GDPR)
- External Dependencies table (SAM.gov, FPDS references)

**`.specify/memory/constitution.md`** - Customize for wine-cellar:

- Keep TDD, Verification, Skills Before Action principles
- Remove references to Retryvr platform
- Simplify quality gates to match our npm scripts

### Step 6: Verify Installation

After copying, verify structure:

```
.claude/
├── skills/
│   ├── coding-standards/              # Renamed from code-review-standards
│   │   └── SKILL.md
│   ├── error-handling/
│   │   └── SKILL.md
│   ├── testing/
│   │   └── SKILL.md
│   ├── ui-design/
│   │   └── SKILL.md
│   ├── using-superpowers/             # NEW - meta-skill
│   │   └── SKILL.md
│   ├── test-driven-development/       # NEW
│   │   └── SKILL.md
│   ├── verification-before-completion/# NEW
│   │   └── SKILL.md
│   ├── systematic-debugging/          # NEW
│   │   └── SKILL.md
│   ├── code-review-quality/           # NEW
│   │   └── skill.md
│   ├── rca/                           # NEW
│   │   └── SKILL.md
│   ├── accessibility/                 # NEW
│   │   └── SKILL.md
│   └── security-review/               # NEW
│       └── SKILL.md
├── agents/                            # NEW directory
│   ├── code-reviewer.md
│   ├── test-analyzer.md
│   └── auto-fixer.md
└── commands/                          # NEW directory
    ├── specify.md
    ├── plan.md
    ├── tasks.md
    └── implement.md

.specify/                              # NEW - SpecKit infrastructure
├── memory/
│   └── constitution.md                # Customized for wine-cellar
├── scripts/bash/
│   ├── create-new-feature.sh
│   ├── setup-plan.sh
│   ├── check-prerequisites.sh
│   └── ... (other scripts)
└── templates/
    ├── spec-template.md               # Simplified for wine-cellar
    ├── plan-template.md
    ├── tasks-template.json
    └── tasks-verify-templates.json

specs/                                 # NEW - feature specifications go here
└── (created per feature)
```

### Step 7: Clean Up Template

After successful installation, optionally remove the template:

```bash
rm -rf _bg_template
```

Or keep it for reference.

---

## GitHub Action Compatibility

**No changes needed.** The framework and GitHub Action are complementary:

| When               | What Runs                        | Purpose            |
| ------------------ | -------------------------------- | ------------------ |
| During development | Skills + Agents (in Claude Code) | Catch issues early |
| On PR/push         | GitHub Action (code-quality.yml) | Safety net in CI   |

The GitHub Action currently runs:

- `lint` - ESLint + Prettier
- `type-check` - TypeScript compilation
- `test` - Tests with coverage
- `build` - Build API + Web

Bryan's framework catches these same issues earlier (before commit), reducing CI
failures.

---

## How the Skills Work Together

### Development Flow

```
0. ANY task
   └── using-superpowers Skill: "Check for skills first" before doing anything

1. Start feature (larger features)
   └── /specify → /plan → /tasks → /implement (SpecKit workflow)

2. Write code
   └── TDD Skill: Write failing test FIRST, then make it pass

3. Debug issues
   └── systematic-debugging Skill: 4-phase approach
   └── rca Skill: Trace back to root cause

4. Before claiming "done"
   └── verification-before-completion Skill: Run fresh verification

5. Before commit
   └── code-review-quality Skill: Trigger code-reviewer agent
   └── auto-fixer Agent: Fix lint/type errors automatically

6. If tests fail
   └── test-analyzer Agent: Categorize failures, prioritize fixes

7. For UI work
   └── accessibility Skill: WCAG 2.2 compliance check

8. For security concerns
   └── security-review Skill: OWASP-based audit
```

### Key "Iron Laws" to Remember

| Skill        | Iron Law                                                   |
| ------------ | ---------------------------------------------------------- |
| Superpowers  | "CHECK FOR SKILLS FIRST - EVEN 1% CHANCE MEANS USE IT"     |
| TDD          | "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST"          |
| Verification | "NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE" |
| Debugging    | "NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST"          |

### SpecKit Workflow

For larger features, use the structured workflow:

```
/specify "mobile responsive design"
    ↓ Creates specs/001-mobile-responsive/spec.md
/plan
    ↓ Creates plan.md with architecture decisions
/tasks
    ↓ Creates tasks.json with dependency ordering
/implement
    ↓ Executes tasks sequentially with verification
```

---

## Customization Notes

Some skills reference Bryan's specific tech stack (Retryvr platform, Prisma
patterns, etc.). These may need minor adjustments:

| Skill           | Potential Customization                                                         |
| --------------- | ------------------------------------------------------------------------------- |
| security-review | References `checklists/` subdirectory - may need to copy those too or simplify  |
| auto-fixer      | References Retryvr-specific commands - verify npm scripts match                 |
| test-analyzer   | Priority categories (P1-P5) reference auth/payment paths - adapt to wine-cellar |

For initial adoption, the skills will work as-is. Customize as needed during
use.

---

## Post-Installation Verification

After installation, test each component:

1. **using-superpowers**: Start any task, verify Claude checks for skills first
2. **TDD Skill**: Start a small feature, verify Claude enforces test-first
3. **Verification Skill**: Complete something, verify Claude demands evidence
4. **Code Review**: Make changes, trigger `/review` or ask for code review
5. **Auto-fixer**: Introduce a lint error, verify agent fixes it
6. **Test Analyzer**: Break a test, verify agent categorizes the failure
7. **SpecKit**: Run `/specify "test feature"` to verify workflow works

---

## Test Case: Mobile Responsive Feature

After installation, use the mobile-responsive feature as a SpecKit test case:

1. Run `/specify mobile responsive design for wine cellar`
2. Compare generated spec with existing `documents/mobile-responsive-plan.md`
3. Proceed through `/plan` → `/tasks` → `/implement`
4. Evaluate whether SpecKit adds value for this project's scale

This will validate whether the "Lite" installation provides benefit without
excessive overhead.

---

## References

- Original discussion: NEXT-SESSION-TODO.md (January 20, 2026)
- Framework source: `_bg_template/` directory
- SpecKit documentation: `_bg_template/claude/commands/*.md`

---

**Last Updated**: January 24, 2026
