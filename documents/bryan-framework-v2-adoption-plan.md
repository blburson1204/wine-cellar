# Bryan's Framework v2 Adoption Plan

**Created**: January 27, 2026 **Status**: DRAFT

## Overview

This document captures the comparison and adoption plan for Bryan's updated
Claude Code framework (`_bg_framework2/`) against what was previously installed
from `_bg_template/` (completed January 24, 2026).

### Dual Purpose

Wine Cellar serves two purposes for this adoption:

1. **Build the app** — Wine Cellar is a real application Brian uses daily. It
   needs to keep moving forward without excessive ceremony on small fixes.
2. **Evaluate the framework** — Wine Cellar is the proving ground for a
   framework that may be adopted at Brian's company across multiple developers
   and larger projects. The question is not "does wine-cellar need this?" but
   "can wine-cellar teach us whether this works?"

This dual purpose means we adopt more components than a solo project strictly
needs, because we're evaluating them for team use. The **mainline vs. feature
branch** workflow (Part 6) is how we balance both goals — keeping small fixes
lightweight while exercising the full framework on larger features.

## Framework Source

- **Previous**: `_bg_template/` (no longer present — cleaned up after v1
  install)
- **Current**: `_bg_framework2/` temporary directory in wine-cellar repo
- **Framework size**: 222 files, covering skills, agents, commands, docs, hooks,
  and templates

---

## Part 1: Changes to Existing Components

### Skills (8 existing) — Rename to Match New Convention

All 8 skills we previously adopted are **content-identical** to the updated
versions. Bryan applied three changes across the board:

1. **Directory renaming** to a `category-name` convention
2. **Cross-reference updates** to match new directory names
3. **Markdown table formatting** compacted (less whitespace)

| Current Name                     | New Name (v2)              | Content Changed? |
| -------------------------------- | -------------------------- | ---------------- |
| `using-superpowers`              | `meta-skill-guide`         | No               |
| `test-driven-development`        | `test-tdd`                 | No               |
| `verification-before-completion` | `workflow-verify-complete` | No               |
| `systematic-debugging`           | `debug-systematic`         | No               |
| `code-review-quality`            | `code-review`              | No               |
| `rca`                            | `debug-rca`                | No               |
| `accessibility`                  | `ui-accessibility`         | No               |
| `security-review`                | `security-review`          | No (unchanged)   |

**Action**: Rename all directories to match the new convention. This produces
git churn, but the `category-name` pattern is cleaner for a growing framework
and aligns with all new components. Better to take the churn once now than
maintain a fork that diverges permanently.

**Also update**: `CLAUDE.md` skill references and any other files that reference
the old names.

### Agents (3 existing) — One Bug Fix

| Agent         | Change                                                                                                         | Significance |
| ------------- | -------------------------------------------------------------------------------------------------------------- | ------------ |
| code-reviewer | Whitespace compaction, YAML formatting                                                                         | Minor        |
| test-analyzer | **Fixed broken code fence** — sections after line 216 were trapped inside an unclosed quadruple-backtick block | Moderate     |
| auto-fixer    | Whitespace compaction, YAML formatting                                                                         | Minor        |

**Action**: Replace all three agent files with the v2 versions. The bug fix in
test-analyzer is needed, and taking the formatting cleanup in the other two
keeps us aligned with the upstream framework.

### Commands (4 existing) — Mixed

| Command      | Version | Change                                                                                  | Significance |
| ------------ | ------- | --------------------------------------------------------------------------------------- | ------------ |
| `/specify`   | 1.1.0   | No change                                                                               | None         |
| `/plan`      | 1.3.0   | Skill name references updated to new convention                                         | Minor        |
| `/tasks`     | 2.3.0   | **New T-DOC-GATE step** — documentation reconciliation gate before T-FINAL verification | Moderate     |
| `/implement` | 3.0.0   | **Complete rewrite** — delegates all execution to `/ralph` for fresh context per task   | Major        |

**`/tasks` T-DOC-GATE detail**: Inserts a new mandatory step between the last
implementation task and T-FINAL. Uses a `documentation-reconciliation` agent to
check for documentation drift. Blocks if `DRIFT_DETECTED`.

