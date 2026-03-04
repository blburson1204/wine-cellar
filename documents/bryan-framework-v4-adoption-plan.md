# Bryan's Framework v4 Adoption Plan

**Created**: March 4, 2026 **Updated**: March 4, 2026 **Status**: INSTALLED
(Tier 1 complete, Tier 2 selective adoption complete, Tier 3 evaluated with
triggers)

## Overview

This document captures the comparison and selective adoption plan for Bryan's v4
framework (`_bgframeworkv4/`, located at `~/Documents/blb-coding/`) against our
current installation (v1-v3 adopted through January-February 2026).

### Approach: Same Cherry-Pick Philosophy as v3

We continue the selective adoption approach established in v3. Bryan's framework
has grown further (52 agents, 48 commands, 54 skills), and much of it remains
tuned to his multi-tenant, Docker-deployed, Figma-integrated architecture. We
adopt what adds clear value to Wine Cellar.

### What's New in v4 (Scale)

| Component          | Current (v3) | v4  | Delta |
| ------------------ | :----------: | :-: | :---: |
| Skills             |      29      | 54  |  +25  |
| Agents             |      6       | 52  |  +46  |
| Commands           |      13      | 48  |  +35  |
| Hooks              |      6       | 14  |  +8   |
| Docs (operational) |      ~8      | 12  |  +4   |
| Guides             |      0       |  8  |  +8   |

### Key v4 Themes

1. **Agent Teams** — Parallel task execution via implement-orchestrator +
   implement-teammate agents. Up to 4 concurrent workers for independent tasks.
2. **Docker Workflow** — 13 Docker-specific commands for full container
   lifecycle (dev, test, validate, deploy).
3. **Dual-Path Implementation** — `/implement` auto-selects parallel (Agent
   Teams) or sequential (ralph.sh) based on task dependencies.
4. **Extended Preflight** — 5 specialized agents for pre-implementation
   validation (schema drift, interfaces, dependencies, enums, readability).
5. **AWS/Infrastructure** — New skills for AWS CDK, serverless, EDA patterns.
6. **Hook Reorganization** — Hooks now organized into subdirectories (atom/,
   safety/, speckit/, agent-teams/, statusline/, lib/).
7. **New Agent Patterns** — Single-purpose principle enforced with
   orchestrator + specialist split. Frontmatter-based configuration (model,
   tools, permissions, skills preloading).

---

## Part 1: What We Already Have (No Action Needed)

These v4 components match what we already have installed. No changes needed
unless noted.

| Component                                                                    | Our Version | v4 Version        | Notes                                                    |
| ---------------------------------------------------------------------------- | ----------- | ----------------- | -------------------------------------------------------- |
| ATOM hooks (pre-edit-verify, precompact, session-start, record-verification) | v3          | v4 (minor tweaks) | Review for bug fixes only                                |
| Safety hooks (forbidden-command-blocker, file-placement-guard)               | v3          | v4                | Same functionality                                       |
| Core SpecKit commands (/specify, /clarify, /plan, /tasks, /implement)        | v2-v3       | v4                | Our versions have skill-manifest integration — keep ours |
| Session commands (/checkpoint, /resume-spec, /session-note, /handoff)        | v3          | v4                | Same functionality                                       |
| Core skills (test-tdd, debug-systematic, debug-rca, etc.)                    | v2-v3       | v4                | Review for improvements                                  |
| Core agents (code-reviewer, test-analyzer, auto-fixer, etc.)                 | v2-v3       | v4                | Review for improvements                                  |
| Constitution principles                                                      | v3          | v4                | Same 5 principles                                        |

---

## Part 2: Tier 1 — Adopt (High Value, Low Risk)

Components that add clear value to Wine Cellar with minimal adoption cost.

### 2.1 Hook Subdirectory Organization

**What**: Reorganize our flat `.claude/hooks/` into subdirectories matching v4's
structure.

**Current**: All 6 hook scripts in `.claude/hooks/` root.

**Proposed**:

```
.claude/hooks/
├── atom/           # pre-edit-verify.sh, precompact.sh, session-start.sh, record-verification.sh
├── safety/         # forbidden-command-blocker.sh, file-placement-guard.sh
└── lib/            # Shared helper functions (if any)
```

**Why**: Better organization as hooks grow. Low risk — just move files and
update paths in settings.json.

