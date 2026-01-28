---
name: meta-health-check
description:
  Use when codebase feels cluttered, CLAUDE.md has grown unwieldy, or for
  bi-weekly/monthly maintenance - comprehensive audit of Claude Code artifacts
  with cleanup recommendations
---

# Claude Health Check

## Overview

Comprehensive audit of Claude Code artifacts and maintenance state. Identifies
bloat, dead references, stale context, accumulated cruft, and organizational
issues that cause AI confusion.

**Core principle:** Clean Claude artifacts = fewer hallucinations, better AI
performance.

**Recommended cadence:** Bi-weekly or monthly (not during active feature
development).

## When to Use

- Bi-weekly/monthly scheduled maintenance
- CLAUDE.md exceeds 400 lines or feels bloated
- Before major refactoring or architecture changes
- After completing major specification work
- When AI seems confused or references non-existent files
- After extended development sessions (cruft accumulates)

**When NOT to use:** Quick bug fixes, active feature development (disrupts
flow).

## Safety Guardrails

### Protected Artifacts (Never Delete)

| File                                  | Action Allowed                            |
| ------------------------------------- | ----------------------------------------- |
| `CLAUDE.md`                           | Restructure, reduce - never delete        |
| `.claude/session-context/*.md`        | Update content - never delete core files  |
| `README.md` (any location)            | Update - never delete                     |
| `specs/**/*.md`                       | Archive to specs/archived/ - never delete |
| Config files (tsconfig, eslint, etc.) | Flag only - never suggest deletion        |

### Deletion Safety Rules

| Action                             | Risk     | Requirement                  |
| ---------------------------------- | -------- | ---------------------------- |
| Remove dead reference from docs    | Low      | Can auto-fix                 |
| Delete progress.\*.log files       | Low      | Can auto-fix                 |
| Delete verification-results/\*.txt | Low      | User confirmation (bulk)     |
| Archive spec to archived/          | Medium   | User confirmation            |
| Delete temp/ files                 | Medium   | User confirmation per file   |
| Delete any .md file                | **HIGH** | Manual verification required |

## Audit Categories

### 1. Core Artifacts (Always Check)

| Artifact        | Optimal     | Warning | Critical |
| --------------- | ----------- | ------- | -------- |
| CLAUDE.md       | < 400 lines | 400-600 | > 800    |
| Skills          | < 300 lines | 300-500 | > 500    |
| Commands        | < 150 lines | 150-250 | > 250    |
| Agents          | < 300 lines | 300-500 | > 500    |
| Individual docs | < 400 lines | 400-600 | > 600    |

### 2. Session Context Health

| Item                               | Threshold             | Action                                 |
| ---------------------------------- | --------------------- | -------------------------------------- |
| **current-work.md**                | Stale > 7 days        | Update or clear                        |
| **future-work.md**                 | > 200 lines or > 15KB | Prune old ideas, convert to specs      |
| **progress.\*.log**                | Any files present     | Delete (they serve no ongoing purpose) |
| **Proposal files**                 | > 30 days old         | Action or archive                      |
| **.atom-status, .work-state-hash** | Informational         | Check for corruption                   |

### 3. Transient File Cleanup

| Directory               | Purpose                | Threshold           | Action                     |
| ----------------------- | ---------------------- | ------------------- | -------------------------- |
| `.claude/temp/`         | Temporary analysis     | Files > 7 days old  | Promote to docs/ or delete |
| `.claude/wip/`          | Work in progress       | Files > 30 days old | Promote or delete          |
| `verification-results/` | Test output cache      | > 1MB or > 5 files  | Delete old results         |
| `specs/*/research/`     | Spec-specific research | Spec completed      | Archive with spec          |

### 4. Git & Repository Health

| Check                    | Threshold   | Why It Matters                    |
| ------------------------ | ----------- | --------------------------------- |
| Uncommitted changes      | Any         | Work loss risk, history pollution |
| Untracked .claude/ files | Any new     | Should be committed or gitignored |
| Branch ahead of origin   | > 5 commits | Push or review                    |
| Stale branches           | > 30 days   | Clean up                          |

### 5. Hook Health

| Check              | Method                   | Issue Indicator       |
| ------------------ | ------------------------ | --------------------- |
| Hook scripts exist | `ls .claude/hooks/atom/` | Missing files         |
| Scripts executable | `ls -la`                 | Missing +x permission |
| Syntax valid       | `bash -n script.sh`      | Syntax errors         |
| Timeout configured | Check settings.json      | Missing or too long   |

### 6. Research & Documentation Staleness

| Location                 | Stale After               | Action                            |
| ------------------------ | ------------------------- | --------------------------------- |
| `.claude/docs/research/` | 90 days without reference | Review for relevance              |
| `docs/product/plans/`    | Spec completed            | Archive or delete                 |
| Proposal files           | Decision made             | Archive decision, delete proposal |

### 7. Spec Hygiene

| Check                       | Issue                 | Action                    |
| --------------------------- | --------------------- | ------------------------- |
| Completed specs in `specs/` | Should be archived    | Move to `specs/archived/` |
| `specs/archived/` missing   | No archival happening | Create directory          |
| Abandoned specs             | No activity > 60 days | Mark abandoned or resume  |

## Quick Diagnostic Commands

Run these to quickly assess health:

