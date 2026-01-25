---
model: opus
description:
  Create feature specification from description - initializes SpecKit workflow
argument-hint: [feature-description]
commandId: specify
version: 1.1.0
created: '2025-10-09'
updated: '2026-01-05'
maintainer: '@speckit'
category: speckit
deprecated: false
modelReason:
  'Spec creation requires highest quality reasoning for requirements analysis'
---

## Model Selection

**Recommended:** opus **Reason:** Specification writing benefits from Opus's
superior reasoning for requirements analysis, edge case identification, and
architectural decisions.

If not on Opus, suggest: "For optimal spec quality, consider `/model opus`"

---

The user input to you can be provided directly by the agent or as a command
argument - you **MUST** consider it before proceeding with the prompt (if not
empty).

User input:

$ARGUMENTS

The text the user typed after `/specify` in the triggering message **is** the
feature description. Assume you always have it available in this conversation
even if `$ARGUMENTS` appears literally below. Do not ask the user to repeat it
unless they provided an empty command.

Given that feature description, do this:

1. Run the script
   `.specify/scripts/bash/create-new-feature.sh --json "$ARGUMENTS"` from repo
   root and parse its JSON output for BRANCH_NAME and SPEC_FILE. All file paths
   must be absolute. **IMPORTANT** You must only ever run this script once. The
   JSON is provided in the terminal as output - always refer to it to get the
   actual content you're looking for.
2. Load `.specify/templates/spec-template.md` to understand required sections.

3. **Select spec type**

   Based on the feature description, suggest a type and confirm with the user:

   **Spec Types**:
   - **bugfix**: Fixes broken functionality, errors, or regressions
   - **feature-minor**: Small enhancement, <5 files, no new pages
   - **feature-major**: Large feature, 5+ files, new pages/flows
   - **config**: Infrastructure/deployment/environment changes
   - **documentation**: Docs-only changes (no code)
   - **refactoring**: Code improvement without behavior change

   Present the selection to the user:

   ```
   Suggested type: [TYPE]

   Rationale:
   - [explain why this type was suggested based on description keywords]

   This affects the /clarify requirement:
   - bugfix, feature-minor, config, documentation, refactoring: /clarify SKIPPED
   - feature-major: /clarify MANDATORY before /plan

   Confirm type? [Y/n/override]
   - Y or Enter: Use suggested type
   - n: Provide additional context to re-analyze
   - bugfix/feature-minor/feature-major/config/documentation/refactoring: Override to specific type
   ```

   If user provides an override, use their selection. Otherwise, use the
   suggested type.

4. Write the specification to SPEC_FILE using the template structure, replacing
   placeholders with concrete details derived from the feature description
   (arguments) while preserving section order and headings.

5. **MANDATORY: Fill in the critical_requirements frontmatter**

   The spec template includes a `critical_requirements` YAML frontmatter section
   at the top. You MUST fill in ALL applicable values based on the spec content:

   ```yaml
   critical_requirements:
     type: [bugfix|feature-minor|feature-major|config|documentation|refactoring] # From step 3 - suggested or user-confirmed
     portal: [superadmin|admin|app|public|none] # From "Portal Placement" section, or 'none' for non-UI features
     ui_changes: [none|minor|moderate|major] # From "UI/Design Reference" section
   ```

   **WHY THIS MATTERS**: These values are used by `/plan` to determine the
   /clarify requirement and by `/tasks` to generate T-VERIFY verification tasks.
   If left as `null`, critical requirements may be missed during implementation.

   Extract these values from the corresponding spec sections as you write them.

6. Report completion with feature directory name, spec file path, and readiness
   for the next phase (/plan).

Note: This command creates the spec directory and initializes the spec file.
Branch creation is NOT performed - developers choose their workflow later
(mainline development OR feature branch via start-feature.sh).