**`/implement` v3.0.0 detail**: Abandoned dual-mode execution
(sequential/parallel) in favor of delegating every task to `/ralph`, which
spawns a fresh Claude session per task to prevent "context rot." This is a
fundamental architectural change designed for large specs with 20+ tasks.

**Action**:

- `/specify`: No change needed.
- `/plan`: Replace with v2 (updated skill name references).
- `/tasks`: Replace with v2 (adds T-DOC-GATE). Also adopt the
  `documentation-reconciliation` agent it depends on.
- `/implement`: Replace with v3.0.0. Also adopt `/ralph` command and supporting
  infrastructure. While overkill for most wine-cellar features, we need to
  evaluate the fresh-context-per-task pattern for potential company use.

### SpecKit Infrastructure — Keep Our Customizations

| File                          | Change                                                                                                              | Significance |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------ |
| `constitution.md`             | Stricter (all features MUST use SpecKit), adds `/clarify` step, generic quality gates replace project-specific ones | Moderate     |
| `spec-template.md`            | 150 to 427 lines. 6 new enterprise sections (data sensitivity, RBAC, deprecation, audit, architecture, ext. deps)   | Major        |
| `plan-template.md`            | Formatting only                                                                                                     | None         |
| `tasks-template.json`         | Formatting only                                                                                                     | None         |
| `tasks-verify-templates.json` | Formatting only                                                                                                     | None         |
| All 8 bash scripts            | **Identical** — no changes                                                                                          | None         |

**Action**: Keep our customized constitution with wine-cellar-specific npm
commands and the relaxed small-change policy ("for smaller changes, direct
implementation is acceptable with proper testing"). This is essential for the
mainline workflow described in Part 6.

Keep our simplified spec template. The enterprise sections (RBAC, data
sensitivity, SOC2/GDPR compliance, portal placement) are Retryvr-specific and
don't apply here. If needed for the company rollout, they can be added to the
company-specific constitution later.

**Note — Constitution Contradiction**: Bryan's framework constitution (Principle
II) says "All features MUST begin with formal specification." But his
`feature-start` and `feature-ship` skills explicitly say "skip this for simple
changes — just commit to main." Our wine-cellar constitution handles this more
consistently by explicitly allowing both paths.

---

## Part 2: New Components to Adopt

### Tier 1: Adopt Now

These components provide immediate value for wine-cellar development AND give us
hands-on experience with the framework for company evaluation.

#### New Commands (9)

| Command         | Source Path                                      | Purpose                                                                                 |
| --------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `/handoff`      | `_bg_framework2/claude/commands/handoff.md`      | Creates session handoff with status bullets and resume prompt for new sessions          |
| `/code-review`  | `_bg_framework2/claude/commands/code-review.md`  | Pre-commit code review using security-review skill. P1-P4 findings with fix suggestions |
| `/session-note` | `_bg_framework2/claude/commands/session-note.md` | Quick timestamped notes appended to `current-work.md`. Auto-prunes to 5 entries         |
| `/clarify`      | `_bg_framework2/claude/commands/clarify.md`      | Socratic questioning to reduce spec ambiguity before `/plan`                            |
| `/analyze`      | `_bg_framework2/claude/commands/analyze.md`      | Analyze spec quality, detect missing sections, apply guided fixes                       |
| `/checkpoint`   | `_bg_framework2/claude/commands/checkpoint.md`   | Save session state at SpecKit phase boundaries for later resume                         |
| `/resume-spec`  | `_bg_framework2/claude/commands/resume-spec.md`  | Load checkpoint and resume work on a spec in a new session                              |
| `/constitution` | `_bg_framework2/claude/commands/constitution.md` | Formalize constitution updates with propagation to dependent templates                  |
| `/ralph`        | `_bg_framework2/claude/commands/ralph.md`        | Fresh-context-per-task execution for `/implement` v3.0.0                                |

#### New Skills (15)