```bash
# === CORE ARTIFACTS ===
wc -l CLAUDE.md                                    # Target: < 400
wc -l .claude/skills/*/SKILL.md | sort -n | tail -5  # Largest skills

# === SESSION CONTEXT ===
wc -l .claude/session-context/future-work.md       # Target: < 200
ls -la .claude/session-context/progress.*.log 2>/dev/null  # Should be empty
find .claude/session-context -name "*.md" -mtime +30  # Stale files

# === TRANSIENT FILES ===
du -sh .claude/temp/ .claude/wip/ 2>/dev/null      # Should be minimal
du -sh .claude/session-context/verification-results/  # Target: < 500KB
find .claude/temp -type f -mtime +7 2>/dev/null    # Old temp files

# === GIT HEALTH ===
git status --short                                 # Should be clean
git log origin/main..HEAD --oneline | wc -l        # Unpushed commits

# === HOOKS ===
for f in .claude/hooks/atom/*.sh; do bash -n "$f" && echo "✓ $f" || echo "✗ $f"; done

# === SPECS ===
ls specs/ | grep -v archived | wc -l               # Active specs count
ls specs/archived/ 2>/dev/null | wc -l             # Archived specs count
```

## Execution Pattern

### Phase 1: Quick Diagnostics (2 min)

Run the diagnostic commands above. Flag any immediate issues:

- CLAUDE.md > 600 lines → Critical
- Uncommitted changes → High
- verification-results > 1MB → Medium
- progress.\*.log files exist → Low

### Phase 2: Deep Audit (5-10 min)

```
Skill: code-search

Audit Claude Code artifacts using claude-artifacts.md checklist.

Scope:
- CLAUDE.md (size, contradictions, dead references)
- .claude/skills/ (size, overlaps, staleness)
- .claude/commands/ (size, functionality)
- .claude/agents/ (size, scoping)
- .claude/session-context/ (staleness, bloat, cruft)
- .claude/temp/ and .claude/wip/ (promotion candidates)
- .claude/hooks/ (configuration, functionality)
- specs/ (archival status)
- Git status (uncommitted work)

Collect evidence with file:line references.
```

### Phase 3: Generate Report

```markdown
# Claude Health Report - [DATE]

## Quick Stats

| Metric                    | Value | Status |
| ------------------------- | ----- | ------ |
| CLAUDE.md lines           | X     | ✓/⚠/✗  |
| Uncommitted files         | X     | ✓/⚠/✗  |
| future-work.md lines      | X     | ✓/⚠/✗  |
| verification-results size | X     | ✓/⚠/✗  |
| Progress logs             | X     | ✓/⚠/✗  |
| Temp files > 7 days       | X     | ✓/⚠/✗  |

## Issues by Severity

### Critical (Fix Now)

[List]

### High (Fix This Session)

[List]

### Medium (Fix This Week)

[List]

### Low (When Convenient)

[List]

## Recommended Actions

1. [Specific action with command]
2. [Specific action with command] ...
```

### Phase 4: Cleanup (Interactive)

Present each category for user approval:

1. **Auto-fixable (Low risk)**: Progress logs, old verification results
2. **Confirm each (Medium risk)**: Temp files, spec archival
3. **Manual review (High risk)**: Any .md deletion, doc restructuring

## Common Issues & Fixes

| Issue                        | Detection           | Fix                                                       |
| ---------------------------- | ------------------- | --------------------------------------------------------- |
| CLAUDE.md > 600 lines        | `wc -l CLAUDE.md`   | Extract to .claude/docs/, link back                       |
| future-work.md bloat         | `wc -l` > 200       | Prune old ideas, convert active to specs                  |
| Progress logs accumulating   | `ls progress.*.log` | `rm .claude/session-context/progress.*.log`               |
| verification-results bloat   | `du -sh` > 1MB      | Delete old .txt files                                     |
| Temp files lingering         | Files > 7 days      | Promote to docs/ or delete                                |
| Uncommitted changes          | `git status`        | Review and commit logically                               |
| Completed specs not archived | Check specs/        | `mkdir -p specs/archived && mv specs/XXX specs/archived/` |
| Stale current-work.md        | Modified > 7 days   | Update with actual current work                           |
| Dead file references         | Audit checklist     | Remove reference or create file                           |
| Oversized skill              | > 500 lines         | Extract to sub-skills or checklists                       |

## Severity Classification

| Severity     | Criteria                                   | Examples                                            |
| ------------ | ------------------------------------------ | --------------------------------------------------- |
| **Critical** | Affects every session OR data loss risk    | CLAUDE.md contradictions, uncommitted work > 1 week |
| **High**     | Missing references OR approaching critical | Dead links, 700-line CLAUDE.md                      |
| **Medium**   | Functional but degraded OR cleanup needed  | Bloated future-work, old temp files                 |
| **Low**      | Cosmetic OR low-impact cruft               | Progress logs, old verification results             |

## Success Criteria

After running health check:

- [ ] CLAUDE.md under 600 lines (optimal: under 400)
- [ ] Zero dead file references
- [ ] Zero contradictions in instructions
- [ ] current-work.md updated within 7 days
- [ ] future-work.md under 200 lines
- [ ] No progress.\*.log files
- [ ] verification-results under 500KB
- [ ] No temp files older than 7 days
- [ ] Git working tree clean
- [ ] All completed specs archived
- [ ] Hooks functional (pass syntax check)

## Anti-Patterns

**Don't:**

- Run during active feature development
- Auto-delete without reviewing
- Ignore Low severity forever (they accumulate)
- Skip git status check

**Do:**

- Schedule bi-weekly/monthly
- Fix Critical/High before new features
- Document exceptions with justification
- Commit cleanup work promptly
