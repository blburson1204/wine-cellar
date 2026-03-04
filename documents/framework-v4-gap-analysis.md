# Framework v4 Gap Analysis

**Created**: March 4, 2026 **Parent**:
[bryan-framework-v4-adoption-plan.md](bryan-framework-v4-adoption-plan.md)

Complete inventory of v4 framework components we chose not to install. Use this
as a reference when starting new work — a component listed here may become
relevant as Wine Cellar's scope expands.

**Counts**: v4 has ~190 components. We installed ~65. This document covers the
~125 we skipped.

---

## Skills Not Installed (22 of 54)

### Covered by Tier 3 Triggers (see adoption plan §4)

| Skill                                | Trigger             | Adoption Plan Ref |
| ------------------------------------ | ------------------- | ----------------- |
| `aws-cdk-development`                | AWS deployment      | §4.1              |
| `aws-expert`                         | AWS deployment      | §4.1              |
| `aws-serverless-eda` (+2 sub-skills) | Serverless pivot    | §4.4 (bookmarked) |
| `docker-expert` (+1 sub-skill)       | Containerization    | §4.1              |
| `security-rbac`                      | Auth feature        | §4.3              |
| `ui-design-system`                   | Component library   | §4.3              |
| `ui-figma-integrate`                 | MedGeo Figma work   | §4.2              |
| `ui-figma-sync`                      | MedGeo Figma work   | §4.2              |
| `prod-data-sampler`                  | Production deploy   | §4.4 (bookmarked) |
| `db-expert`                          | Raw SQL needs       | §4.4 (bookmarked) |
| `promote-fix-promote`                | Staged environments | §4.4 (bookmarked) |

### Bryan-Specific (not relevant to Wine Cellar)

| Skill                                | Why Skipped                                                              |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `diagnose-jobs`                      | Background job diagnostics for Bryan's job runner                        |
| `meta-create-agents` (+2 sub-skills) | Framework authoring — we're consumers                                    |
| `meta-create-tool`                   | Framework authoring                                                      |
| `meta-write-skills` (+2 sub-skills)  | Framework authoring                                                      |
| `pattern-registry`                   | We adopted as lightweight `documents/patterns.md` instead                |
| `refresh-data-docs`                  | Refreshes data documentation for Bryan's domain models                   |
| `schema-for-ui`                      | Generates UI-friendly schema views for Bryan's multi-portal architecture |

### Worth a Second Look

These weren't evaluated in the original adoption plan. They may add incremental
value and are worth reviewing when doing related work.

| Skill                          | What It Does                                                               | When to Revisit                                       |
| ------------------------------ | -------------------------------------------------------------------------- | ----------------------------------------------------- |
| `claude-maintenance-expert`    | Guidance for maintaining Claude Code configuration (skills, agents, hooks) | Next framework maintenance pass                       |
| `composition-patterns`         | Compound component and slot patterns for React                             | Deferred in Tier 2 — revisit when building complex UI |
| `preflight`                    | Top-level router that dispatches to preflight agents                       | If we add more preflight agents beyond the 2 we have  |
| `ralph`                        | Skill companion to the `/ralph` command — execution patterns               | If ralph loop needs tuning                            |
| `spec-api-contracts`           | Defines API contract format for specs                                      | If we formalize API contract testing                  |
| `spec-archive`                 | Skill companion to `/archive-spec` command                                 | If archive workflow needs tuning                      |
| `spec-contract-validate`       | Validates API contracts against implementation                             | If we formalize API contract testing                  |
| `test-acceptance-check-runner` | Runs acceptance tests from spec criteria                                   | If we add acceptance testing phase                    |
| `ui-implement-preflight`       | Pre-implementation checks specific to UI work                              | If UI tasks need more guardrails                      |
| `feature-ship-app`             | Variant of feature-ship for app-level deploys                              | When deploying — may overlap with our feature-ship    |

---

## Agents Not Installed (44 of 52)

### Covered by Tier 3 Triggers

