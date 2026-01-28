---
name: code-search
description:
  Use when reviewing, auditing, or verifying code implementation against
  requirements, standards, or checklists - applies to security reviews, feature
  verification, MFA audits, compliance checks. ALWAYS use instead of spawning
  multiple Explore agents. Provides 60-75% token reduction through hierarchical
  drill-down, LSP-first navigation, and embedded checklists.
model: claude-sonnet-4-5-20250929
---

# Code Search

## Overview

**Structured code verification using checklists and LSP navigation.**

This skill searches and audits CODE (not documentation). For documentation
search, use `doc-search` skill.

Code search answers: "Do these specific things exist and connect correctly?" -
not "How does X work?"

## When to Use

- Verifying feature implementation against requirements
- Security or compliance review
- Pre-commit code review
- Comparing implementation to spec/standards
- Any task where you'd otherwise spawn multiple Explore agents

**Never use Explore agents for audits.** This skill replaces broad exploration
with targeted verification.

## Execution Strategy

### 1. Hierarchical Drill-Down

```
Level 1: Structure scan (2k tokens)
         └─ File names, directories, exports
         └─ STOP if question answered
              ↓
Level 2: Interface scan (10k tokens)
         └─ Types, signatures, route definitions
         └─ STOP if question answered
              ↓
Level 3: Implementation (20k tokens)
         └─ Only for flagged items
```

**Most audit questions resolve at Level 1-2.** Never jump to Level 3 first.

### 2. LSP-First Navigation

| Instead of...              | Use...                        |
| -------------------------- | ----------------------------- |
| `Grep` for function name   | `mcp__cclsp__find_definition` |
| `Glob` + `Read` many files | `mcp__cclsp__find_references` |
| Exploring to find usages   | `mcp__cclsp__incomingCalls`   |

LSP returns exact locations. One targeted read vs. scanning files.

#### Extended Efficiency Patterns

| Task                 | Tool                                         | Parameters                                         |
| -------------------- | -------------------------------------------- | -------------------------------------------------- |
| Check existence only | `Grep`                                       | `output_mode: "files_with_matches", head_limit: 1` |
| Scan file structure  | `mcp__cclsp__documentSymbol`                 | Returns functions/classes without reading content  |
| Batch file reads     | `mcp__filesystem__read_multiple_files`       | One call vs. many sequential reads                 |
| Skip large files     | `mcp__filesystem__list_directory_with_sizes` | Filter before reading                              |
| Existence + count    | `Grep`                                       | `output_mode: "count", head_limit: 10`             |

**Level 1 optimization**: Use `documentSymbol` to scan file structure before
reading content. Returns all exports, classes, and functions with zero content
tokens.

### 3. Diff-Based Scoping

For feature audits on branches:

```bash
git diff main...HEAD --name-only
```

Audit only changed files. 50 files becomes 8.

### 4. Checklist Verification

**Contract-style questions:**

```
[ ] Field X exists in schema
[ ] Endpoint Y exists at correct path
[ ] Component Z imports from correct location
[ ] Validation occurs before operation
```

Each is a targeted lookup. Load checklist from `checklists/` subdirectory.

### 5. Single Orchestrator

**Never spawn parallel Explore agents for audits.**

```
You (orchestrator)
    ↓
Targeted file reads (not agents)
    ↓
Synthesize findings
```

No agent spawn overhead. No overlapping context. One coherent view.

### 6. Scope Boundaries

Define explicit file patterns before starting:

```yaml
frontend:
  include: ['apps/web/src/**/auth/**']
  exclude: ['**/*.test.*']
api:
  include: ['apps/api/src/routes/auth*']
database:
  include: ['packages/database/prisma/schema.prisma']
```

No wandering outside boundaries.

## Quick Reference

| Audit Type       | Load Checklist                   | Primary Scope              |
| ---------------- | -------------------------------- | -------------------------- |
| MFA              | `checklists/mfa.md`              | auth routes, User model    |
| Authentication   | `checklists/authentication.md`   | auth/, session, middleware |
| API Security     | `checklists/api-security.md`     | routes/, middleware/       |
| Input Validation | `checklists/input-validation.md` | schemas/, validators/      |

## Evidence Collection

For each checklist item, record:

```
[x] Item description
    Location: file:line
    Evidence: <paste relevant code snippet>
```

Paste proof, not summaries. This prevents false "verified" claims.

## Common Mistakes

| Mistake                         | Fix                                           |
| ------------------------------- | --------------------------------------------- |
| Spawning 5 Explore agents       | Use single orchestrator pattern               |
| Researching standards online    | Use embedded checklists                       |
| Reading entire files            | Use LSP to find exact locations               |
| Overlapping agent scopes        | Define explicit boundaries first              |
| Starting at implementation      | Start at structure (Level 1)                  |
| Summarizing instead of evidence | Paste actual code/output                      |
| Sequential file reads           | Use `read_multiple_files` for batching        |
| Grep returning full content     | Use `output_mode: "files_with_matches"` first |

## Anti-Patterns

**"Let me explore the codebase to understand..."** No. Use checklist. Each item
is a targeted verification.

**"I'll spawn agents to research best practices..."** No. Best practices are
embedded in checklists. Zero research tokens.

**"Let me read through all the auth files..."** No. LSP-first. Find specific
definitions and references.
