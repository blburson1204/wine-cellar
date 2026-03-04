# Bryan's Framework v3 Adoption Plan

**Created**: February 11, 2026 **Status**: INSTALLED

## Overview

This document captures the comparison and selective adoption plan for Bryan's v3
framework (`_bgframeworkv3/`, located at `~/Documents/blb-coding/`) against our
current v2 installation (completed January 27, 2026).

### Approach: Cherry-Pick, Don't Adopt Wholesale

Unlike the v2 adoption (which installed most components for evaluation), v3
takes a **selective adoption** approach. Rationale:

1. **Noise reduction** — v3 has 45 agents, 32 commands, and 42+ skills. Most are
   tuned to Bryan's multi-tenant, multi-portal, Figma-integrated architecture.
   Installing everything adds context that can confuse skill selection and
   inflate sessions.
2. **Our innovations survive** — The skill-manifest
   (`.specify/skill-manifest.yaml`) and our `db:push` safeguards are features
   Bryan's v3 doesn't have. Wholesale adoption would overwrite our `/specify`
   and `/plan` commands that integrate the manifest.
3. **Merging updates is manageable** — We compared v2→v3 in a single session.
   Future versions can be evaluated the same way.
4. **The framework serves the project** — Not the other way around.

### What's New in v3 (Scale)

| Component          | v2 (Current) | v3  | Delta |
| ------------------ | :----------: | :-: | :---: |
| Skills             |      23      | 42+ |  +19  |
| Agents             |      6       | 45  |  +39  |
| Commands           |      13      | 32  |  +19  |
| Hooks              |      0       | 11  |  +11  |
| Docs (operational) |      0       | 11  |  +11  |
| Guides             |      0       |  7  |  +7   |
| Enforced patterns  |      0       |  7  |  +7   |

---

## Part 1: Constitution Updates

Three additions from v3's constitution worth adopting. These don't change our
existing principles — they fill gaps.

### 1. Add `/clarify` to SpecKit Workflow Listing

Our constitution lists the SpecKit workflow as `/specify` → `/plan` → `/tasks` →
`/implement`. We already have and use `/clarify`, but it's not in the workflow
listing. v3 includes it as step 2.

**Change**: Update the SpecKit Workflow section to include `/clarify`:

```
1. `/specify [name]` - Create specification with requirements
2. `/clarify [name]` - Clarify requirements through questioning
3. `/plan` - Create implementation plan
4. `/tasks` - Generate task list with verification gates
5. `/implement` - Execute tasks with verification
```

### 2. Add "Manual SpecKit Artifact Creation Forbidden" Rule

v3 explicitly states: "Manual creation of plan.md, tasks.json, or other SpecKit
artifacts is FORBIDDEN." This prevents bypassing the pipeline by hand-crafting
artifacts that skip validation gates.

**Change**: Add to the SpecKit Workflow section:

```
Manual creation of plan.md, tasks.json, or other SpecKit artifacts is
forbidden — always use the pipeline commands to ensure validation gates
are applied.
```

### 3. Add Spec Reference to Commit Rules

v3 includes "Reference specification number if applicable" in commit rules.
Simple traceability we're missing.

**Change**: Add to Commit Rules:

```
5. Reference specification number in commit message if applicable
```

---

## Part 2: What We're Adopting

### Tier 1: Hooks (Highest Priority — We Have None)

Hooks are the most transferable v3 capability. They're project-agnostic
infrastructure that solves real problems we've encountered.

#### ATOM Hooks (Context & Verification Integrity)

| Hook                     | Event           | Blocks? | Purpose                                                             | Why Adopt                                                     |
| ------------------------ | --------------- | ------- | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| `pre-edit-verify.sh`     | PreToolUse:Edit | Yes     | Checks `old_string` exists in current file before Edit              | Prevents stale-file edits — a silent failure we've likely hit |
| `precompact.sh`          | PreCompact      | No      | Snapshots `spec:{id}\|task:{id}\|time:{HH:MM}` before compaction    | Context preservation on long sessions                         |
| `session-start.sh`       | SessionStart    | No      | Restores compaction snapshot + cleans old task files                | Pairs with precompact.sh for seamless recovery                |
| `record-verification.sh` | Stop            | Yes     | Blocks session end if T-VERIFY gates lack fresh evidence (< 30 min) | Enforces "evidence before claims" at infrastructure level     |

#### Safety Hooks