| Agent                     | Trigger                                    |
| ------------------------- | ------------------------------------------ |
| `aws-advisor`             | AWS deployment                             |
| `design-auditor`          | MedGeo Figma / component library           |
| `figma-sync-orchestrator` | MedGeo Figma work                          |
| `implement-orchestrator`  | Agent Teams (Tier 2 deferred)              |
| `implement-teammate`      | Agent Teams (Tier 2 deferred)              |
| `rbac-checker`            | Auth feature (used by security-rbac skill) |

### Bryan-Specific

| Agent                                   | Why Skipped                                                             |
| --------------------------------------- | ----------------------------------------------------------------------- |
| `_README.md`                            | Template documentation                                                  |
| `agent-template.md`                     | Blank agent template                                                    |
| `agent-file-generator`                  | Meta — generates agent files                                            |
| `api-contract-checker`                  | Bryan's API versioning system                                           |
| `archive-executor`                      | Spec archive execution                                                  |
| `artifact-reconciliation`               | Reconciles spec/plan/task artifacts (we use simpler approach)           |
| `code-review-orchestrator`              | Multi-reviewer orchestration (overkill for solo dev)                    |
| `compliance-auditor`                    | Bryan's compliance rules                                                |
| `construct-design-advisor`              | CDK construct design patterns                                           |
| `data-docs-refresher`                   | Refreshes Bryan's data documentation                                    |
| `db-advisor`                            | Database advisory (we use db-prisma skill)                              |
| `defense-depth-checker`                 | Used by security-defense-depth skill (we have the skill, not the agent) |
| `deploy-monitor` / `deployment-monitor` | Deployment monitoring                                                   |
| `deployment-orchestrator`               | ECS/ECR deployment pipeline                                             |
| `diagnose-jobs-executor`                | Background job diagnostics                                              |
| `doc-file-editor`                       | Edits documentation files programmatically                              |
| `doc-gate-analyst`                      | Documentation gate analysis (we have doc-gate skill)                    |
| `doc-impact-analyzer`                   | Analyzes doc impact of changes                                          |
| `general-purpose`                       | Generic agent template                                                  |
| `ship-feature`                          | Feature shipping agent                                                  |
| `spec-analysis-reporter`                | Spec analysis reporting                                                 |
| `spec-status-manager`                   | Spec status tracking                                                    |
| `spec-thoroughness-checker`             | Spec completeness checking                                              |
| `start-feature`                         | Feature branch setup agent                                              |
| `tool-file-generator`                   | Meta — generates tool files                                             |
| `verification-validator`                | Validates verification evidence                                         |

### Worth a Second Look

| Agent                   | What It Does                                            | When to Revisit                     |
| ----------------------- | ------------------------------------------------------- | ----------------------------------- |
| `acceptance-tester`     | Runs acceptance tests from spec criteria                | If we add acceptance testing        |
| `accessibility-checker` | Dedicated a11y scanning agent                           | Next accessibility audit            |
| `codebase-scanner`      | Broad codebase analysis                                 | When doing large refactors          |
| `code-quality-reviewer` | Quality-focused review (vs security-focused)            | Next code quality pass              |
| `full-stack-tracer`     | Traces issues across API/web boundary                   | When debugging cross-boundary bugs  |
| `prisma-diagnostics`    | Prisma-specific diagnostics                             | If db-prisma skill isn't sufficient |
| `rca-tracer`            | Root cause analysis agent (supplements debug-rca skill) | If RCA needs more automation        |
| `react-reviewer`        | React-specific code review                              | When doing React refactors          |
| `systematic-debugger`   | Debugging agent (supplements debug-systematic skill)    | If debugging needs more automation  |
| `test-runner`           | Dedicated test execution agent                          | If test runs need orchestration     |

---

## Commands Not Installed (33 of 48)

### Docker & Deployment (17) — Tier 3 triggered by deployment

`docker-dev`, `docker-build`, `docker-validate`, `docker-test`,
`docker-restart`, `docker-pre-ship`, `docker-push`, `docker-deploy-staging`,
`docker-deploy-production`, `startup-staging`, `shutdown-staging`,
`startup-production`, `shutdown-production`, `generate-framework-docker`,
`figma-sync`, `audit-design`, `generate-framework`

### Bryan-Specific (8)

