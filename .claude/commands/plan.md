---
model: opus
description: Generate implementation plan from spec with architectural reasoning
argument-hint: (spec-id)
commandId: plan
version: 1.3.0
created: '2025-10-09'
updated: '2026-01-09'
maintainer: '@speckit'
category: speckit
deprecated: false
modelReason:
  'Planning requires deep architectural reasoning and tradeoff analysis'
changelog:
  - version: 1.3.0
    date: '2026-01-09'
    changes:
      'CLARIFICATION GATE now type-based - only feature-major requires
      clarification, all other types bypass gate'
  - version: 1.2.1
    date: '2026-01-05'
    changes:
      'CLARIFICATION GATE now complexity-aware - simple specs bypass gate,
      moderate/complex require clarification'
  - version: 1.2.0
    date: '2026-01-05'
    changes: 'Added model selection directive for Opus'
  - version: 1.1.0
    date: '2025-12-27'
    changes:
      'Added mandatory CLARIFICATION GATE (step 2) - blocks /plan if no /clarify
      session exists in spec'
---

## Model Selection

**Recommended:** opus **Reason:** Implementation planning benefits from Opus's
superior architectural reasoning, pattern recognition, and tradeoff analysis.

If not on Opus, suggest: "For optimal planning quality, consider `/model opus`"

---

The user input to you can be provided directly by the agent or as a command
argument - you **MUST** consider it before proceeding with the prompt (if not
empty).

User input:

$ARGUMENTS

## Pre-Execution Assessment

Before starting, which optional skills apply?

- [ ] UI changes? → design-system, figma
- [ ] Debugging? → systematic-debugging
- [ ] Architecture decisions? → arch
- [ ] Database changes? → prisma
- [ ] Need to find existing docs? → search-documentation (discovery phase)

Given the implementation details provided as an argument, do this:

1. Run `.specify/scripts/bash/setup-plan.sh --json` from the repo root and parse
   JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH. All future file paths
   must be absolute.

2. **CLARIFICATION GATE**
   - First, extract `type` from `critical_requirements` frontmatter in
     FEATURE_SPEC
   - **If type = `feature-major`**: Check for Clarifications section
     - Grep FEATURE_SPEC for `## Clarifications` section
     - If section is MISSING or has NO `### Session` subheadings:

       ```
       ❌ BLOCKED: No clarification session found in spec.

       Run `/clarify [spec-number]` first to explore ambiguities.

       This is NOT optional for feature-major specs. Even "complete-looking"
       specs benefit from Socratic exploration. The /clarify step catches
       assumptions that cause rework during implementation.

       Options:
       - Run `/clarify` to complete clarification
       - Change spec type if this is not a major feature
       ```

     - **DO NOT rationalize that "the spec looks complete enough"** - that's the
       anti-pattern this gate prevents
     - If Clarifications section exists with ≥1 Session → Continue to step 3

   - **If type = `bugfix`, `feature-minor`, `config`, `documentation`, or
     `refactoring`**: Gate PASSES
     - Log: "Clarification gate passed: type=[type] (clarification not
       required)"
     - Continue to step 3

3. Read and analyze the feature specification to understand:
   - The feature requirements and user stories
   - Functional and non-functional requirements
   - Success criteria and acceptance criteria
   - Any technical constraints or dependencies mentioned

4. Read the constitution at `.specify/memory/constitution.md` to understand
   constitutional requirements.

5. Execute the implementation plan template:
   - Load `.specify/templates/plan-template.md` (already copied to IMPL_PLAN
     path)
   - Set Input path to FEATURE_SPEC
   - Run the Execution Flow (main) function steps 1-9
   - The template is self-contained and executable
   - Follow error handling and gate checks as specified
   - Let the template guide artifact generation in $SPECS_DIR:
     - Phase 0 generates research.md
     - Phase 1 generates data-model.md, contracts/, quickstart.md
     - Phase 2 describes task generation approach (tasks.md created later by
       /tasks command)
   - Incorporate user-provided details from arguments into Technical Context:
     $ARGUMENTS
   - Update Progress Tracking as you complete each phase

6. Verify execution completed:
   - Check Progress Tracking shows all phases complete
   - Ensure all required artifacts were generated
   - Confirm no ERROR states in execution

7. Report results with branch name, file paths, and generated artifacts.

Use absolute paths with the repository root for all file operations to avoid
path issues.
