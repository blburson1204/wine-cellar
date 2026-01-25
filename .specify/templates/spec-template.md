---
# Context Optimization Metadata
meta:
  spec_id: null # Populated from branch name
  spec_name: null # Populated from feature name
  status: draft # draft | in-progress | approved | completed
  phase: specify # specify | plan | tasks | implement | verify
  created: null # ISO date
  updated: null # ISO date

# Quick Reference (for checkpoint resume)
summary:
  goals: [] # [{id: G1, description: "...", priority: HIGH}]
  constraints: [] # [{id: C1, description: "...", type: TECHNICAL}]
  decisions: [] # [{id: D1, decision: "...", rationale: "..."}]

# CRITICAL REQUIREMENTS - Must verify during implementation
critical_requirements:
  type: null # bugfix | feature-minor | feature-major | config | documentation | refactoring
  ui_changes: null # none | minor | moderate | major
---

# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]` **Created**: [DATE] **Status**: Draft
**Input**: User description: "$ARGUMENTS"

---

## Quick Guidelines

- Focus on WHAT users need and WHY
- Avoid HOW to implement (no tech stack, APIs, code structure)
- Written for understanding requirements, not implementation details

### Section Requirements

- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation

When creating this spec from a user prompt:

1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for
   any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something, mark it
3. **Think like a tester**: Every vague requirement should fail the "testable
   and unambiguous" checklist item
4. **Common underspecified areas**:
   - User interaction flows
   - Data validation rules
   - Error handling behaviors
   - Performance expectations
   - Edge cases and boundary conditions

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

[Describe the main user journey in plain language]

### Acceptance Scenarios

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

### Edge Cases

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST [specific capability]
- **FR-002**: System MUST [specific capability]
- **FR-003**: Users MUST be able to [key interaction]
- **FR-004**: System MUST [data requirement]
- **FR-005**: System MUST [behavior]

_Example of marking unclear requirements:_

- **FR-006**: System MUST [NEEDS CLARIFICATION: requirement not specified]

### Key Entities _(include if feature involves data)_

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

### Test Strategy _(mandatory)_

_Determines test types and approach at spec time_

**Test Type Classification**: | FR | Primary Test Type | Reason |
|----|-------------------|--------| | FR-001 | [Unit/Integration/E2E] |
[rationale] | | FR-002 | [Unit/Integration/E2E] | [rationale] |

**This Feature**:

- Feature type: [ ] Backend-heavy [ ] Frontend-heavy [ ] Mixed
- Unit: [X]% | Integration: [X]% | E2E: [X]%

**Estimated Test Count**: [X] tests based on [Y] functional requirements

### Error Handling & Recovery _(mandatory if feature can fail)_

_Specifies error scenarios, user messaging, and recovery strategies upfront_

**Error Scenarios**: | Error Scenario | Type | User Message | Recovery Action |
|----------------|------|--------------|-----------------| | [scenario] |
Transient/Permanent | [user-facing message] | Retry / Fail / Queue | |
[scenario] | Permanent | [user-facing message] | Return error details |

**Resumability** _(if applicable)_:

- [ ] Operation can resume from last checkpoint?
- [ ] Idempotency guaranteed? (re-running same request is safe)

### UI/Design Reference _(include if feature has UI changes)_

**Feature Classification**:

- [ ] **Backend-only** (no UI changes) - Skip design sections
- [ ] **Minor UI** (< 3 components, existing patterns only)
- [ ] **Moderate UI** (3-7 components, some custom work)
- [ ] **Major UI** (8+ components, new views/pages, complex flows)

**Design Reference** _(required for Moderate or Major UI)_:

- Mockup/Design Source: [URL, file, or "N/A"]
- Design Components: [list components]
- Mockup covers ALL functional requirements: [ ] Yes [ ] No - gaps: [list]

---

## Review Checklist (Gate)

- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Test strategy defined
- [ ] Error handling defined (if can fail)
- [ ] UI complexity classified (if has UI)

---
