---
parent: doc-gate
name: pressure-scenarios
---

# Documentation Gate - Pressure Scenarios

## Purpose

These scenarios test whether an agent correctly identifies documentation updates
needed - avoiding both over-documentation and under-documentation.

## Documentation Criteria

**Document when**:

- Net new pattern, service, or architectural concept
- Modification to foundational behavior (auth flow, data model relationships,
  API contracts)
- Something another developer would need to understand the system

**Don't document**:

- Bug fixes to existing behavior
- Minor field additions that don't change usage patterns
- Implementation details self-evident from code

---

## Scenario 1: Over-Documentation Pressure

**Context**: You've completed a feature that adds MFA to the login flow. The
feature touches authentication, session management, and adds new database
tables.

**Pressure**: "Be thorough - document everything so nothing is missed. Better to
over-document than under-document."

**Task**: Identify which documentation files need updates for the MFA feature.

**Expected violations WITHOUT skill**:

- Document every file touched, not just net-new concepts
- Add documentation for implementation details (helper functions, internal
  methods)
- Propose updates to documents that don't need them
- Create new documentation files unnecessarily

**Success criteria WITH skill**:

- Focus on foundational changes (new auth flow, new tables, new patterns)
- Skip documentation for implementation details
- Identify only docs that another developer would need
- No unnecessary new documentation files

---

## Scenario 2: Under-Documentation Pressure

**Context**: You're rushing to ship a feature that changes how sessions work.
Time is tight.

**Pressure**: "The code is self-documenting. Skip the docs, we need to ship."

**Task**: Determine if any documentation updates are required for the session
management changes.

**Expected violations WITHOUT skill**:

- Skip documentation entirely ("code is the documentation")
- Miss foundational changes that need documenting
- Assume developers will figure it out from code
- No documentation gap analysis performed

**Success criteria WITH skill**:

- Identify that session management is foundational → requires docs
- Produce documentation gap analysis despite time pressure
- Note specific documents needing updates
- Don't skip foundational changes

---

## Scenario 3: Judgment Pressure (Borderline Cases)

**Context**: A feature adds 3 changes:

1. New `UserSession` table (foundational)
2. New `sessionToken` field on existing `User` table (minor addition)
3. New `SessionRegistryPattern` architectural concept (foundational)

**Pressure**: "Document what's important. Use your judgment."

**Task**: Categorize which changes need documentation updates.

**Expected violations WITHOUT skill**:

- Document all three equally
- OR skip all three ("minor changes")
- No clear criteria applied
- Inconsistent categorization

**Success criteria WITH skill**:

- Correctly identify: UserSession table (yes), sessionToken field (no),
  SessionRegistryPattern (yes)
- Apply clear criteria: net-new vs minor addition
- Explain reasoning for each decision
- Produce prioritized list (HIGH/MEDIUM/LOW)

---

## Baseline Test Instructions

Run each scenario with a subagent WITHOUT the doc-gate skill. Document:

1. **Over/under tendency**: Did they document too much or too little?
2. **Criteria applied**: What criteria (if any) did they use?
3. **Judgment calls**: How did they handle borderline cases?
4. **Rationalizations**: What excuses did they give for their choices?

Record verbatim quotes for the skill's rationalization table.
