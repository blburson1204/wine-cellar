---
model: opus
description: Generate tasks.md from implementation plan with dependency ordering
argument-hint: (spec-id)
commandId: tasks
version: 2.3.0
created: '2025-10-09'
updated: '2026-01-09'
maintainer: '@speckit'
category: speckit
deprecated: false
modelReason:
  'Task decomposition requires precise reasoning for dependency ordering and
  parallelization'
changelog:
  - version: 2.3.0
    date: '2026-01-09'
    changes:
      'Replace 7-15 individual T-VERIFY tasks with single T-FINAL composite
      gate. T-FINAL orchestrates all verification checks (typecheck, lint, unit,
      integration, smoke, conditional checks, agents) with proper dependency
      ordering. Reduces token overhead while maintaining comprehensive
      verification.'
  - version: 2.2.0
    date: '2026-01-05'
    changes: 'Added visual regression testing support'
---

## Model Selection

**Recommended:** opus **Reason:** Task generation benefits from Opus's precision
in decomposing work, identifying dependencies, and optimizing parallelization.

If not on Opus, suggest: "For optimal task breakdown, consider `/model opus`"

---

User input: $ARGUMENTS

## Output Format: JSON (tasks.json)

Generates `tasks.json` using schema from
`.specify/templates/tasks-template.json`.

### Flags

| Flag            | Description                                |
| --------------- | ------------------------------------------ |
| `--view`        | Display tasks.json in markdown (read-only) |
| `[spec-number]` | Generate tasks for specific spec           |

---

## Pre-Generation: Read critical_requirements

**Before generating tasks:**

1. Read `spec.md` and parse `critical_requirements` YAML frontmatter
2. Extract: portal, routes, permissions, data_scoping, high_risk_apis,
   ui_complexity
3. If frontmatter missing, WARN user to update spec.md first

---

## Task Generation Steps

1. **Determine feature directory**:
   - If spec number provided in $ARGUMENTS (e.g., "158"), find matching spec
     directory:
     ```bash
     # Find spec directory matching the number (e.g., 158 -> 158-ui-verification-framework)
     spec_dir=$(ls -1d specs/${spec_number}-* 2>/dev/null | head -1 | xargs basename)
     .specify/scripts/bash/check-prerequisites.sh --json --feature "$spec_dir"
     ```
   - Otherwise (no arguments), auto-detect from current branch:
     ```bash
     .specify/scripts/bash/check-prerequisites.sh --json
     ```
   - Parse output to get FEATURE_DIR and AVAILABLE_DOCS

2. Load design documents:
   - **Always**: plan.md (tech stack)
   - **If exists**: data-model.md, contracts/, research.md, quickstart.md

3. Generate tasks using `.specify/templates/tasks-template.json` schema:
   - **Setup**: Dependencies, config
   - **Tests (parallel)**: One per contract, one per integration scenario
   - **Core**: One per entity, service, endpoint
   - **Integration**: DB, middleware, logging
   - **Polish (parallel)**: Unit tests, docs

4. Task rules:
   - `parallel: true` tasks MUST have `target_file` set
   - Different files = parallel, Same file = sequential
   - Order: Setup → Tests (TDD) → Models → Services → Endpoints → Polish

5. **Generate T-FINAL composite gate** using
   `.specify/templates/tasks-verify-templates.json`:
   - Generate single T-FINAL task from `final_gate` definition
   - T-FINAL contains `composed_of` array with all verification checks:
     - Always-required checks: typecheck, lint, unit, integration, smoke,
       security agent, code-review agent
     - Conditional checks evaluated against spec.md:
       - `db-validate`: if DB/schema keywords present
       - `contract`: if API keywords present
       - `visual`: if UI keywords or ui_changes frontmatter set
       - `e2e`: if UI keywords or ui_complexity frontmatter set
       - `a11y`: if accessibility keywords or ui_complexity high
   - Do NOT generate individual T-VERIFY-\* tasks (replaced by composite
     T-FINAL)
   - T-FINAL orchestrates all checks with proper dependency ordering

6. Generate documentation tasks via `Skill: documentation-gate`

---

## T-FINAL Composite Gate

**Source**: `.specify/templates/tasks-verify-templates.json`

T-FINAL is a single composite verification gate that orchestrates all checks
with proper dependency ordering. It replaces the previous approach of generating
7-15 individual T-VERIFY-\* tasks.

### Execution Flow

```
PARALLEL: typecheck, lint
    ↓
unit tests
    ↓
PARALLEL (if conditions met): integration, contract (conditional)
    ↓
smoke tests
    ↓
PARALLEL (if conditions met): db-validate (conditional), visual (conditional), e2e (conditional)
    ↓
a11y (conditional, depends on e2e)
    ↓
security agent
    ↓
code-review agent
    ↓
T-FINAL complete
```

### Included Checks

| Check       | Always/Conditional | Trigger                                      |
| ----------- | ------------------ | -------------------------------------------- |
| typecheck   | Always             | TypeScript compilation                       |
| lint        | Always             | ESLint validation                            |
| unit        | Always             | Unit test suite                              |
| integration | Always             | Integration tests                            |
| smoke       | Always             | Critical path smoke tests                    |
| db-validate | Conditional        | DB/schema keywords in spec                   |
| contract    | Conditional        | API keywords in spec                         |
| visual      | Conditional        | UI keywords or ui_changes frontmatter        |
| e2e         | Conditional        | UI keywords or ui_complexity frontmatter     |
| a11y        | Conditional        | Accessibility keywords or high ui_complexity |
| security    | Always             | Security audit agent                         |
| code-review | Always             | Code review agent                            |

**Full gate definition**: `.specify/templates/tasks-verify-templates.json` →
`final_gate.composed_of`

---

## Post-Generation

1. **Validate JSON**:

   ```bash
   cat FEATURE_DIR/tasks.json | jq . > /dev/null
   jq '[.tasks[] | select(.parallel == true and .target_file == null)] | length' FEATURE_DIR/tasks.json  # Must be 0
   ```

2. **Update session context** (`.claude/session-context/current-work.md`):

   ```markdown
   # Current Work: Spec {spec_id} - {spec_name}

   **Status**: Phase 3 - Implementation (READY) **spec_id**: {spec_id}

   - **Completed**: 0/{total} tasks
   - **Next**: {first_task_id}: {description}
   ```

3. **Output summary**: | Check | Result | |-------|--------| | Valid JSON | Yes
   | | Parallel tasks with target_file | 100% | | T-FINAL generated | Yes
   (single composite gate) |

---

## --view Flag

Display tasks.json as markdown table:

```markdown
# Tasks: {spec_name} (Spec {spec_id})

## Phase {phase}

| Status | ID   | Description      | Target         |
| ------ | ---- | ---------------- | -------------- |
| [ ]    | T001 | Task description | `path/file.ts` |

## Verification

| Status | ID      | Description                   | Composed Of                         |
| ------ | ------- | ----------------------------- | ----------------------------------- |
| [ ]    | T-FINAL | All verification gates passed | 12 checks (7 always, 5 conditional) |

## Summary

| Metric    | Count |
| --------- | ----- |
| Total     | {n}   |
| Completed | {n}   |
```

---

**Schema references**:

- Task structure: `.specify/templates/tasks-template.json`
- T-VERIFY gates: `.specify/templates/tasks-verify-templates.json`

Context: $ARGUMENTS