| Skill                    | Source Path                                                    | Purpose                                                                                      |
| ------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `db-prisma`              | `_bg_framework2/claude/skills/db-prisma/SKILL.md`              | Prisma migration troubleshooting. "Never reset first", "never db push with migrations"       |
| `workflow-brainstorm`    | `_bg_framework2/claude/skills/workflow-brainstorm/SKILL.md`    | Collaborative design refinement through Socratic questioning before coding                   |
| `arch-decisions`         | `_bg_framework2/claude/skills/arch-decisions/SKILL.md`         | Architecture decision framework. Favors boring tech (PostgreSQL, Express, Next.js)           |
| `feature-capture-idea`   | `_bg_framework2/claude/skills/feature-capture-idea/SKILL.md`   | Lightning-fast idea capture during coding. Appends to `future-work.md`. 15-30 seconds        |
| `security-defense-depth` | `_bg_framework2/claude/skills/security-defense-depth/SKILL.md` | Four-layer validation pattern (entry, business logic, environment, debug) for Express APIs   |
| `code-search`            | `_bg_framework2/claude/skills/code-search/SKILL.md`            | Structured code verification using checklists and LSP-first navigation                       |
| `code-reuse-analysis`    | `_bg_framework2/claude/skills/code-reuse-analysis/SKILL.md`    | Check if patterns already exist before creating new ones. Prevents duplication               |
| `doc-gate`               | `_bg_framework2/claude/skills/doc-gate/SKILL.md`               | Post-feature documentation gate — document foundational changes, skip implementation details |
| `doc-search`             | `_bg_framework2/claude/skills/doc-search/SKILL.md`             | Text-based documentation search with semantic term expansion                                 |
| `doc-update`             | `_bg_framework2/claude/skills/doc-update/SKILL.md`             | Systematic documentation maintenance workflow                                                |
| `meta-health-check`      | `_bg_framework2/claude/skills/meta-health-check/SKILL.md`      | Audit Claude Code artifacts for staleness, bloat, and hygiene                                |
| `meta-context-optimize`  | `_bg_framework2/claude/skills/meta-context-optimize/SKILL.md`  | Context window management patterns for complex features                                      |
| `feature-start`          | `_bg_framework2/claude/skills/feature-start/SKILL.md`          | Automate transition from spec to active dev (branch creation, Docker, session context)       |
| `feature-ship`           | `_bg_framework2/claude/skills/feature-ship/SKILL.md`           | Feature branch completion: test suite, merge --no-ff, branch cleanup, session reset          |
| `spec-validate`          | `_bg_framework2/claude/skills/spec-validate/SKILL.md`          | Pre-planning gate that validates spec completeness before `/plan`                            |

#### New Agents (3)

| Agent                          | Source Path                                                    | Purpose                                                                    |
| ------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `capture-idea`                 | `_bg_framework2/claude/agents/capture-idea.md`                 | Execution agent for `feature-capture-idea` skill. Appends and auto-commits |
| `spec-validator`               | `_bg_framework2/claude/agents/spec-validator.md`               | Execution agent for `spec-validate` skill. Produces validation report      |
| `documentation-reconciliation` | `_bg_framework2/claude/agents/documentation-reconciliation.md` | Execution agent for T-DOC-GATE in `/tasks`. Checks for documentation drift |

#### Bug Fix (1)

| File               | Action                                                           |
| ------------------ | ---------------------------------------------------------------- |
| `test-analyzer.md` | Replace with v2 version (fixes broken code fence after line 216) |

#### Supporting Infrastructure

| File / Directory                          | Purpose                                        |
| ----------------------------------------- | ---------------------------------------------- |
| `.claude/session-context/current-work.md` | Target for `/session-note` and `feature-start` |
| `.claude/session-context/future-work.md`  | Target for `feature-capture-idea`              |

### Tier 2: Consider Later

| Component       | Type  | Purpose                                                           | Notes                                                                 |
| --------------- | ----- | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| ATOM hooks      | Hooks | Session recovery, pre-compaction snapshots, stale file prevention | Lightweight (88 lines bash). Worth evaluating after Tier 1 is stable  |
| `security-rbac` | Skill | RBAC validation (role matrices, permission checks)                | Relevant when company projects have roles. Not needed for wine-cellar |

### Tier 3: Skip (Retryvr-Specific)

