---
model: opus
description:
  Detect and reduce ambiguity in active spec through Socratic questioning
argument-hint: (spec-id)
commandId: clarify
version: 1.1.0
created: '2025-10-09'
updated: '2026-01-05'
maintainer: '@speckit'
category: speckit
deprecated: false
modelReason:
  'Clarification requires nuanced Socratic questioning and ambiguity detection'
---

## Model Selection

**Recommended:** opus (subtle ambiguity detection, probing questions)

---

$ARGUMENTS

Goal: Detect and reduce ambiguity or missing decision points in the active
feature specification and record the clarifications directly in the spec file.

Note: This clarification workflow is expected to run (and be completed) BEFORE
invoking `/plan`. If the user explicitly states they are skipping clarification
(e.g., exploratory spike), you may proceed, but must warn that downstream rework
risk increases.

Execution steps:

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` from
   repo root **once** (combined `--json --paths-only` mode /
   `-Json -PathsOnly`). Parse minimal JSON payload fields:
   - `FEATURE_DIR`
   - `FEATURE_SPEC`
   - (Optionally capture `IMPL_PLAN`, `TASKS` for future chained flows.)
   - If JSON parsing fails, abort and instruct user to re-run `/specify` or
     verify feature branch environment.

2. Load spec file. Scan for ambiguity using 4 areas (mark each:
   Clear/Partial/Missing):
   - **Scope**: Goals, out-of-scope, roles, acceptance criteria
   - **Data**: Entities, relationships, external APIs, state transitions
   - **UX**: User journeys, error states, performance targets, terminology
   - **Edge Cases**: Negative scenarios, security, TODOs, vague adjectives

   For Partial/Missing areas, add candidate question unless:
   - Clarification would not materially change implementation or validation
     strategy
   - Information is better deferred to planning phase (note internally)

3. Generate (internally) a prioritized queue of candidate clarification
   questions. Apply these constraints:
   - Target 5-7 total questions maximum across entire session.
   - Each question must be answerable with EITHER:
     - A short multiple‑choice selection (2–5 distinct, mutually exclusive
       options), OR
     - A one-word / short‑phrase answer (explicitly constrain: "Answer in <=5
       words").
   - Only include questions whose answers materially impact architecture, data
     modeling, task decomposition, test design, UX behavior, operational
     readiness, or compliance validation.
   - Ensure area coverage balance: attempt to cover the highest impact
     unresolved areas first; avoid asking two low-impact questions when a single
     high-impact area (e.g., security posture) is unresolved.
   - Exclude questions already answered, trivial stylistic preferences, or
     plan-level execution details (unless blocking correctness).
   - Favor clarifications that reduce downstream rework risk or prevent
     misaligned acceptance tests.
   - Prioritize by (Impact \* Uncertainty) heuristic - highest impact
     ambiguities first.

4. Batched questioning loop (interactive):
   - Present 3-5 related questions per turn (group by area: Scope, Data, UX,
     Edge Cases).
   - Number each question (Q1, Q2, Q3, etc.) for clear reference.
   - For multiple‑choice questions render options as a Markdown table:

     **Q1: [Question text]** | Option | Description | |--------|-------------| |
     A | <Option A description> | | B | <Option B description> | | C |
     <Option C description> | (add D/E as needed up to 5) | Short | Provide a
     different short answer (<=5 words) | (Include only if free-form alternative
     is appropriate)

   - For short‑answer style (no meaningful discrete options), output:
     `Format: Short answer (<=5 words)`.
   - After the user answers all questions in the batch:
     - Validate each answer maps to one option or fits the <=5 word constraint.
     - If ambiguous, ask for quick disambiguation (count still belongs to same
       question; do not advance).
     - Once satisfactory, record all answers in working memory (do not yet write
       to disk).
     - If more questions remain and <7 total questions asked, present next
       batch.
   - Stop asking further questions when:
     - All critical ambiguities resolved (remaining queued items become
       unnecessary), OR
     - 5-7 questions have been asked and answered, OR
     - User signals completion ("done", "good", "no more").
   - If no valid questions exist at start, immediately report no critical
     ambiguities.

5. Integration after all questions answered (single consolidated write):
   - Maintain in-memory representation of the spec (loaded once at start) plus
     the raw file contents.
   - After all questions in session have been answered:
     - Ensure a `## Clarifications` section exists (create it just after the
       highest-level contextual/overview section per the spec template if
       missing).
     - Under it, create (if not present) a `### Session YYYY-MM-DD` subheading
       for today.
   - Append all Q&A pairs as bullet lines:
     `- Q: <question> → A: <final answer>`.
   - Then apply all clarifications to the most appropriate section(s):
     - Functional ambiguity → Update or add a bullet in Functional Requirements.
     - User interaction / actor distinction → Update User Stories or Actors
       subsection (if present) with clarified role, constraint, or scenario.
     - Data shape / entities → Update Data Model (add fields, types,
       relationships) preserving ordering; note added constraints succinctly.
     - Non-functional constraint → Add/modify measurable criteria in
       Non-Functional / Quality Attributes section (convert vague adjective to
       metric or explicit target).
     - Edge case / negative flow → Add a new bullet under Edge Cases / Error
       Handling (or create such subsection if template provides placeholder for
       it).
     - Terminology conflict → Normalize term across spec; retain original only
       if necessary by adding `(formerly referred to as "X")` once.
   - If the clarification invalidates an earlier ambiguous statement, replace
     that statement instead of duplicating; leave no obsolete contradictory
     text.
   - Preserve formatting: do not reorder unrelated sections; keep heading
     hierarchy intact.
   - Keep each inserted clarification minimal and testable (avoid narrative
     drift).

6. Validation (performed before final write):
   - Clarifications session contains exactly one bullet per accepted answer (no
     duplicates).
   - Updated sections contain no lingering vague placeholders the new answer was
     meant to resolve.
   - No contradictory earlier statement remains (scan for now-invalid
     alternative choices removed).
   - Markdown structure valid; only allowed new headings: `## Clarifications`,
     `### Session YYYY-MM-DD`.
   - Terminology consistency: same canonical term used across all updated
     sections.

7. Write the updated spec back to `FEATURE_SPEC` (single atomic write at end).

8. Report completion (after questioning loop ends or early termination):
   - Number of questions asked & answered.
   - Path to updated spec.
   - Sections touched (list names).
   - Coverage summary table listing each taxonomy area (Scope, Data, UX, Edge
     Cases) with Status: Resolved (was Partial/Missing and addressed), Deferred
     (better suited for planning phase), Clear (already sufficient), Outstanding
     (still Partial/Missing but low impact).
   - If any Outstanding or Deferred remain, recommend whether to proceed to
     `/plan` or run `/clarify` again later post-plan.
   - Suggested next command.

Behavior rules:

- If no meaningful ambiguities found (or all potential questions would be
  low-impact), respond: "No critical ambiguities detected worth formal
  clarification." and suggest proceeding.
- If spec file missing, instruct user to run `/specify` first (do not create a
  new spec here).
- Target 5-7 questions maximum across the entire session - prioritize highest
  impact ambiguities.
- Avoid speculative tech stack questions unless the absence blocks functional
  clarity.
- Respect user early termination signals ("stop", "done", "proceed").
- If no questions asked due to full coverage, output a compact coverage summary
  (all areas Clear) then suggest advancing.

Context for prioritization: $ARGUMENTS
