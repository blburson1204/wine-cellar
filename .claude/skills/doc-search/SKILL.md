---
name: doc-search
description:
  Use when searching for documentation related to code changes, components, or
  features - provides text-based search across docs/ and .claude/docs/ with
  semantic expansion and ranked results
---

# Search Documentation

## Overview

**Text-based documentation search for identifying docs affected by code
changes.**

This skill provides a search primitive for finding documentation files related
to specific code components, features, or changes.

## When to Use

- After making code changes (new component, modification, deletion)
- Looking for docs that reference a specific component
- Verifying documentation coverage
- Finding relevant docs before updating them

**Use this BEFORE doc-update** - this is the discovery primitive.

## Search Strategy

### 1. Start at the Index

**Always check `docs/README.md` first** - it's the master documentation index.

```bash
# Read the index to understand doc organization
Read: docs/README.md
```

The index shows:

- Documentation categories (product, technical, operations)
- What each doc file covers
- How docs are organized

Use this to guide your search.

### 2. Text-Based Search

Use **Grep** for text search across documentation:

```bash
# Search for component/feature name
Grep: pattern="ServiceModule" path="docs/" output_mode="files_with_matches"
Grep: pattern="ServiceModule" path=".claude/docs/" output_mode="files_with_matches"
```

**Search scope**:

- `docs/` - User-facing documentation (product, technical, onboarding)
- `.claude/docs/` - AI development guides
- `CLAUDE.md` - Project instructions

**Don't search**:

- `node_modules/`
- `.git/`
- `specs/` (spec-specific, not general docs)

### 3. Semantic Expansion

**Map code terms to documentation terms:**

| Code Term       | Documentation Terms                                                |
| --------------- | ------------------------------------------------------------------ |
| Service Module  | "Service Module", "Service Modules", "services/", "business logic" |
| React Component | "component", "UI component", "TailwindCSS", "design system"        |
| API Endpoint    | "API", "endpoint", "route", "/api/v1"                              |
| Database Schema | "schema", "Prisma", "database", "migration"                        |
| Authentication  | "auth", "authentication", "session", "login"                       |

**Search with variations**:

```bash
# For "ServiceModule", search:
Grep: pattern="Service Module"
Grep: pattern="services/"
Grep: pattern="business logic"
```

### 4. Ranking Strategy

**Rank results by relevance:**

1. **Exact match** - Component name appears in doc
   - Example: "ServiceModule" in architecture.md

2. **Semantic match** - Related term appears
   - Example: "services/" when searching "ServiceModule"

3. **Section match** - Doc has relevant section
   - Example: "Architecture" section in architecture.md

4. **Related** - Doc covers related topic
   - Example: API docs when searching for route changes

### 5. Common Patterns

| Code Change Type          | Likely Affected Docs                                             |
| ------------------------- | ---------------------------------------------------------------- |
| **New Service Module**    | `.claude/docs/architecture.md`, `docs/technical/architecture.md` |
| **New API Endpoint**      | `docs/technical/api/`, `CLAUDE.md` (API Versioning)              |
| **New UI Component**      | `docs/technical/design-system.md`, `CLAUDE.md` (Design System)   |
| **Database Migration**    | `.claude/docs/database.md`, `CLAUDE.md` (Database)               |
| **New Integration**       | `docs/technical/integrations.md`                                 |
| **Infrastructure Change** | `docs/technical/infrastructure/`, `.claude/docs/deployment.md`   |

Use these patterns for initial search targets.

## Output Format

**Return ranked list with evidence:**

```markdown
## Search Results for "{query}"

### Exact Matches

- `docs/technical/architecture.md` - Line 45: "Service Modules pattern"
- `.claude/docs/architecture.md` - Line 12: "packages/services/"

### Semantic Matches

- `CLAUDE.md` - Section "Service Modules Pattern"
- `docs/technical/` - Architecture overview

### Related

- `docs/onboarding/developer-guide.md` - Business logic patterns
```

**Include**:

- File path
- Match location (line number or section)
- Matched text or context

## Quick Reference

| Task                   | Command Pattern                              |
| ---------------------- | -------------------------------------------- |
| Find component docs    | `Grep: pattern="ComponentName" path="docs/"` |
| Search AI guides       | `Grep: pattern="term" path=".claude/docs/"`  |
| Check index first      | `Read: docs/README.md`                       |
| Search with variations | Multiple Grep calls with semantic terms      |
| Limit results          | `head_limit: 10`                             |

## Anti-Patterns

**"Let me just update the code, docs aren't needed"** No. Always search for
affected docs first.

**"I'll search if I think of affected docs"** No. Search systematically - you
might miss non-obvious impacts.

**"Code is self-documenting"** Code and docs serve different purposes. Both need
maintenance.

## Example: New Service Module

**Query**: "ContractAwardEnrichmentService"

**Search sequence**:

1. Read `docs/README.md` to find architecture docs
2. Grep `"Service Module"` in `docs/technical/`
3. Grep `"services/"` in `.claude/docs/architecture.md`
4. Grep `"Service Module"` in `CLAUDE.md`

**Expected results**:

- `docs/technical/architecture.md` (Service Modules section)
- `.claude/docs/architecture.md` (services/ package entry)
- `CLAUDE.md` (Service Modules Pattern)