| Component                  | Type     | Why Skip                                                          |
| -------------------------- | -------- | ----------------------------------------------------------------- |
| `/health`                  | Command  | Hardcoded to Retryvr Docker compose files                         |
| `/archive-spec`            | Command  | Google Drive integration for spec archival                        |
| `/ship-jobs`               | Command  | AWS ECR/ECS Fargate deployment pipeline                           |
| `/purge-task-outputs`      | Command  | Hardcoded to Retryvr-specific temp paths                          |
| `/whats-new`               | Command  | Claude Code changelog research — not project-specific             |
| `/superpowers-brainstorm`  | Command  | Thin wrapper around `workflow-brainstorm` skill (redundant)       |
| `ui-design-system`         | Skill    | Enforces `@retryvr/ui` component library                          |
| `phase-executor`           | Agent    | Redundant if using `/ralph` for task execution                    |
| `security-audit`           | Agent    | Retryvr-specific grep patterns                                    |
| `compliance-auditor`       | Agent    | Audits against Retryvr constitutional principles                  |
| `claude/docs/` (35 files)  | Docs     | Architecture, coding standards — Retryvr-specific                 |
| `claude/guides/` (4 files) | Guides   | Integration patterns — Retryvr-specific                           |
| Enterprise spec sections   | Template | Data sensitivity, RBAC, audit/compliance, portal placement        |
| Stricter constitution      | Template | Mandatory SpecKit for all changes — contradicts mainline workflow |

---

## Part 3: Installation Steps

### Phase A: Rename Existing Skills

```bash
cd /Users/brian/Documents/BLB\ Coding/wine-cellar

# Rename existing skill directories to v2 naming convention
mv .claude/skills/using-superpowers .claude/skills/meta-skill-guide
mv .claude/skills/test-driven-development .claude/skills/test-tdd
mv .claude/skills/verification-before-completion .claude/skills/workflow-verify-complete
mv .claude/skills/systematic-debugging .claude/skills/debug-systematic
mv .claude/skills/code-review-quality .claude/skills/code-review
mv .claude/skills/rca .claude/skills/debug-rca
mv .claude/skills/accessibility .claude/skills/ui-accessibility
# security-review stays the same
```

Then replace the contents of each renamed directory with the v2 version (updated
cross-references and formatting):

```bash
cp _bg_framework2/claude/skills/meta-skill-guide/SKILL.md .claude/skills/meta-skill-guide/
cp _bg_framework2/claude/skills/test-tdd/SKILL.md .claude/skills/test-tdd/
cp _bg_framework2/claude/skills/workflow-verify-complete/SKILL.md .claude/skills/workflow-verify-complete/
cp _bg_framework2/claude/skills/debug-systematic/SKILL.md .claude/skills/debug-systematic/
cp _bg_framework2/claude/skills/code-review/SKILL.md .claude/skills/code-review/
cp _bg_framework2/claude/skills/debug-rca/SKILL.md .claude/skills/debug-rca/
cp _bg_framework2/claude/skills/ui-accessibility/SKILL.md .claude/skills/ui-accessibility/
cp _bg_framework2/claude/skills/security-review/SKILL.md .claude/skills/security-review/
```

### Phase B: Replace Existing Agents and Commands

```bash
# Replace all 3 agents with v2 versions (includes test-analyzer bug fix)
cp _bg_framework2/claude/agents/code-reviewer.md .claude/agents/
cp _bg_framework2/claude/agents/test-analyzer.md .claude/agents/
cp _bg_framework2/claude/agents/auto-fixer.md .claude/agents/

# Replace commands with v2 versions
cp _bg_framework2/claude/commands/specify.md .claude/commands/
cp _bg_framework2/claude/commands/plan.md .claude/commands/
cp _bg_framework2/claude/commands/tasks.md .claude/commands/
cp _bg_framework2/claude/commands/implement.md .claude/commands/
```

### Phase C: Add New Skills (15)