**Risk**: None. Just path changes.

### 2.2 Agent Frontmatter Configuration

**What**: v4 agents use YAML frontmatter for model selection, tool restrictions,
permission mode, and skill preloading.

**Example**:

```yaml
---
name: code-reviewer
description: Reviews code for quality, security, and requirements compliance
model: sonnet
tools: Read, Grep, Glob, Bash
permissionMode: default
skills: security-review, code-review
---
```

**Why**: More precise agent configuration. Model selection prevents expensive
Opus usage for simple agents. Tool restrictions prevent agents from making
unintended changes.

**Action**: Add frontmatter to our 6 existing agents. No new agents needed.

### 2.3 `test-guide` Skill (with sub-skills)

**What**: Comprehensive testing guidance organized as:

- `test-guide/` — Main testing strategy
- `test-guide/testing-backend` — API/Express testing patterns
- `test-guide/testing-frontend` — React/Next.js testing patterns
- `test-guide/testing-anti-patterns` — Common mistakes to avoid

**Why**: We have a `testing` skill already, but v4's version is more structured
and split by concern. The anti-patterns guide is particularly valuable for
maintaining our 604-test suite.

**Action**: Replace our `testing` skill with v4's `test-guide` structure,
adapted for our Vitest + React Testing Library + Supertest stack.

### 2.4 `react-best-practices` Skill

**What**: React-specific patterns covering hooks, memo, context, error
boundaries, and Next.js patterns.

**Why**: Our web app is React 18 + Next.js 15. This fills a gap — we have
`ui-design` and `ui-accessibility` but nothing React-specific.

