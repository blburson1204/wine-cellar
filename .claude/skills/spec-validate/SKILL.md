---
name: spec-validate
description: Use when running /plan to validate spec completeness BEFORE planning - checks data flows, external API error handling, env vars, migration safety, and cross-references domain skills based on spec content
model: claude-sonnet-4-5-20250929
context:fork
---

# Spec Thoroughness Validation

## Overview

Pre-planning gate that catches "connective tissue" gaps - missing integration
points, error handling, and observability requirements. Validates specs are
complete enough for reliable implementation.

**Core Principle:** Specs missing specific evidence for integrations WILL cause
implementation bugs. Catch them now.

## When to Use

**MANDATORY**: Invoked automatically by `/plan` before planning begins.
**Manual**: `Skill: spec-thoroughness [spec-number]` for retroactive validation.

## Spec Completeness Audit Workflow

**Run systematic spec completeness validation:**

```
Skill: code-search

Validate spec completeness using spec-completeness.md checklist.

Scope:
- Problem statement (clearly defined, pain points, business impact, users affected)
- Requirements (functional, non-functional, success criteria, out of scope)
- Technical details (data model, API contracts, external dependencies, performance)
- External system integration (APIs documented, auth, error handling, rate limits, quota protection)
- Data flows (inputs, transformations, outputs, error paths)
- Environment variables (all vars listed, defaults, SSM parameters, secrets)
- Observability (logging, metrics, alerts, dashboards)
- Performance requirements (p50/p95/p99 targets, load testing, timeouts, degradation)
- Migration safety (type, rollback, data integrity, zero-downtime)
- Testing strategy (test types, counts, mocking, HIGH-RISK API identification, E2E limits)

Apply hierarchical drill-down:
1. Structure scan - sections present, tier organization
2. Interface scan - integration points, data flows, dependencies
3. Implementation - specific values, error codes, column sizes, env vars

Collect evidence with:
- BLOCKING issues (vague language, missing specifics)
- CRITICAL issues (missing migration safety, missing performance targets)
- ADVISORY issues (missing similar patterns, lessons learned)

Priority classification:
- BLOCKING (Tier 1): Cannot proceed without specifics
- CRITICAL (Tier 2): Require acknowledgment
- ADVISORY (Tier 3): Display, continue
```

**Output validation report** following "Output Format" section below.

**After audit completes:** Apply "Validation Tiers" below for red flag
detection.

---

## Validation Tiers

### Tier 1: BLOCKING (Cannot Proceed)

Spec MUST document these with **specific evidence**:

**1.1 External System Integration**

```
[ ] External systems named: [LIST EACH]
[ ] Error codes per system: [SPECIFIC codes, not "handle errors"]
[ ] Retry strategy: [attempts, backoff formula, max timeout]
[ ] Rate limiting: [specific limits or "none documented"]
```

**1.2 Data Flow Matrix**

```
[ ] Each data transformation named with source → destination
[ ] Database transaction boundaries defined
[ ] Failure modes: what if step N fails after step N-1 succeeds?
```

**1.3 Environment Variables**

```
[ ] New env vars listed with example values
[ ] SSM parameter paths for secrets (staging/production)
```

**1.4 External Data Sources** (when storing data from external APIs)

```
[ ] Upstream field lengths documented with source link
[ ] Column sizes justified against upstream data model
[ ] Data Model table in spec (see format below)
```

**Data Model Table Format** (required when spec stores external API data):

```markdown
| External Field | Upstream Type       | Our Column  | Rationale             |
| -------------- | ------------------- | ----------- | --------------------- |
| recipient_hash | TEXT (unbounded)    | TEXT        | Match upstream        |
| recipient_uei  | 12 chars (GSA spec) | VARCHAR(20) | Standard + buffer     |
| zip5           | TEXT (unbounded)    | VARCHAR(20) | Handle malformed data |
```

**Column Sizing Rules**:

- External unbounded (TEXT) → Use TEXT (preserve all data)
- External bounded → VARCHAR(upstream_limit + 50% buffer)
- Internal controlled → VARCHAR(exact_size)

**Research Required**: Link to upstream API documentation or database schema
showing field constraints.

**Red Flags (Auto-BLOCKING)**: | Phrase | Problem | |--------|---------| |
"standard error handling" | No specific codes | | "retry with backoff" | No
config values | | "handle gracefully" | No failure mode defined | | "VARCHAR(N)"
without justification | No upstream research for external data | | "store API
response fields" | No data model table with column sizes |

### Tier 2: CRITICAL (Require Acknowledgment)

**2.1 Migration Safety** (if changing existing behavior)

- Rollback procedure
- Backward compatibility strategy
- Dual-implementation transition plan

### Tier 3: ADVISORY (Display, Continue)

- Similar feature patterns identified
- Lessons learned from related specs

## Domain Skill Cross-Reference

Based on spec content, invoke these automatically:

| Spec Contains      | Invoke                      |
| ------------------ | --------------------------- |
| API endpoints      | `Skill: spec-api-contracts` |
| Permissions, roles | `Skill: security-rbac`      |
| Database changes   | `Skill: db-prisma`          |

## Output Format

```yaml
spec_thoroughness:
  spec: '[spec-id]'
  result: BLOCKING | CRITICAL | PASS
  tier1_blocking: [{ issue, location, fix }]
  tier2_critical: [{ issue, domain_skill }]
  proceed_to_plan: NO | ACKNOWLEDGE | YES
```

## Quick Reference

Before `/plan` proceeds, spec MUST have:

```
[ ] Named external systems with error codes
[ ] Data flow with transaction boundaries
[ ] Env vars listed (or "none required")
[ ] Data Model table with column sizes (if storing external API data)
```

**Vague language = BLOCKING. Specific evidence = PASS.**

## Example: External Data Sources Validation

**BLOCKING** - Spec says "store recipient data from USAspending API" without:

- Data Model table showing column sizes
- Link to USAspending data dictionary
- Justification for VARCHAR limits

**PASS** - Spec includes:

```markdown
## Data Model

Reference:
[USAspending GitHub](https://github.com/fedspendingtransparency/usaspending-api)

| External Field | Upstream Type  | Our Column  | Rationale                |
| -------------- | -------------- | ----------- | ------------------------ |
| recipient_hash | TEXT           | TEXT        | Match upstream unbounded |
| recipient_uei  | 12 chars (GSA) | VARCHAR(20) | Standard + buffer        |
| zip5           | TEXT           | VARCHAR(20) | Handle malformed data    |
```