```bash
cp -r _bg_framework2/claude/skills/db-prisma .claude/skills/
cp -r _bg_framework2/claude/skills/workflow-brainstorm .claude/skills/
cp -r _bg_framework2/claude/skills/arch-decisions .claude/skills/
cp -r _bg_framework2/claude/skills/feature-capture-idea .claude/skills/
cp -r _bg_framework2/claude/skills/security-defense-depth .claude/skills/
cp -r _bg_framework2/claude/skills/code-search .claude/skills/
cp -r _bg_framework2/claude/skills/code-reuse-analysis .claude/skills/
cp -r _bg_framework2/claude/skills/doc-gate .claude/skills/
cp -r _bg_framework2/claude/skills/doc-search .claude/skills/
cp -r _bg_framework2/claude/skills/doc-update .claude/skills/
cp -r _bg_framework2/claude/skills/meta-health-check .claude/skills/
cp -r _bg_framework2/claude/skills/meta-context-optimize .claude/skills/
cp -r _bg_framework2/claude/skills/feature-start .claude/skills/
cp -r _bg_framework2/claude/skills/feature-ship .claude/skills/
cp -r _bg_framework2/claude/skills/spec-validate .claude/skills/
```

### Phase D: Add New Commands (9)

```bash
cp _bg_framework2/claude/commands/handoff.md .claude/commands/
cp _bg_framework2/claude/commands/code-review.md .claude/commands/
cp _bg_framework2/claude/commands/session-note.md .claude/commands/
cp _bg_framework2/claude/commands/clarify.md .claude/commands/
cp _bg_framework2/claude/commands/analyze.md .claude/commands/
cp _bg_framework2/claude/commands/checkpoint.md .claude/commands/
cp _bg_framework2/claude/commands/resume-spec.md .claude/commands/
cp _bg_framework2/claude/commands/constitution.md .claude/commands/
cp _bg_framework2/claude/commands/ralph.md .claude/commands/
```

### Phase E: Add New Agents (3)

```bash
cp _bg_framework2/claude/agents/capture-idea.md .claude/agents/
cp _bg_framework2/claude/agents/spec-validator.md .claude/agents/
cp _bg_framework2/claude/agents/documentation-reconciliation.md .claude/agents/
```

### Phase F: Create Supporting Infrastructure

```bash
mkdir -p .claude/session-context
touch .claude/session-context/current-work.md
touch .claude/session-context/future-work.md
```

### Phase G: Customization

After copying, review and adjust these files for wine-cellar:

| File                              | Customization Needed                                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `db-prisma/SKILL.md`              | References `prisma-surgical-fixes` sub-skill — verify or remove reference                                                   |
| `arch-decisions/SKILL.md`         | References sub-files (`DECISION-FRAMEWORK.md`) — verify or inline                                                           |
| `security-defense-depth/SKILL.md` | Should work as-is for Express API                                                                                           |
| `code-review.md` (command)        | Verify it references our (now renamed) skill names                                                                          |
| `session-note.md` (command)       | Verify `current-work.md` path matches our setup                                                                             |
| `capture-idea.md` (agent)         | Verify `future-work.md` path matches our setup                                                                              |
| `feature-start/SKILL.md`          | References `docker-dev.sh` — wine-cellar uses `docker-compose.yml`                                                          |
| `feature-ship/SKILL.md`           | References `npm run test:full-docker` — verify against our npm scripts                                                      |
| `ralph.md` (command)              | **Change `--max-iterations` default from 10 to 3** (see below). Also verify `ralph.sh` script exists or needs to be created |
| `implement.md` (command)          | Update example output to show `Max iterations: 3`. Verify `/ralph` integration works                                        |
| `documentation-reconciliation.md` | Verify doc paths match wine-cellar structure                                                                                |

#### Ralph Max Iterations Adjustment

Bryan's upstream default is 10, which he recently reduced to 5. For wine-cellar
we set it to **3** because:

- Wine-cellar features are small — unlikely to have 5+ tasks in a spec
- We're evaluating the pattern, not running production workloads
- Lower cap = faster feedback if something goes wrong (3 wasted iterations,
  not 10)
- Ralph can always be re-run to pick up remaining tasks
- Can increase later once we've validated the pattern works

