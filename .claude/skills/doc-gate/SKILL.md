---
name: doc-gate
description: Use when completing a feature to identify documentation updates - prevents over-documentation of implementation details while ensuring foundational changes (new patterns, architectural concepts, behavior changes) are captured
model: claude-sonnet-4-5-20250929
context:fork
---

# Documentation Gate

## Overview

**Document foundational changes. Skip implementation details.** A feature that
adds 6 tables might only need 2 documented - the ones that represent new
patterns or architectural concepts.

## When to Use

- After completing feature implementation, before PR
- When spec introduces new patterns, tables, or services
- To determine which docs need updates (and which don't)

## Documentation Analysis Workflow

**Run systematic documentation gap analysis:**

```
Skill: code-search

Analyze changes for documentation needs using doc-changes.md checklist.

Scope (review all changes from feature):
- Foundational changes (new patterns, concepts, behavior changes, breaking changes, workflows)
- Clarifications (fixing outdated info, improving explanations, adding examples, correcting errors)
- Implementation details (internal code, private APIs, temporary solutions)
- Over-documentation signals (obvious code, duplicating comments, standard patterns)
- Documentation targets (CLAUDE.md, README, architecture docs, API docs, migration guides)
- Quality criteria (concise, functional examples, links work, versioning clear, audience identified)
- Maintenance (outdated content removed, deprecated marked, versions/changelog updated)

Apply hierarchical drill-down:
1. Structure scan - new files, modified files, git diff summary
2. Interface scan - public APIs, architectural patterns, behavior changes
3. Implementation - field additions, private methods, internal helpers

Collect changes with:
- Change type (pattern, table, service, field, method)
- Foundational vs implementation detail classification
- Recommendation (DOCUMENT HIGH/MEDIUM or SKIP with reason)

Priority classification:
- HIGH: Foundational changes that block understanding
- MEDIUM: Helpful but not blocking
- SKIP: Implementation details with explicit justification
```

**Output documentation-gap-analysis.md** following "Output Artifact" format
below.

**After audit completes:** Use "Decision Criteria" below to validate
categorization.

---

## The Decision Criteria

### DOCUMENT (Net New / Foundational)

| Change Type                        | Example                        | Why Document                                      |
| ---------------------------------- | ------------------------------ | ------------------------------------------------- |
| New architectural pattern          | Session Registry Pattern       | Developers need to understand the design decision |
| New table representing a concept   | UserSession (session tracking) | Core data model others will query                 |
| New service with public API        | MFAService                     | Others will call this service                     |
| Modified behavior of existing flow | authorize() now checks MFA     | Changes how core feature works                    |
| New environment variable           | MFA_ENCRYPTION_KEY             | Deployment will fail without it                   |

### DON'T DOCUMENT (Minor / Implementation Detail)

| Change Type                    | Example                 | Why Skip                                       |
| ------------------------------ | ----------------------- | ---------------------------------------------- |
| New field on existing table    | lockout_until on User   | Minor addition, doesn't change table's purpose |
| Helper functions               | generateBackupCodes()   | Internal implementation detail                 |
| Email templates                | MFA reset email content | Self-documenting from code/templates           |
| Feature-specific test patterns | How to mock TOTP        | Belongs in test files, not docs                |
| Private methods                | \_validateTOTPCode()    | Not called externally                          |

**Note on fields**: If a field supports a concept that IS documented (e.g.,
`sessionToken` supports SessionRegistryPattern), document the concept, not the
field. Fields are implementation details of concepts.

## The Test: "Would Another Developer Need This?"

For each change, ask:

1. Would someone building a DIFFERENT feature need to know this?
2. Does this change HOW the system works, not just WHAT it does?
3. Is this a pattern they'd want to follow?

**YES to any → Document** **NO to all → Skip**

## Anti-Patterns to Avoid

| Anti-Pattern                  | Example                                            | Fix                                              |
| ----------------------------- | -------------------------------------------------- | ------------------------------------------------ |
| Documenting every table       | "Spec adds 6 tables so update database.md 6 times" | Only document tables that represent new concepts |
| Documenting email templates   | "Add Security Email Templates section"             | Email templates are in code, not docs            |
| Feature-specific testing docs | "Add MFA Testing Strategy to testing.md"           | Testing guidance belongs in test files           |
| Counting lines as progress    | "660-830 lines of documentation"                   | Line count doesn't equal value                   |

## Red Flags - STOP

These thoughts mean you're over-documenting:

| Thought                                              | Reality                                                        |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| "Better to over-document than under-document"        | Wrong. Over-documentation obscures important info.             |
| "Spec introduces 6 tables, so 6 doc updates"         | Tables ≠ concepts. Count concepts, not tables.                 |
| "Need to document the templates/events"              | Templates are code. They document themselves.                  |
| "Testing section requires feature-specific guidance" | Put testing patterns in test files, not docs.                  |
| "Document everything to be thorough"                 | Thoroughness = documenting the RIGHT things, not ALL things.   |
| "This field represents system behavior"              | Fields support concepts. Document the concept, not each field. |
| "Fields affect security so must be documented"       | Security concepts yes. Individual columns no.                  |

## Output Artifact

Produce `documentation-gap-analysis.md` with:

1. **HIGH Priority** - Foundational changes that block understanding
   - New patterns, architectural decisions
   - Core behavior modifications
   - Required environment configuration

2. **MEDIUM Priority** - Helpful but not blocking
   - New services with public APIs
   - Integration points

3. **SKIP** - Explicitly list what you're NOT documenting and why
   - Field additions (minor)
   - Implementation details
   - Feature-specific test patterns

**Include SKIP section.** Justifying what you don't document proves judgment.

## Example: Correct Analysis

Feature: Enhanced Login (MFA + Sessions + Lockout)

**Changes made:**

- New UserSession table
- New sessionToken field on User
- New MFAService class
- New lockout_until field on User
- New SessionRegistryPattern
- Modified authorize() function

**Correct categorization:**

| Change                   | Category          | Reason                                              |
| ------------------------ | ----------------- | --------------------------------------------------- |
| UserSession table        | DOCUMENT (HIGH)   | New concept: session tracking separate from JWT     |
| sessionToken field       | SKIP              | Minor field addition, doesn't change User's purpose |
| MFAService class         | DOCUMENT (MEDIUM) | Public service others may call                      |
| lockout_until field      | SKIP              | Minor field addition                                |
| SessionRegistryPattern   | DOCUMENT (HIGH)   | New architectural pattern                           |
| authorize() modification | DOCUMENT (HIGH)   | Changes core auth behavior                          |

**Result: 4 items documented, 2 skipped.**

## Common Mistakes

| Mistake                             | Fix                                                          |
| ----------------------------------- | ------------------------------------------------------------ |
| Counting tables instead of concepts | Ask "is this a new concept?" not "is this a new table?"      |
| Adding feature-specific test docs   | Put testing patterns where tests are: in test files          |
| Documenting email content           | Email templates are code. Link to template, don't duplicate. |
| Recommending 8+ doc updates         | If > 5, you're likely over-documenting. Re-evaluate.         |