**Action**: Copy and adapt for our stack (remove any patterns for libraries we
don't use).

### 2.5 `post-tasks-reconciliation` Hook

**What**: Fires after `/tasks` writes tasks.json. Triggers artifact
reconciliation to ensure spec, plan, and tasks stay in sync.

**Why**: We've occasionally had drift between spec and tasks. This automates the
consistency check.

**Action**: Copy hook, add to settings.json under PostToolUse:Write.

### 2.6 `/archive-spec` Command

**What**: Archives completed specs to a `specs/archive/` directory with a
completion summary.

**Why**: We accumulate spec artifacts in `specs/` over time. This keeps the
active directory clean.

**Action**: Copy and adapt command.

### 2.7 Writing Improvements to Existing Skills

**What**: v4 has refinements to skills we already have. Worth diffing and
cherry-picking improvements to:

- `code-search` — May have new checklists or improved drill-down patterns
- `security-review` — May have updated OWASP patterns
- `workflow-verify-complete` — May have tighter evidence requirements
- `db-prisma` — May have new surgical fix patterns

**Action**: Diff each skill against our version, cherry-pick improvements.

---

## Part 3: Tier 2 — Study and Adapt (Medium Value, Needs Customization)

Worth understanding but requires significant adaptation for Wine Cellar.

### 3.1 Agent Teams (Parallel Task Execution) — DEFERRED

**What**: `implement-orchestrator` analyzes task dependencies, spawns up to 4
concurrent `implement-teammate` agents for independent task clusters. Includes
lifecycle hooks (task-completed-gate.sh, teammate-idle-check.sh).

**Decision**: Deferred for future company projects. Wine Cellar features are
typically 3-8 tasks — Ralph sequential loop works well at this scale. Will
revisit when starting company projects that need parallel execution.

### 3.2 Extended Preflight Agents — ADOPTED (2 of 5)

**What**: Five specialized agents run before implementation.

**Adopted**:

1. `preflight-schema-drift` — Validates spec artifact references against Prisma
   schema (`packages/database/prisma/schema.prisma`)
2. `preflight-interface` — Validates spec artifact references against actual
   code signatures in `apps/api/src/`, `apps/web/src/`, `packages/`

**Skipped**: preflight-dependency-chain, preflight-enum-values,
preflight-readability (less critical for our codebase size).

**Installed**: `.claude/agents/preflight-schema-drift.md`,
`.claude/agents/preflight-interface.md`

### 3.3 `composition-patterns` Skill — DEFERRED

**Decision**: Deferred. Our current component complexity doesn't demand compound
component or slot patterns yet. Revisit when building more complex UI.

### 3.4 `pattern-registry` Concept — ADOPTED (Lightweight)

**Decision**: Adopted as a lightweight patterns document instead of v4's full
command infrastructure. Created `documents/patterns.md` with 5 established Wine
Cellar patterns (Zod schemas, AppError classes, Winston logger, optimistic
updates, Prisma via packages/database). No `/pattern-check` commands — just a
reference doc to consult before implementing new features.

**Installed**: `documents/patterns.md`

### 3.5 `writing-clearly` Skill — ADOPTED

**Decision**: Adopted. Applies Strunk's Elements of Style rules and eliminates
AI anti-patterns from all prose output. Valuable for documentation quality and
will carry over to company projects. Includes reference files for grammar,
composition, formatting, and word choice.

**Installed**: `.claude/skills/writing-clearly/` (SKILL.md +
signs-of-ai-writing.md

- 4 elements-of-style reference files)

---

## Part 4: Tier 3 — Adopt When Triggered

Components not needed today but evaluated in detail (March 2026) for upcoming
work. Organized by adoption priority when their trigger fires.

### 4.1 Promote When AWS Deployment Starts

These three items become relevant when Wine Cellar moves off localhost. The
recommended adoption order depends on which deployment path we choose (see
decision point below).

**Docker Expert Skill** — Adopt first, low effort

- **Source**: `_bgframeworkv4/claude/skills/docker-expert/SKILL.md` (~220 lines)
- **What**: Generic Dockerfile best practices — multi-stage builds, layer
  caching, monorepo build context, `.dockerignore` gotchas, two-compose-file
  pattern (`docker-compose.dev.yml` for hot reload vs `docker-compose.local.yml`
  for built image testing).
- **Action**: Copy and adapt. Useful regardless of deployment target (Railway
  deploys from Docker images too).
- **Skip**: The 13 Docker _commands_ (`docker-dev`, `docker-build`,
  `docker-push`, `docker-deploy-staging`, etc.). They're thin wrappers around
  shell scripts tuned for Bryan's ECS/ECR pipeline. We'll build our own deploy
  scripts as needed.

**AWS Expert Skill (as template)** — Adopt second, medium effort

- **Source**: `_bgframeworkv4/claude/skills/aws-expert/SKILL.md` (~400 lines)
- **What**: Project-specific AWS runbook covering ECS Fargate, RDS PostgreSQL,
  ECR, Secrets Manager, SSM Parameter Store, EventBridge, CloudWatch, and S3.
  Includes copy-paste CLI commands for common operations and troubleshooting
  runbooks for failed jobs, unhealthy services, and cost optimization.
- **Caveat**: Hardcoded to Bryan's project names throughout. Needs full
  adaptation with Wine Cellar names, but the _structure_ is exactly what we need
  as an operational playbook.
- **Action**: Adapt as we build out infrastructure. Skip if we go Vercel +
  Railway path.

**AWS CDK Development Skill** — Adopt third, low effort

- **Source**: `_bgframeworkv4/claude/skills/aws-cdk-development/SKILL.md` (~256
  lines + references)
- **What**: Generic CDK guidance — resource naming conventions (let
  CloudFormation generate names), Lambda bundling with `NodejsFunction`,
  multi-layer validation (`cdk-nag` + `validate-stack.sh`), development
  workflow.
- **Action**: Adoptable as-is if we choose CDK for infrastructure-as-code. Skip
  if we go Vercel + Railway path.

> **Decision point**: Our `aws-deployment-plan.md` presents two paths: full AWS
> ($50-110/mo) vs Vercel + Railway ($0-5/mo). The AWS Expert and CDK skills are
> oriented toward the full AWS path. If we go Vercel + Railway, only the Docker
> Expert skill is needed. Decide the deployment path before investing adaptation
> effort into AWS skills.

### 4.2 Promote When Figma Make Work Starts (MedGeo)

Four v4 components map directly to the phases in our
`figma-make-integration-draft.md`. These should be adopted into the MedGeo
project, not Wine Cellar.

**Figma Sync Orchestrator (Agent)** — High effort to adapt

- **Source**: `_bgframeworkv4/claude/agents/figma-sync-orchestrator.md` (~480
  lines)
- **What**: 11-phase pipeline: pre-flight → mapping reconciliation → diff
  detection → change categorization → local divergence detection → file sync →
  capability analysis → post-sync validation → spec generation → mapping update
  → SpecKit pipeline. Protects locally-diverged files by defaulting to SKIP.
- **Maps to**: Draft Plan Phase 2 (Sync Pipeline)
- **Requires**: `configs/figma-mapping.json`, a Figma Make GitHub export repo,
  and a `figma-ui/` component directory structure.

**UI Figma Integrate (Skill)** — Medium effort to adapt

- **Source**: `_bgframeworkv4/claude/skills/ui-figma-integrate/SKILL.md` (~280
  lines)
- **What**: Post-sync implementation cleanup — fixes versioned package imports,
  `figma:asset/` references, adds `'use client'` directives, wires navigation
  handlers, fixes responsive layout issues (overflow, scroll blocking, grids).
  Includes visual comparison workflow.
- **Maps to**: Draft Plan Phase 2 (Sync Pipeline)
- **Note**: Useful even outside the full orchestration pipeline, whenever
  pulling in Figma-generated components.

**Design Auditor (Agent)** — Low-medium effort to adapt

- **Source**: `_bgframeworkv4/claude/agents/design-auditor.md` (~179 lines)
- **What**: Scans for design system violations at four priority levels: P1 raw
  hex colors, P2 arbitrary Tailwind values, P3 missing component library
  imports, P4 custom layouts bypassing the design shell. Outputs compliance
  score and merge readiness verdict.
- **Maps to**: Draft Plan Phase 3 (Design System Compliance)

**UI Figma Sync (Skill)** — Used by the orchestrator

- **Source**: `_bgframeworkv4/claude/skills/ui-figma-sync/SKILL.md` (~204 lines)
- **What**: Diff detection and spec generation logic. Predates the orchestrator
  agent, now referenced by it. Handles GitHub API commands for fetching commits,
  change categorization, and prioritization by lines changed.

The draft plan's "Coordinate with Bryan on accessing v3 framework source" step
is already solved — we have v4 source locally at `~/_bgframeworkv4/`.

### 4.3 Promote When Feature Triggers Fire

**Security RBAC Skill** — Adopt when auth feature starts

- **Source**: `_bgframeworkv4/claude/skills/security-rbac/SKILL.md` (~117 lines)
- **Trigger**: Authentication & Authorization backlog item in TODO.md
- **What**: Validates RBAC completeness during spec/planning. Blocks specs with
  vague access language, requires `resource.action` permission format, enforces
  dual-layer auth (API middleware + UI wrappers), requires data scoping
  strategy.
- **Action**: Adoptable as-is. Low effort.

**Design System + Design Auditor** — Adopt when UI component library formalized

- **Source**: `_bgframeworkv4/claude/skills/ui-design-system/SKILL.md` (~176
  lines) + `design-auditor` agent (above)
- **Trigger**: Formalizing a component library (e.g., adopting shadcn/ui)
- **What**: Proactive prevention of design system violations before code is
  written. Enforces design tokens over raw values, component library over custom
  elements, standard Tailwind scale over arbitrary values.
- **Action**: Medium effort. Needs a defined component library to enforce
  against.

### 4.4 Keep Bookmarked (No Promotion Planned)

| Component                  | Why                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `prod-data-sampler`        | Requires AWS SSM tunnel and materialized views — too project-specific. FK-ordering pattern is interesting but not needed. |
| `aws-serverless-eda`       | Wine Cellar doesn't need EventBridge/SQS/Lambda. Revisit only if we go serverless instead of containers.                  |
| `db-expert`                | We use Prisma exclusively; `db-prisma` covers our needs.                                                                  |
| `promote-fix-promote`      | CI/CD promotion pattern — revisit if we adopt staged environments.                                                        |
| Meta-creation skills       | We're consumers of the framework, not authors.                                                                            |
| `/generate-framework` cmds | Bryan-specific. Never adopting.                                                                                           |

---

## Part 5: NOT Adopting

Components specific to Bryan's architecture with no Wine Cellar relevance.

- **Portal architecture** — Three-portal system (admin, provider, member)
- **Figma sync orchestration** — Covered in Tier 3 (§4.2) for MedGeo adoption
- **Multi-tenant patterns** — Tenant isolation, RBAC roles
- **API versioning commands** — We have a single internal API
- **Deployment orchestrator** — AWS ECS/ECR deployment pipeline
- **Diagnose jobs executor** — Background job diagnostics
- **Spec coordination** — Multi-team spec management
- **Test users / test accounts** — Bryan's specific test data

---

## Part 6: Preserving Wine Cellar Innovations

As with v3, these Wine Cellar-specific features must survive adoption:

1. **Skill manifest** (`.specify/skill-manifest.yaml`) — Our `/specify` and
   `/plan` commands integrate skill matching. Bryan's v4 doesn't have this.
2. **Safe `db:push` workflow** — `forbidden-command-blocker.sh` blocks raw
   `npx prisma db push` in favor of our `npm run db:push` with backup.
3. **Custom `/specify` and `/plan`** — Our versions have skill-manifest
   integration and Wine Cellar-specific templates.
4. **T-FINAL composite gate** — Our single-gate approach vs v4's individual
   T-VERIFY tasks.

---

## Part 7: Installation Phases

### Phase A: Hook Reorganization

1. Create `.claude/hooks/atom/` and `.claude/hooks/safety/` directories
2. Move existing hook scripts to appropriate subdirectories
3. Update `.claude/settings.json` with new paths
4. Verify all hooks still fire correctly

### Phase B: Agent Frontmatter

1. Add YAML frontmatter to all 6 existing agents
2. Set appropriate model (sonnet for most, haiku for capture-idea)
3. Define tool restrictions per agent
4. Test each agent still works

### Phase C: Test Guide Skill

1. Create `test-guide/` skill directory structure
2. Adapt v4's testing-backend for our Vitest + Supertest patterns
3. Adapt testing-frontend for our React Testing Library patterns
4. Copy testing-anti-patterns with Wine Cellar examples
5. Remove old `testing` skill
6. Update CLAUDE.md skills listing

### Phase D: React Best Practices Skill

1. Copy v4's react-best-practices
2. Remove patterns for libraries we don't use
3. Add Next.js 15 specific patterns from our codebase
4. Update CLAUDE.md

### Phase E: Post-Tasks Reconciliation Hook

1. Copy `post-tasks-reconciliation.sh` from v4
2. Adapt for our directory structure
3. Add to `.claude/settings.json`
4. Test with a dummy tasks.json write

### Phase F: Archive Spec Command

1. Copy `/archive-spec` command
2. Adapt paths for our `.specify/` structure
3. Test with an old completed spec

### Phase G: Cherry-Pick Skill Improvements

1. Diff `code-search` v4 vs ours — cherry-pick new checklists
2. Diff `security-review` v4 vs ours — cherry-pick OWASP updates
3. Diff `workflow-verify-complete` v4 vs ours — cherry-pick improvements
4. Diff `db-prisma` v4 vs ours — cherry-pick new surgical fixes

### Phase H: Tier 2 Selective Adoption — INSTALLED

1. ~~Evaluate preflight agents~~ Adopted `preflight-schema-drift` and
   `preflight-interface`, adapted for Wine Cellar monorepo paths
2. Created `documents/patterns.md` as lightweight pattern registry
3. Adopted `writing-clearly` skill with Elements of Style reference files
4. Updated CLAUDE.md with new agents, skills, and patterns doc reference
5. Updated this adoption plan with final decisions

---

## Summary

| Tier                   | Components                                                                                                                      | Count                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| **Already Have**       | Core hooks, commands, skills, agents                                                                                            | ~48                   |
| **Tier 1 (Adopt)**     | Hook reorg, agent frontmatter, test-guide, react-best-practices, post-tasks hook, /archive-spec, /whats-new, skill improvements | 8 items — INSTALLED   |
| **Tier 2 (Selective)** | Preflight agents (2/5), pattern registry (lightweight), writing-clearly — adopted; Agent Teams, composition-patterns — deferred | 3 adopted, 2 deferred |
| **Tier 3 (Triggered)** | Docker + AWS (on deployment), Figma (on MedGeo), RBAC (on auth), Design System (on component library)                           | 10 items, 0 adopted   |
| **Not Adopting**       | Portal, multi-tenant, API versioning, deployment, jobs, spec-coordination                                                       | 8 items               |

**Tier 1 and Tier 2 installation is complete.** Tier 3 items are evaluated in
detail (see Part 4) with specific triggers, adoption order, and effort
estimates. Next triggers expected: AWS deployment (Docker + AWS skills) and
MedGeo Figma Make work (Figma integration components). Agent Teams and
composition-patterns deferred for company work.