| Hook                           | Event            | Blocks? | Purpose                                    | Adaptation Needed                                                                                                                                        |
| ------------------------------ | ---------------- | ------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `forbidden-command-blocker.sh` | PreToolUse:Bash  | Yes     | Hard-blocks dangerous commands             | **Adapt**: Keep our `db:push` safeguard (backup + confirm), adopt `git reset --hard` and force-push blockers. Remove `docker build` rule (not relevant). |
| `file-placement-guard.sh`      | PreToolUse:Write | Yes     | Prevents `.sh`, `.sql`, `.py` in repo root | Adopt as-is — good hygiene                                                                                                                               |

#### Hook Registration

| File            | Purpose                                                         | Adaptation Needed                                                                                                           |
| --------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `settings.json` | Registers all hooks with matchers, timeouts, fail-open behavior | **Create**: We don't have this yet. Build from v3's structure, registering only the hooks we adopt. Skip Agent Teams hooks. |

#### Hooks NOT Adopting Now

| Hook                           | Category    | Why Skip                                                                                      |
| ------------------------------ | ----------- | --------------------------------------------------------------------------------------------- |
| `task-completed-gate.sh`       | Agent Teams | Only relevant with parallel teammate execution                                                |
| `task-completed-evidence.sh`   | Agent Teams | Only relevant with parallel teammate execution                                                |
| `teammate-idle-check.sh`       | Agent Teams | Only relevant with parallel teammate execution                                                |
| `statusline-command.sh`        | Display     | Nice-to-have; low priority. Bryan-specific paths hardcoded.                                   |
| `post-tasks-reconciliation.sh` | SpecKit     | References commands we don't have (`/ui-preflight`, `/schema-for-ui`, `/reconcile-artifacts`) |

---

### Tier 2: Concepts to Study and Adapt

These aren't direct file copies — they're patterns worth building our own
versions of, informed by Bryan's implementations.

**Discoverability**: To ensure these aren't forgotten, add trigger keywords to
the skill-manifest so they surface during `/specify` or `/plan` when relevant
specs appear. Also add this plan to the `meta-health-check` review checklist so
Tier 2/3 items are revisited during periodic maintenance.

#### Preflight System (5 Agents)

Bryan has 5 preflight agents that catch spec-vs-code drift before implementation
starts:

| Agent                        | What It Does                                             |
| ---------------------------- | -------------------------------------------------------- |
| `preflight-schema-drift`     | Verifies table/column names in specs match DB schema     |
| `preflight-interface`        | Verifies class/method references match actual signatures |
| `preflight-dependency-chain` | Verifies infrastructure changes have test coverage       |
| `preflight-enum-values`      | Verifies enum/status values match codebase definitions   |
| `preflight-readability`      | Verifies acceptance test outputs are unambiguous         |

**Action**: Don't adopt all 5. Build 1-2 relevant to our stack:

- `preflight-schema-drift` adapted for our Prisma schema (most valuable)
- `preflight-interface` could catch spec references to non-existent code

**When**: Next time a SpecKit implementation hits a spec-vs-code mismatch.

#### Code Review Orchestrator Pattern

Bryan's `code-review-orchestrator` launches `code-quality-reviewer` and
`security-audit` in parallel, then merges reports.

**Action**: Study the parallel dispatch + merge pattern. Consider adapting our
`code-reviewer` agent to use this approach.

**When**: When we want to add security review as a parallel step to code review.

#### Full-Stack Tracer

Traces data flow from React → API → service → ORM. Verifies types, auth, and
isolation at each boundary.

**Action**: Bookmark for when Wine Cellar has authentication and the API layer
grows beyond simple CRUD.

**When**: After auth/user feature is implemented.

#### Evidence System v2 (NDJSON)

Structured per-task evidence files (`specs/{NNN}/evidence/{task-id}.ndjson`)
with append-only verdict history.

**Action**: Study the schema. The `record-verification.sh` hook we're adopting
depends on this format for freshness checks.

**When**: Alongside the hook adoption (Tier 1).

#### Compliance Auditor (Adapted for Our Constitution)

Bryan's `compliance-auditor` audits code against his constitutional principles
(API versioning, portal boundaries, design tokens). The _concept_ is valuable —
we'd rewrite it to audit against our constitution: TDD enforcement, verification
evidence, quality gate compliance, Zod validation on API endpoints, AppError
usage.

**Action**: Study Bryan's agent structure. Build our own version that checks:

- API endpoints use Zod schemas for validation
- Error handling uses AppError classes
- New components have corresponding test files
- Quality gates (type-check, lint, format, test) all pass

**When**: After hooks are stable and we want automated constitutional
enforcement.

---

### Tier 3: Bookmark for Future

These are relevant to Wine Cellar's growth trajectory but not needed now.

