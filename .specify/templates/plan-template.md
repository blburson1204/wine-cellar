---
# Context Optimization Metadata
# Purpose: Enable efficient partial reads (~200 tokens vs ~2500 for full file)
meta:
  spec_id: null # Populated from branch name (e.g., 107)
  spec_name: null # Populated from feature name
  phase: plan # Current phase in SpecKit workflow
  updated: null # ISO date of last update

# Quick Reference (for checkpoint resume)
summary:
  tech_stack: [] # [TypeScript, Express, Prisma]
  external_deps: [] # [SAM.gov API, S3]
  test_strategy: null # {unit: X, contract: Y, e2e: Z}
  deployment: null # immediate | gradual | feature-flag
---

# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

## Execution Flow (/plan command scope)

```
1. Load spec → Fill Technical Context → Constitution Check
2. Phase 0.1: Research + Testing Strategy (MANDATORY)
3. Phase 0.2: Permissions (if roles/permissions in spec)
4. Phase 0.3: Integration Analysis (MANDATORY)
5. Phase 0.4: Design Pre-flight (if Moderate+ UI)
6. Phase 0.5: Infrastructure (if env vars/migrations/deprecations)
7. Phase 1: Design & Contracts → data-model.md, contracts/, quickstart.md
8. Plan Phase 2 approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**Note**: /plan stops at step 9. /tasks creates tasks.md, then implementation
begins.

## Summary

[Extract from feature spec: primary requirement + technical approach from
research]

## Technical Context

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS
CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps
or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory,
offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS
CLARIFICATION]

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

[Gates determined based on constitution file]

### AI & Machine Learning (Constitution Principle IV) _(if applicable)_

**Does this feature involve AI/ML?**

- [ ] **No** - Skip this section
- [ ] **Yes** - Complete all items below

**If YES - XAI Transparency Requirements (MANDATORY):**

| Requirement        | Implementation                                  | Status      |
| ------------------ | ----------------------------------------------- | ----------- |
| Transparency Layer | [describe how AI decisions will be explained]   | [ ] Planned |
| Confidence Scores  | [describe how confidence will be displayed]     | [ ] Planned |
| Decision Rationale | [describe how reasoning will be shown]          | [ ] Planned |
| Audit Trail        | [describe how AI inputs/outputs will be logged] | [ ] Planned |
| User Explanations  | [describe user-facing explanations]             | [ ] Planned |

**XAI Checklist**:

- [ ] AI decisions are explainable to end users
- [ ] Confidence scores accompany all AI-generated content
- [ ] Users can understand WHY a recommendation was made
- [ ] AI inputs and outputs are logged for audit
- [ ] Human override mechanism exists for AI decisions
- [ ] AI failures are handled gracefully with clear messaging

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Phase 0.1: Research & Testing Strategy

_MANDATORY - Always execute this phase_

**Optional skills**: `arch` (if complex architecture), `testing` (for test
planning)

### Research

1. **Resolve Technical Context unknowns**: For each NEEDS CLARIFICATION →
   research task
2. **Dispatch research agents** for unknown technologies
3. **Consolidate in research.md**: Decision, Rationale, Alternatives

### Testing Strategy

**⚠️ INVOKE: `Skill: testing`**

| Check            | Output                                |
| ---------------- | ------------------------------------- |
| External APIs    | [list] → Risk: [HIGH/MEDIUM/LOW]      |
| Test types       | [unit/contract/integration/E2E]       |
| E2E permitted?   | [Yes (limit X) / No (HIGH-RISK APIs)] |
| Mocking strategy | [dependencies → mock approach]        |

**Testing Summary**:

```
Feature type: [Backend-heavy / Frontend-heavy / Mixed]
Quota risks: [list or "None"]
Estimated tests: [count]
Distribution: Unit [X]%, Contract [X]%, Integration [X]%, E2E [X]%
```

**⚠️ GATE**: HIGH-RISK APIs (SAM.gov, FPDS, USAspending) → E2E FORBIDDEN

**Output**: research.md, Testing Strategy documented

## Phase 0.2: Permissions Design

_CONDITIONAL - Skip if no roles/permissions in spec_

**Skip condition**: Spec has no "Permissions & Access Control" section → Skip to
Phase 0.3

### Permission Resources

| Resource   | Actions                      | Description |
| ---------- | ---------------------------- | ----------- |
| [resource] | view, create, update, delete | [from spec] |

### Dual-Layer Enforcement

**⚠️ CRITICAL: Every permission requires BOTH API + UI enforcement**

| Permission          | API Middleware               | UI Gate       | Data Scope   |
| ------------------- | ---------------------------- | ------------- | ------------ |
| `[resource].view`   | GET + `requirePermission`    | `RequireRole` | WHERE clause |
| `[resource].create` | POST + `requirePermission`   | Button hidden | N/A          |
| `[resource].update` | PUT + `requirePermission`    | Form check    | owner check  |
| `[resource].delete` | DELETE + `requirePermission` | Confirm modal | owner check  |

**Data Scoping**: [ ] Platform-wide [ ] Customer-scoped [ ] Team-scoped [ ]
User-scoped

**⚠️ GATE**: Every permission has BOTH API + UI enforcement → proceed

**Output**: Permissions design documented

## Phase 0.3: Integration Analysis

_MANDATORY - Always execute this phase_

**Skills**: `code-interconnectedness` (reuse + integration),
`proposed-contract-validation` (if new interfaces)

### Codebase Pattern Discovery

| Pattern Area    | Finding                           |
| --------------- | --------------------------------- |
| Status enums    | [UPPERCASE/lowercase]             |
| Role handling   | [format used]                     |
| Auth flow       | [session → jwt → express pattern] |
| Response format | [{success, data, error}]          |

### Data Contracts

| Entity   | DB Format | API Format | UI Format |
| -------- | --------- | ---------- | --------- |
| [Entity] | UPPERCASE | UPPERCASE  | titleCase |

### Code Interconnectedness Gate

**⚠️ INVOKE: `Skill: code-interconnectedness`**

| Pattern Needed | LSP Result | Decision               |
| -------------- | ---------- | ---------------------- |
| [e.g., Logger] | [output]   | REUSE/EXTEND/DUPLICATE |

**Evidence Required**: LSP output pasted (no claims without proof)

### Contract Validation (if new interfaces)

**⚠️ INVOKE: `Skill: proposed-contract-validation`**

```bash
cd specs/NNN/contracts && npx tsc --noEmit
```

**Required**: `tsc --noEmit` output shows "Found 0 errors"

**⚠️ GATE**: LSP evidence pasted, contracts type-check → proceed

**Output**: Integration analysis documented, code reuse verified

## Phase 0.4: Design Pre-flight

_CONDITIONAL - Skip if Backend-only or Minor UI_

**Skip condition**: Spec UI classification is Backend-only or Minor UI → Skip to
Phase 0.5

**⚠️ INVOKE: `Skill: figma`** if converting Figma designs

### Mockup Review

| FR     | UI Element | Mockup? | @retryvr/ui Component |
| ------ | ---------- | ------- | --------------------- |
| FR-001 | [element]  | Yes/No  | [component or GAP]    |

### Component Gaps

| Gap Component | Build Effort | Strategy           |
| ------------- | ------------ | ------------------ |
| [component]   | [hours]      | [build/substitute] |

**Total gap effort**: [hours]

### Design Token Compliance

- [ ] All colors use design tokens
- [ ] All spacing uses Tailwind standards
- [ ] All typography uses text scale

**⚠️ GATE**: All mockups exist, gaps documented → proceed

**Output**: component-inventory.md

## Phase 0.5: Infrastructure & Migrations

_CONDITIONAL - Skip if no infra changes, migrations, or deprecations_

**Skip condition**: No env vars, no migrations, no deprecations → Skip to Phase
1

**⚠️ INVOKE: `Skill: prisma`** if migration issues occur

### Environment & SSM

| Variable | Service | Source   |
| -------- | ------- | -------- |
| [name]   | api/web | SSM/.env |

**SSM Pattern**: `/retryvr/{env}/[name]`

### Migrations (if applicable)

| Migration | Type                 | Risk         | Rollback      |
| --------- | -------------------- | ------------ | ------------- |
| [name]    | Additive/Destructive | LOW/MED/HIGH | [script path] |

**Pre-migration checklist**:

- [ ] RDS snapshot scheduled (production)
- [ ] Tested in staging
- [ ] Rollback script tested

### Deprecations (if applicable)

**Cleanup decision**: [ ] In-Scope [ ] Follow-on Spec [ ] N/A

| Deprecated Item | Consumers      | Impact                  |
| --------------- | -------------- | ----------------------- |
| [item]          | [what uses it] | [breaking/non-breaking] |

**If Follow-on**: Spec file MUST exist before proceeding

### Deployment Order

```
1. Database migration (if required)
2. API deployment
3. Dispatcher (if jobs affected)
4. Web deployment
```

**Rollout**: [ ] Immediate [ ] Gradual [ ] Feature Flag

**⚠️ GATE**: Infrastructure documented, migrations safe → proceed

**Output**: Infrastructure requirements, migration safety plan

## Phase 1: Design & Contracts

_Prerequisites: Phases 0.1-0.5 complete (skip conditional phases per skip
conditions)_

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude` **IMPORTANT**:
     Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md,