| Command                            | Why Skipped                            |
| ---------------------------------- | -------------------------------------- |
| `create-agent`                     | Meta — agent file generation           |
| `diagnose-prisma`                  | Bryan's Prisma diagnostic workflow     |
| `pattern-check` / `pattern-update` | We use `documents/patterns.md` instead |
| `review-code`                      | Duplicate — we have `/code-review`     |
| `schema-for-ui`                    | Bryan's multi-portal schema views      |
| `spec-status`                      | Bryan's spec tracking workflow         |
| `superpowers-brainstorm`           | Bryan-specific brainstorming variant   |

### Worth a Second Look

| Command                      | What It Does                                    | When to Revisit                      |
| ---------------------------- | ----------------------------------------------- | ------------------------------------ |
| `health`                     | System health check (Docker, DB, services)      | When deploying                       |
| `preflight`                  | Runs all preflight agents before implementation | If we add more preflight agents      |
| `purge-task-outputs`         | Cleans up task output files from agent runs     | If task output files accumulate      |
| `reconcile-artifacts`        | Ensures spec/plan/tasks stay in sync            | If drift becomes a problem           |
| `test-spec`                  | Generates tests from spec acceptance criteria   | If we add spec-driven testing        |
| `trace-feature`              | Traces a feature across the full stack          | When debugging cross-boundary issues |
| `ui-preflight` / `verify-ui` | UI verification before merge                    | When doing UI-heavy features         |

---

## Hooks Not Installed (9 of 16)

| Hook                                     | Category                     | When to Revisit                     |
| ---------------------------------------- | ---------------------------- | ----------------------------------- |
| `atom/doc-evaluation-gate.sh`            | Doc quality gate             | If doc quality slips                |
| `statusline/statusline-command.sh`       | Status line display          | If we want status line info         |
| `speckit/auto-phase-update.sh`           | Auto-updates spec phase      | If manual phase tracking is painful |
| `speckit/doc-evaluation-nudge.sh`        | Nudges for doc updates       | If docs fall behind                 |
| `agent-teams/task-completed-gate.sh`     | Agent Teams                  | Tier 2 deferred                     |
| `agent-teams/teammate-idle-check.sh`     | Agent Teams                  | Tier 2 deferred                     |
| `agent-teams/task-completed-evidence.sh` | Agent Teams                  | Tier 2 deferred                     |
| `lib/write-evidence.sh`                  | Utility for evidence writing | If other hooks need it              |

---

## Docs & Guides Not Installed

### Docs (13 of 16 not installed)

We have 3 docs: `atom.md`, `atom-gate-execution.md`, `context-management.md`.

| Doc                                  | Worth installing?                                                |
| ------------------------------------ | ---------------------------------------------------------------- |
| `frontmatter-reference.md`           | **Yes** — we adopted agent frontmatter but not the reference doc |
| `atom-task-queries.md`               | Maybe — task query patterns for ATOM                             |
| `atom-tasks-schema.md`               | Maybe — tasks.json schema reference                              |
| `checkpoint-workflow.md`             | Maybe — we have the command but not the doc                      |
| `developer-tooling.md`               | Maybe — tooling reference                                        |
| `subagent-delegation.md`             | Maybe — useful for delegation patterns                           |
| `pattern-registry.md`                | No — we use `documents/patterns.md`                              |
| `reference/documentation-index.md`   | Bryan-specific                                                   |
| `reference/development-standards.md` | Bryan-specific                                                   |
| `reference/quick-commands.md`        | Bryan-specific                                                   |
| `reference/spec-coordination.md`     | Bryan-specific                                                   |
| `reference/test-users.md`            | Bryan-specific                                                   |
| `README.md`                          | Bryan-specific index                                             |

### Guides (0 of 8 installed)

All Bryan-specific: portal architecture, page creation patterns, logging
standards, feature access control, security detailed, speckit integration,
custom commands, README. None needed for Wine Cellar.

---

## Quick Action Items

These are low-effort items worth picking up in the next maintenance pass:

1. **Install `frontmatter-reference.md`** — We adopted agent frontmatter in Tier
   1 but never copied the reference doc. Quick copy.
2. **Review `claude-maintenance-expert` skill** — May help with framework
   maintenance hygiene.
3. **Review `checkpoint-workflow.md` doc** — We use `/checkpoint` but lack the
   supporting documentation.