| Component                                                 | Type          | Relevance                                         | When                                                           |
| --------------------------------------------------------- | ------------- | ------------------------------------------------- | -------------------------------------------------------------- |
| Agent Teams (implement-orchestrator + implement-teammate) | Agents        | Parallel task execution for large specs           | When specs reach 20+ tasks regularly                           |
| Tenant isolation (PAT-005)                                | Pattern       | User-scoped wine collections                      | Auth/users feature                                             |
| Auth middleware (PAT-006)                                 | Pattern       | JWT verification, route protection                | Auth/users feature                                             |
| RBAC skill + rbac-checker agent                           | Skill + Agent | Permission matrix validation                      | Auth/authorization feature (if admin roles needed)             |
| `db-advisor` agent                                        | Agent         | PostgreSQL RDS performance, EXPLAIN, index design | AWS deployment (when migrating to RDS)                         |
| `security-audit` agent                                    | Agent         | Pre-commit OWASP Top 10, auth, authz validation   | Security audit project (adapt grep patterns to our stack)      |
| `defense-depth-checker` agent                             | Agent         | Four-layer data flow validation                   | Auth feature + security audits                                 |
| Pattern registry                                          | Skill + Doc   | Grep-detectable architectural patterns            | When Wine Cellar has conventions worth enforcing automatically |
| Portal architecture (PAT-003)                             | Pattern       | Route group separation                            | Evaluate for company projects, not Wine Cellar                 |
| acceptance-tester agent                                   | Agent         | SQL + Playwright acceptance tests                 | When E2E testing is added                                      |
| react-reviewer agent                                      | Agent         | 57 React/Next.js rules                            | When frontend grows in complexity                              |

---

## Part 3: What We're NOT Adopting

### Commands We Already Have (Preserve Ours)

| Command    | Our Version | v3 Version | Why Keep Ours                                                              |
| ---------- | :---------: | :--------: | -------------------------------------------------------------------------- |
| `/specify` |    1.1.0    |   1.2.0    | **Ours has skill-manifest check (Step 6)** — v3 doesn't                    |
| `/plan`    |    1.3.0    |   1.5.0    | **Ours has manifest-driven skill lookup** — v3 has weaker manual checklist |

v3 adds `context: fork`, `allowed-tools`, and hooks in command frontmatter.
These are structural improvements we can evaluate independently without losing
our skill-manifest integration.

**Note on v3 `/plan` clarification gate**: v3 makes `/clarify` mandatory for ALL
spec types (not just `feature-major`). This is stricter than ours. Consider
adopting this policy change separately if desired.

### Bryan-Project-Specific Components (Skip)