agent-specific file

## Phase 2: Task Planning Approach

_Executed by /tasks command, NOT /plan_

**Strategy**: Generate from Phase 1 docs, constrain by Phase 0.1 testing
estimates

| From      | Task Type                            | Order |
| --------- | ------------------------------------ | ----- |
| Contracts | Contract tests [P]                   | 1st   |
| Entities  | Model creation [P]                   | 2nd   |
| Stories   | Integration tests (if E2E permitted) | 3rd   |
| All       | Implementation to make tests pass    | 4th   |

**Constraints**: E2E limited per Phase 0.1, mocks before tests for external APIs

## Progress Tracking

| Phase                  | Status | Skip If                        |
| ---------------------- | ------ | ------------------------------ |
| 0.1 Research + Testing | [ ]    | Never                          |
| 0.2 Permissions        | [ ]    | No roles in spec               |
| 0.3 Integration        | [ ]    | Never                          |
| 0.4 Design Pre-flight  | [ ]    | Backend-only/Minor UI          |
| 0.5 Infrastructure     | [ ]    | No env/migrations/deprecations |
| 1 Design & Contracts   | [ ]    | -                              |
| 2 Task Planning        | [ ]    | -                              |

**Gates**: Constitution Check PASS, All NEEDS CLARIFICATION resolved

---

_Based on Constitution v2.1.1_