**What max-iterations means**: Each Ralph Loop iteration spawns one fresh Claude
session that picks up ONE pending task, executes it, marks it done, and exits.
The cap prevents infinite looping if a task fails repeatedly without marking
itself done. With `max-iterations: 3`, Ralph executes up to 3 tasks per run. If
a spec has more tasks, re-run `/ralph` or `/implement` to continue.

In `ralph.md`, change:

```
| `--max-iterations` | 10 | Max loop iterations before stopping |
```

to:

```
| `--max-iterations` | 3 | Max loop iterations before stopping |
```

Also update the example output in both `ralph.md` and `implement.md` from
`Max iterations: 10` to `Max iterations: 3`.

### Phase H: Update CLAUDE.md

Update the skills list and add new commands/agents documentation. Update any
references to old skill names.

### Phase I: Verify Installation

After installation, verify the final structure:

```
.claude/
├── skills/                              # 23 total (8 renamed + 15 new)
│   ├── meta-skill-guide/                # RENAMED from using-superpowers
│   ├── test-tdd/                        # RENAMED from test-driven-development
│   ├── workflow-verify-complete/        # RENAMED from verification-before-completion
│   ├── debug-systematic/               # RENAMED from systematic-debugging
│   ├── code-review/                    # RENAMED from code-review-quality
│   ├── debug-rca/                      # RENAMED from rca
│   ├── ui-accessibility/               # RENAMED from accessibility
│   ├── security-review/                # existing (name unchanged)
│   ├── coding-standards/               # existing (unchanged)
│   ├── error-handling/                 # existing (unchanged)
│   ├── testing/                        # existing (unchanged)
│   ├── ui-design/                      # existing (unchanged)
│   ├── db-prisma/                      # NEW
│   ├── workflow-brainstorm/            # NEW
│   ├── arch-decisions/                 # NEW
│   ├── feature-capture-idea/           # NEW
│   ├── security-defense-depth/         # NEW
│   ├── code-search/                    # NEW
│   ├── code-reuse-analysis/            # NEW
│   ├── doc-gate/                       # NEW
│   ├── doc-search/                     # NEW
│   ├── doc-update/                     # NEW
│   ├── meta-health-check/              # NEW
│   ├── meta-context-optimize/          # NEW
│   ├── feature-start/                  # NEW
│   ├── feature-ship/                   # NEW
│   └── spec-validate/                  # NEW
├── agents/                             # 6 total (3 updated + 3 new)
│   ├── code-reviewer.md                # UPDATED (v2 formatting)
│   ├── test-analyzer.md                # UPDATED (v2 bug fix)
│   ├── auto-fixer.md                   # UPDATED (v2 formatting)
│   ├── capture-idea.md                 # NEW
│   ├── spec-validator.md               # NEW
│   └── documentation-reconciliation.md # NEW
├── commands/                           # 13 total (4 updated + 9 new)
│   ├── specify.md                      # UPDATED (v2)
│   ├── plan.md                         # UPDATED (v2 skill refs)
│   ├── tasks.md                        # UPDATED (v2 + T-DOC-GATE)
│   ├── implement.md                    # UPDATED (v3.0.0 → /ralph)
│   ├── handoff.md                      # NEW
│   ├── code-review.md                  # NEW
│   ├── session-note.md                 # NEW
│   ├── clarify.md                      # NEW
│   ├── analyze.md                      # NEW
│   ├── checkpoint.md                   # NEW
│   ├── resume-spec.md                  # NEW
│   ├── constitution.md                 # NEW
│   └── ralph.md                        # NEW
└── session-context/                    # NEW directory
    ├── current-work.md
    └── future-work.md

.specify/                               # existing (no changes)
├── memory/constitution.md              # KEEP our wine-cellar version
├── scripts/bash/                       # unchanged
└── templates/                          # KEEP our simplified versions
```

### Phase J: Clean Up

After successful installation and verification:

```bash
rm -rf _bg_framework2
```

Or keep for reference.

---

## Part 4: How New Components Fit the Workflow

### Updated Development Flow