| Component                  | Type     | Why Skip                                                                                        |
| -------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `design-auditor`           | Agent    | Checks Bryan's design system tokens                                                             |
| `figma-sync-orchestrator`  | Agent    | 11-phase Figma pipeline (no overlap with Lovable — Figma syncs designs, Lovable generates code) |
| `api-contract-checker`     | Agent    | API versioning (we don't version)                                                               |
| `doc-gate-analyst`         | Agent    | Bryan's doc classification system                                                               |
| `doc-impact-analyzer`      | Agent    | Bryan's doc impact pipeline                                                                     |
| `doc-file-editor`          | Agent    | Bryan's doc editing pipeline                                                                    |
| Portal-related patterns    | Patterns | PAT-003, PAT-006, PAT-007                                                                       |
| `claude/guides/` (7 files) | Guides   | Portal architecture, feature access control, etc.                                               |
| `claude/docs/` (11 files)  | Docs     | ATOM details, frontmatter reference, etc. (adopt selectively with hooks)                        |
| 19 new commands            | Commands | Most reference infrastructure we don't have                                                     |
| 19 new skills              | Skills   | Most are Bryan-project-specific                                                                 |

---

## Part 4: Installation Steps

### Phase A: Create Hook Infrastructure

```bash
# Create hooks directory structure
mkdir -p .claude/hooks/atom
mkdir -p .claude/hooks/safety
```

### Phase B: Update Constitution

Apply the three changes from Part 1 to `.specify/memory/constitution.md`:

1. Add `/clarify` as step 2 in the SpecKit Workflow listing
2. Add "manual artifact creation forbidden" note to the SpecKit Workflow section
3. Add "reference specification number" as commit rule #5

Also update CLAUDE.md if the SpecKit workflow is listed there.

### Phase C: Install ATOM Hooks

Copy and adapt from `~/Documents/blb-coding/_bgframeworkv3/claude/hooks/atom/`:

| Source File              | Target                | Adaptation                                                |
| ------------------------ | --------------------- | --------------------------------------------------------- |
| `pre-edit-verify.sh`     | `.claude/hooks/atom/` | None — works as-is                                        |
| `precompact.sh`          | `.claude/hooks/atom/` | Update task output path from Bryan's project to ours      |
| `session-start.sh`       | `.claude/hooks/atom/` | Update task cleanup path; remove Bryan-specific directory |
| `record-verification.sh` | `.claude/hooks/atom/` | Verify evidence file paths match our spec structure       |

### Phase D: Install Safety Hooks

| Source File                    | Target                  | Adaptation                                                                                                                                                                                                                                                                               |
| ------------------------------ | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `forbidden-command-blocker.sh` | `.claude/hooks/safety/` | Remove `docker build` rule (FR-002). Keep `git reset --hard` (FR-004) and force-push (FR-003). **Replace** `db:push` hard-block (FR-001) with a reference to our existing backup-and-confirm workflow, or leave it as a hard-block that tells the user to use our safe `db:push` script. |
| `file-placement-guard.sh`      | `.claude/hooks/safety/` | Adopt as-is                                                                                                                                                                                                                                                                              |

### Phase E: Create settings.json

Create `.claude/settings.json` (or merge into `.claude/settings.local.json` if
it exists) with hook registration for the 6 hooks we're adopting:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/atom/pre-edit-verify.sh",
            "timeout": 3000
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/safety/forbidden-command-blocker.sh",
            "timeout": 3000
          }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/safety/file-placement-guard.sh",
            "timeout": 3000
          }
        ]
      }
    ],
    "PreCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/atom/precompact.sh",
            "timeout": 2000
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/atom/session-start.sh",
            "timeout": 2000
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/atom/record-verification.sh",
            "timeout": 5000
          }
        ]
      }
    ]
  }
}
```

### Phase F: Create Evidence Directory Convention

The `record-verification.sh` hook checks for NDJSON evidence files. Ensure our
SpecKit specs support this:

```bash
# Evidence files live alongside specs
# specs/{NNN}-{name}/evidence/{task-id}.ndjson
# This directory gets created during /implement execution
```

### Phase G: Install Supporting Docs (Selective)

From `_bgframeworkv3/claude/docs/`, adopt only what the hooks reference:

| Doc                      | Purpose                            | Needed By                        |
| ------------------------ | ---------------------------------- | -------------------------------- |
| `atom.md`                | ATOM framework overview            | Understanding hook system        |
| `atom-gate-execution.md` | How gates work                     | record-verification.sh           |
| `context-management.md`  | Token budgets, checkpoint workflow | precompact.sh / session-start.sh |

### Phase H: Test Hook Installation

After installation, verify each hook works:

1. **pre-edit-verify.sh**: Try editing a file with an intentionally wrong
   `old_string` — should be blocked
2. **forbidden-command-blocker.sh**: Try `git reset --hard` — should be blocked
3. **file-placement-guard.sh**: Try creating a `.sh` file in repo root — should
   be blocked
4. **precompact.sh**: Trigger a compaction (long session) — should create
   snapshot file
5. **session-start.sh**: Start new session after compaction — should restore
   context
6. **record-verification.sh**: Try ending session without verification evidence
   — should block (only during active specs)

### Phase I: Update Skill Manifest

Add entries to `.specify/skill-manifest.yaml` for Tier 2/3 discoverability:

1. **Tier 2 trigger keywords** — Add a comment block or advisory entries so that
   specs mentioning "deployment", "server migration", "AWS", "RDS",
   "authentication", "authorization", "security audit", or "compliance" surface
   this adoption plan for review.
2. **Review this plan** — Add a note to the `meta-health-check` skill to include
   `documents/bryan-framework-v3-adoption-plan.md` Tier 2/3 items in periodic
   maintenance reviews.

### Phase J: Update CLAUDE.md

Add hooks section to CLAUDE.md documenting:

- What hooks are active and what they do
- How to bypass if needed (they're fail-open by design)
- Reference to `.claude/settings.json` for configuration

### Phase K: Clean Up

After successful installation and verification:

- Keep `_bgframeworkv3/` at `~/Documents/blb-coding/` for reference
- Do NOT delete — useful for future Tier 2/3 adoptions and next version
  comparison

---

## Part 5: Preserving Our Innovations

These are Wine Cellar-specific features that v3 doesn't have. They must be
preserved during and after adoption.

| Innovation                   | Location                                 | What It Does                                                     | v3 Equivalent                                 |
| ---------------------------- | ---------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------- |
| Skill manifest               | `.specify/skill-manifest.yaml`           | Data-driven skill discovery based on spec frontmatter + keywords | None (v3 `/plan` has weaker manual checklist) |
| Skill manifest in `/specify` | `.claude/commands/specify.md` Step 6     | Logs matched skills during spec creation                         | None                                          |
| Skill manifest in `/plan`    | `.claude/commands/plan.md` Pre-Execution | Matches skills and consults them during planning                 | Manual checklist (inferior)                   |
| Safe `db:push`               | Custom script                            | Backup tables, confirm before destructive changes                | Hard block only (no safe path)                |
| Skill log                    | `specs/{NNN}/skill-log.md`               | Audit trail of which skills were matched per phase               | None                                          |

---

## Part 6: Future Considerations

### Upcoming Projects and v3 Component Alignment

Based on the future-work.md roadmap, the next three major projects are AWS
deployment, authentication/authorization, and security audits. Here's how v3
components map to each:

#### AWS Deployment (Server Migration)

| v3 Component                   | How It Helps                                                                                          | Adaptation                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `db-advisor` agent             | RDS performance review, slow query analysis, index design, EXPLAIN interpretation                     | Adapt from Bryan's multi-tenant RDS context to our simpler single-DB setup |
| `forbidden-command-blocker.sh` | May need new rules for production-dangerous commands (e.g., blocking `db:push` against production DB) | Add production environment detection                                       |
| `security-audit` agent         | Pre-deployment security validation                                                                    | Adapt grep patterns from Bryan's stack to ours                             |

#### Authentication & Authorization

| v3 Component                      | How It Helps                                                            | Adaptation                                                                                                  |
| --------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Tenant isolation (PAT-005)        | User-scoped wine collections via `userId` FK                            | Simpler than Bryan's `customerId` + `TENANT_SCOPED_MODELS` — we just need a user FK and row-level filtering |
| Auth middleware (PAT-006)         | JWT verification, `authenticateJWT` middleware, algorithm whitelist     | Adapt for our Express routes; good pattern to follow                                                        |
| `defense-depth-checker` agent     | Validates four-layer data flow protection (entry, business, env, debug) | Directly applicable once we have auth middleware                                                            |
| `full-stack-tracer` agent         | Traces auth chain through all layers                                    | Useful for verifying auth is enforced end-to-end                                                            |
| RBAC skill + `rbac-checker` agent | Permission matrix validation                                            | Only if we add admin roles; skip if all users are equal                                                     |

#### Security Audits

| v3 Component                         | How It Helps                                 | Adaptation                                           |
| ------------------------------------ | -------------------------------------------- | ---------------------------------------------------- |
| `security-audit` agent               | OWASP Top 10 checks, P1/P2 blocking findings | Rewrite grep patterns for our Express + Prisma stack |
| `compliance-auditor` agent (adapted) | Constitutional compliance enforcement        | Rewrite to audit our constitution (see Tier 2)       |
| `defense-depth-checker` agent        | Multi-layer validation verification          | Directly applicable                                  |
| `code-review-orchestrator` pattern   | Parallel security + quality review           | Adapt for our code-reviewer agent                    |

### Integration Roadmap (Not from Bryan's Framework)

These are planned integrations that Bryan's framework doesn't address:

| Integration   | Approach                                                                                    | Status                                        |
| ------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **Jira CLI**  | Direct CLI (`jira-cli`) or MCP server for ticket management                                 | Notes from previous session — spec when ready |
| **Slack CLI** | Webhooks or Slack API for notifications                                                     | Notes from previous session — spec when ready |
| **Lovable**   | AI code generation tool (not a design tool like Figma — no overlap with Bryan's figma-sync) | Notes from previous session — spec when ready |

### Company Evaluation

Components worth evaluating separately for company projects:

- Portal architecture (PAT-003) — if the company app has admin/user separation
- Pattern registry — if architectural conventions need automated enforcement
- Full Agent Teams pipeline — for larger team projects with parallel workstreams
- Lovable integration — company uses Lovable for prototyping

### Framework Update Strategy

When Bryan releases v4:

1. Place in `_bgframeworkv4/` at `~/Documents/blb-coding/`
2. Run the same comparison process (Explore agents on both versions)
3. Evaluate the delta against current state
4. Cherry-pick valuable additions
5. Verify our innovations (skill-manifest, safe db:push) aren't overwritten

---

## References

- Previous adoption plans:
  - `documents/bryan-framework-adoption-plan.md` (v1)
  - `documents/bryan-framework-v2-adoption-plan.md` (v2)
- Framework source: `~/Documents/blb-coding/_bgframeworkv3/` (external, not in
  wine-cellar repo)
- Skill manifest: `.specify/skill-manifest.yaml`
- Comparison session: February 11, 2026

---

**Last Updated**: February 11, 2026
