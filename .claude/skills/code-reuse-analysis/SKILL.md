---
name: code-reuse-analysis
description:
  Use when running /plan Phase 0.7.5 - combines reuse analysis (find existing
  patterns) and integration analysis (verify callers) into single LSP-verified
  pass with pasted evidence
model: claude-sonnet-4-5-20250929
---

# Code Interconnectedness Analysis

## Overview

**Two-in-one LSP verification for /plan Phase 0.7.5:**

1. **Reuse Check** - Does this pattern exist? (REUSE/EXTEND/DUPLICATE)
2. **Caller Verification** - Who calls existing services we'll modify?

**Core Principle:** Claims without pasted LSP output are invalid.

## When to Use

- /plan Phase 0.7.5 before generating tasks
- Before creating new services, utilities, patterns
- Before modifying any shared code

## Combined Workflow

### Step 1: Run Code Reuse & Integration Audit

**Systematic LSP-first analysis:**

```
Skill: code-search

Analyze code reuse and integration using code-reuse.md checklist.

Scope:
- Reuse analysis (workspaceSymbol search, CLAUDE.md patterns, REUSE/EXTEND/DUPLICATE decision)
- Integration verification (find_definition for location, find_references for callers, subagent cross-validation)
- Pattern discovery (similar functionality, existing services, utilities, sharable code)
- Evidence requirements (paste LSP output, document queries, list alternatives, justify decisions)
- Code quality (no duplication, shared code location, dependencies injected, types exported)
- Documentation (patterns in CLAUDE.md, API contracts, usage examples, breaking changes)

Apply hierarchical drill-down:
1. Structure scan - existing services, utilities, patterns in codebase
2. Interface scan - LSP workspaceSymbol, find_definition, find_references
3. Implementation - CLAUDE.md patterns, usage examples, caller analysis

Collect evidence with PASTED LSP OUTPUT (not summaries):
- Reuse decisions (REUSE/EXTEND/DUPLICATE with rationale)
- Integration points (service existence, ALL callers listed)
- Cross-validation (subagent count comparison)

BLOCK on: Missing LSP paste, grep used, incomplete callers, unresolved discrepancies.
```

**Output code-path-analysis.md** following "Output" format below.

### Step 2: Manual LSP Verification

```
Phase A: Reuse Analysis
  1. LSP workspaceSymbol → paste output
  2. CLAUDE.md scan → paste sections
  3. Decision: REUSE/EXTEND/DUPLICATE

Phase B: Integration Verification
  4. find_definition → paste for each claimed service
  5. find_references → paste ALL callers
  6. Subagent cross-validation → compare counts

→ BLOCKED until all steps complete with pasted output
```

---

## Phase A: Reuse Analysis

### Step A1: LSP Search

```markdown
## LSP Evidence: [ComponentName]

**Searched:** `*Logger*`, `*logging*` **Results:** \`\`\` createLogger
(packages/shared/src/logger.ts:12) LogLevel (packages/shared/src/logger.ts:5)
\`\`\`
```

### Step A2: CLAUDE.md Scan

```markdown
## CLAUDE.md Evidence

**Found in "Logging (MANDATORY)":**

> "Always use createLogger from @/services/logger"
```

### Step A3: Decision

| Decision      | When             | Requirement          |
| ------------- | ---------------- | -------------------- |
| **REUSE**     | Works as-is      | Document which code  |
| **EXTEND**    | Needs capability | Document what to add |
| **DUPLICATE** | Can't extend     | Document WHY not     |

---

## Phase B: Integration Verification

### Step B1: Verify Existence

```markdown
## LSP Verification: EmailService

**find_definition:** \`\`\` apps/api/src/services/email/email.service.ts:12
Symbol: EmailService (class) \`\`\`
```

### Step B2: Document ALL Callers

```markdown
## Callers: enrichRecord (7 total)

\`\`\`

1. apps/api/src/routes/v1/enrichment.ts:45
2. apps/api/src/services/batch.service.ts:89
3. packages/job-dispatcher/src/jobs/enrich.ts:23 [ALL callers listed] \`\`\`
```

### Step B3: Subagent Cross-Validation

```
Task tool, subagent_type: "Explore"
Prompt: "Find all callers of [method] using LSP. Report independently."
```

If counts differ → use HIGHER count, document discrepancy.

---

## Forbidden Phrases (BLOCK without proof)

- "I checked and nothing exists"
- "I verified the service exists"
- "Spec says path is X"
- "Grep is faster" (grep misses aliases)
- "I found N callers" (without paste)

---

## Output: `specs/NNN/code-path-analysis.md`

```markdown
# Code Path Analysis

## Reuse Decisions

### Component: [Name]

**LSP Evidence:** [paste] **CLAUDE.md:** [paste] **Decision:**
[REUSE/EXTEND/DUPLICATE] **Rationale:** [why]

## Integration Points

### Service: [Name]

**Verified:** [find_definition output] **Callers (N):** [find_references - ALL
listed] **Cross-Validation:** [subagent count]
```

---

## Quick Reference

**BLOCK:** Missing LSP paste, grep used, incomplete callers, unresolved
discrepancy

**PROCEED:** All searches pasted, all callers listed, decisions documented