```
0. ANY task
   └── meta-skill-guide: "Check for skills first"

1. Capture idea (if mid-task)
   └── feature-capture-idea + capture-idea Agent

2. Design phase (before coding)
   └── workflow-brainstorm: Socratic design refinement
   └── arch-decisions: Architecture decision framework

3. Start feature — CHOOSE YOUR PATH (see Part 6)
   ├── MAINLINE (small fix): Skip to step 4, commit to main
   └── FEATURE BRANCH (larger feature):
       └── /specify → /clarify → /plan → /tasks
       └── feature-start: Create branch, set up context
       └── /implement → /ralph: Execute with fresh context

4. Write code
   └── test-tdd: Write failing test FIRST
   └── db-prisma: Prisma migration issues
   └── security-defense-depth: API validation layers
   └── code-search: Verify patterns before writing
   └── code-reuse-analysis: Check for existing patterns

5. Debug issues
   └── debug-systematic: 4-phase approach
   └── debug-rca: Trace to root cause

6. Before claiming "done"
   └── workflow-verify-complete: Run fresh verification
   └── spec-validate: Validate spec completeness

7. Before commit
   └── /code-review: Pre-commit review
   └── code-review → code-reviewer Agent
   └── auto-fixer Agent: Fix lint/type errors
   └── doc-gate: Document foundational changes

8. Ship feature (feature branch only)
   └── feature-ship: Test, merge --no-ff, cleanup

9. Session management
   └── /session-note: Capture decisions
   └── /checkpoint: Save SpecKit phase state
   └── /handoff: Create resume prompt
   └── /resume-spec: Resume from checkpoint

10. If tests fail
    └── test-analyzer Agent: Categorize and prioritize

11. For UI work
    └── ui-accessibility: WCAG 2.2 compliance

12. For security concerns
    └── security-review: OWASP audit
    └── security-defense-depth: Layer validation

13. Periodic maintenance
    └── meta-health-check: Audit framework artifacts
    └── meta-context-optimize: Context management
    └── /constitution: Update project principles
```

---

## Part 5: Summary of Changes

| Category       | Previously Installed | Adding Now | Updating  | New Total |
| -------------- | -------------------- | ---------- | --------- | --------- |
| Skills         | 8                    | 15         | 8 renamed | 23        |
| Agents         | 3                    | 3          | 3 updated | 6         |
| Commands       | 4                    | 9          | 4 updated | 13        |
| Infrastructure | —                    | 2 files    | —         | 2 files   |

**What we're doing**:

- Renaming 7 existing skill directories to `category-name` convention
- Replacing all existing agents/commands with v2 versions
- Adopting `/implement` v3.0.0 and `/ralph` for evaluation
- Adopting T-DOC-GATE documentation reconciliation
- Adopting full SpecKit workflow enhancements (/clarify, /analyze, /checkpoint,
  /resume-spec)
- Adopting feature lifecycle skills (feature-start, feature-ship)
- Adopting code intelligence skills (code-search, code-reuse-analysis)
- Adopting documentation skills (doc-gate, doc-search, doc-update)

**What we're NOT doing**:

- Replacing our constitution (keeping wine-cellar-specific version)
- Replacing our spec template (keeping simplified version)
- Adopting Retryvr-specific components (Docker health, AWS deployment, design
  system, compliance auditor)
- Adopting ATOM hooks (Tier 2 — evaluate after Tier 1 is stable)

---

## Part 6: Mainline vs. Feature Branch Workflow

### The Problem

Adopting more framework components means more ceremony. But wine-cellar is a
real app where quick bug fixes shouldn't require a full SpecKit pipeline. The
framework needs to support both "fix this one-liner" and "build this new
feature."

### How It Works

The split is a **developer decision**, not an automated gate. You choose the
path based on the size and complexity of the change.

#### Mainline Path (Simple Changes)

For bug fixes, small tweaks, and quick improvements:

1. Skip SpecKit entirely — no `/specify`, no `/plan`, no `/tasks`
2. Skip `feature-start` — stay on `main` branch
3. Write code with TDD (test-tdd skill still applies)
4. Run tests: `npm test`
5. Commit directly to `main`
6. Push: `git push origin main`

**The `feature-start` skill says it plainly:**

> "Branch creation is a TOOL, not a REQUIREMENT. Choose the workflow that fits
> your task."

