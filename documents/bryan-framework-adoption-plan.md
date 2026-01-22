# Bryan's Framework Adoption Plan

**Created**: January 21, 2026 **Status**: Ready for Implementation

## Overview

This document captures the plan to adopt selected components from Bryan's Claude
Code framework (`_bg_template/`) into the wine-cellar project. The goal is to
learn professional/commercial development practices while keeping overhead
appropriate for a single-developer project.

## Framework Source

All components come from: `_bg_template/` directory in wine-cellar repo.

---

## Components to Adopt

### Tier 1: Skills (7 total)

| Skill                          | Source Path                                                          | Purpose                                                                                        |
| ------------------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
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

### Tier 1: Hooks (1 total)

| Hook            | Source Path                                         | Purpose                                                                               |
| --------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------- |
| pre-edit-verify | `_bg_template/claude/hooks/atom/pre-edit-verify.sh` | Prevents editing stale files - forces re-read if file content changed since last read |

### Tier 2: Consider Later

| Component         | Type     | Notes                                                                     |
| ----------------- | -------- | ------------------------------------------------------------------------- |
| SpecKit workflow  | Commands | `/specify` → `/plan` → `/tasks` → `/implement` - good for larger features |
| using-superpowers | Skill    | Meta-skill that enforces "check for skills first"                         |

### Tier 3: Skip (Enterprise Overhead)

- Data sensitivity classification
- Portal/permission layers
- compliance-auditor agent
- ship-jobs, ship-app skills
- AWS-specific skills
- phase-executor agent
- Ralph looping / compaction hooks

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
cd /Users/brian/Documents/BLB Coding/wine-cellar
mv .claude/skills/code-review-standards .claude/skills/coding-standards
```

Update the filename inside if needed (SKILL.md stays the same).

### Step 2: Copy Skills

```bash
# Create directories and copy skills
cp -r _bg_template/claude/skills/test-driven-development .claude/skills/
cp -r _bg_template/claude/skills/verification-before-completion .claude/skills/
cp -r _bg_template/claude/skills/systematic-debugging .claude/skills/
cp -r _bg_template/claude/skills/code-review-quality .claude/skills/
cp -r _bg_template/claude/skills/rca .claude/skills/
cp -r _bg_template/claude/skills/accessibility .claude/skills/
cp -r _bg_template/claude/skills/security-review .claude/skills/
```

### Step 3: Copy Agents

```bash
# Create agents directory if it doesn't exist
mkdir -p .claude/agents

# Copy agents
cp _bg_template/claude/agents/code-reviewer.md .claude/agents/
cp _bg_template/claude/agents/test-analyzer.md .claude/agents/
cp _bg_template/claude/agents/auto-fixer.md .claude/agents/
```

### Step 4: Set Up Hook (Optional)

The pre-edit-verify hook prevents editing files with stale content.

```bash
# Create hooks directory
mkdir -p .claude/hooks

# Copy hook script
cp _bg_template/claude/hooks/atom/pre-edit-verify.sh .claude/hooks/
```

Then update `.claude/settings.json` (create if doesn't exist):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "command": "bash .claude/hooks/pre-edit-verify.sh",
        "timeout": 3
      }
    ]
  }
}
```

### Step 5: Verify Installation

After copying, verify structure:

```
.claude/
├── skills/
│   ├── coding-standards/          # Renamed from code-review-standards
│   │   └── SKILL.md
│   ├── error-handling/
│   │   └── SKILL.md
│   ├── testing/
│   │   └── SKILL.md
│   ├── ui-design/
│   │   └── SKILL.md
│   ├── test-driven-development/   # NEW
│   │   └── SKILL.md
│   ├── verification-before-completion/  # NEW
│   │   └── SKILL.md
│   ├── systematic-debugging/      # NEW
│   │   └── SKILL.md
│   ├── code-review-quality/       # NEW
│   │   └── skill.md
│   ├── rca/                       # NEW
│   │   └── SKILL.md
│   ├── accessibility/             # NEW
│   │   └── SKILL.md
│   └── security-review/           # NEW
│       └── SKILL.md
├── agents/                        # NEW directory
│   ├── code-reviewer.md
│   ├── test-analyzer.md
│   └── auto-fixer.md
├── hooks/                         # NEW directory (optional)
│   └── pre-edit-verify.sh
└── settings.json                  # Updated for hook (optional)
```

### Step 6: Clean Up Template

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
1. Start feature
   └── Consider: Does this need /specify? (SpecKit - Tier 2)

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
| TDD          | "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST"          |
| Verification | "NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE" |
| Debugging    | "NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST"          |

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

1. **TDD Skill**: Start a small feature, verify Claude enforces test-first
2. **Verification Skill**: Complete something, verify Claude demands evidence
3. **Code Review**: Make changes, trigger `/review` or ask for code review
4. **Auto-fixer**: Introduce a lint error, verify agent fixes it
5. **Test Analyzer**: Break a test, verify agent categorizes the failure

---

## References

- Original discussion: NEXT-SESSION-TODO.md (January 20, 2026)
- Framework source: `_bg_template/` directory
- SpecKit documentation: `_bg_template/claude/commands/*.md`

---

**Last Updated**: January 21, 2026