**The `feature-ship` skill reinforces this:**

> "If you committed directly to main branch, you don't need this skill... For
> mainline development: test, push, done."

#### Feature Branch Path (Complex Work)

For meaningful features requiring design, planning, or isolation:

1. `/specify` → `/clarify` → `/plan` → `/tasks` (full SpecKit pipeline)
2. `feature-start`: Create branch, set up session context
3. Implement with TDD (test-tdd skill)
4. `/implement` → `/ralph`: Execute tasks with fresh context
5. `feature-ship`: Run full test suite, merge `--no-ff`, clean up branch

#### When to Use Which

| Change Type                         | Path           | SpecKit? |
| ----------------------------------- | -------------- | -------- |
| Fix a typo or obvious bug           | Mainline       | No       |
| Add a small UI tweak                | Mainline       | No       |
| Update a dependency                 | Mainline       | No       |
| Add a new feature with UI + API     | Feature Branch | Yes      |
| Refactor a subsystem                | Feature Branch | Yes      |
| Multi-session work                  | Feature Branch | Yes      |
| Anything you'd want to review first | Feature Branch | Yes      |

#### How the Choice Gets Made

The mainline vs. feature branch decision is a **developer judgment call**, not
an automated gate. In practice, the signal comes from how Brian phrases the
request:

| Brian says...                       | Claude does...                                       |
| ----------------------------------- | ---------------------------------------------------- |
| "Fix the bug where..."              | **Mainline** — TDD, fix, test, commit to main        |
| "Add a small tweak to..."           | **Mainline** — implement directly, test, commit      |
| "I want to build a feature that..." | **Ask** — "Mainline or SpecKit?" (or judge by scope) |
| "/specify wine rating system"       | **Feature Branch** — SpecKit explicitly invoked      |
| "Refactor the entire..."            | **Feature Branch** — scope implies SpecKit           |

**Rule for Claude** (add to constitution or CLAUDE.md during Phase H):

> **Workflow selection**: For bug fixes and changes likely under ~3 files, use
> mainline (commit to main, no SpecKit). For new features, refactors, or
> multi-file changes, suggest the SpecKit feature branch workflow. When in
> doubt, ask.

This gives Claude a guideline and Brian a veto. Either party can escalate a
mainline task to SpecKit or downgrade a feature branch to mainline at any point.

#### Our Constitution Handles This

Our wine-cellar constitution already says:

> "For larger features, use the SpecKit framework... For smaller changes, direct
> implementation is acceptable with proper testing."

This is intentionally more flexible than Bryan's framework constitution, which
says all features MUST use SpecKit. We keep our version because it correctly
reflects that **some changes don't benefit from ceremony**, and forcing SpecKit
on a one-line fix is counterproductive.

**For company adoption**: The team may want a stricter policy (e.g., "any change
touching more than 3 files uses SpecKit"). That decision can be made per-project
in each project's constitution.

---

## Part 7: Concerns and Risks

### Surface Area

We're going from 15 components to 42. That's a significant increase in framework
surface area to learn, maintain, and keep aligned with Bryan's upstream.
Mitigations:

- **Evaluate incrementally** — Use mainline for small work. Only exercise the
  full pipeline when building wine-cellar features that justify it.
- **Track what we actually use** — After a few features, audit which components
  provided value and which just added friction.
- **Don't customize yet** — Take the components as-is first. Customize only
  after we've used them enough to understand what needs to change.

### Context Overhead

More skills and commands mean more content for Claude to load. If sessions
become slow or context-heavy, use `meta-context-optimize` patterns and consider
whether some skills should be lazy-loaded via documentation rather than
always-present.

### `/implement` v3.0.0 Risk

The `/ralph` delegation pattern is untested in our environment. It may require
scripts or infrastructure we don't have yet (e.g., `ralph.sh`). If it doesn't
work out of the box, we can fall back to our v2.2.0 while we debug.

---

## References

- Previous adoption plan: `documents/bryan-framework-adoption-plan.md`
- Framework source: `_bg_framework2/` directory (temporary)
- Previous framework source: `_bg_template/` (removed after v1 install)

---

**Last Updated**: January 27, 2026
