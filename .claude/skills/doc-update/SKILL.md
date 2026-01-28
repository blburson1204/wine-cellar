---
name: doc-update
description:
  Systematic documentation maintenance when modifying core components - uses
  doc-search to find affected docs, classifies impact
  (Critical/Important/Review), proposes updates with diffs, creates TodoWrite
  tasks
---

# Documentation Update Workflow

**Purpose**: Ensure documentation stays synchronized with code changes through
systematic impact analysis.

## When to Use This Skill

Use this skill when:

- Creating NEW components (Service Modules, API endpoints, packages)
- MODIFYING existing components (adding fields, changing behavior, refactoring)
- DELETING components (removing features, deprecating APIs)
- Changing architectural patterns or workflows
- Adding or removing dependencies

**Trigger**: After completing code changes, BEFORE claiming task complete.

## The Workflow

### Step 1: Context Analysis

Identify what's changing:

```
Questions to answer:
- What files are being modified/created/deleted?
- What system component is this? (Service Module, API endpoint, database schema, UI component, etc.)
- What's the nature of the change? (NEW, MODIFIED, DELETED)
- What are the key terms to search for? (component name, related concepts)
```

**Example**:

- Files:
  `packages/services/src/contract-awards/ContractAwardEnrichmentService.ts`
- Component: Service Module
- Change: NEW
- Search terms: "ContractAwardEnrichmentService", "Service Module", "contract
  awards"

### Step 2: Documentation Discovery

**Use the doc-search skill** to find potentially affected documentation.

```
Invoke: Skill: doc-search

Pass the component name and related terms as search queries.
```

**What to search for**:

| Component Type  | Search Terms                     | Expected Doc Types                          |
| --------------- | -------------------------------- | ------------------------------------------- |
| Service Module  | Service name, "Service Module"   | architecture.md, architecture.md, CLAUDE.md |
| API Endpoint    | Endpoint path, "API"             | api/\*.md, architecture.md                  |
| Database Schema | Model name, "Prisma", "database" | database.md, architecture.md                |
| UI Component    | Component name, "@retryvr/ui"    | design-system.md                            |
| Job/ETL         | Job name, "data pipeline"        | data-pipeline/_.md, jobs/_.md               |

**Example doc-search invocation**:

```
User context: Created ContractAwardEnrichmentService (Service Module)

Search queries:
1. "Service Module" → Find inventory docs listing service modules
2. "ContractAwardEnrichmentService" → Find any existing references
3. "contract awards" → Find related domain documentation
```

### Step 3: Impact Assessment

For each document found, assess impact:

**Impact Classification**:

| Level         | Definition                                       | When to Use                                                      | Action                         |
| ------------- | ------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------ |
| **CRITICAL**  | Documentation MUST be updated for accuracy       | Schema docs, field inventories, core contracts, package listings | TodoWrite task (blocking)      |
| **IMPORTANT** | Documentation SHOULD be updated for completeness | Architecture overviews, integration guides, workflow docs        | TodoWrite task (high priority) |
| **REVIEW**    | Documentation MAY need updates                   | Related docs that might mention the component                    | Manual review, no task         |
| **NO IMPACT** | Changes don't affect this doc                    | Unrelated documentation                                          | Skip, explain why              |

**CRITICAL Examples**:

- Adding Service Module → Update `architecture.md` inventory
- Adding API endpoint → Update `api/*.md` endpoint list
- Adding database field → Update schema documentation
- New data pipeline job → Update `data-pipeline/architecture.md`

**IMPORTANT Examples**:

- New Service Module → Update `architecture.md` Service Modules section
- API behavior change → Update integration guides
- New workflow → Update `CLAUDE.md` workflows

**REVIEW Examples**:

- Service Module uses new pattern → Check if pattern docs exist
- Related feature documentation → Verify mentions are still accurate

**NO IMPACT Examples**:

- Adding Service Module → Unrelated UI documentation
- Database change → Deployment documentation (unless deployment process changes)

### Step 4: Update Recommendations

For each CRITICAL or IMPORTANT document:

1. **Read the document** to understand current content
2. **Identify the specific section** needing updates (quote the heading)
3. **Explain WHY** this section needs updating
4. **Propose the change** with before/after context

**Template**:

```markdown
## [Document Path]

**Section**: [Heading or line range] **Impact**: CRITICAL | IMPORTANT
**Reason**: [Why this doc needs updating - be specific]

**Current state**:

> [Quote relevant section if it exists, or state "No mention of X"]

**Proposed update**:

> [Specific change to make, or new content to add]
```

### Step 5: TodoWrite Integration

Create TodoWrite tasks for CRITICAL and IMPORTANT documentation updates.

**Task format**:

```json
{
  "content": "Update [document] - [brief description]",
  "status": "pending",
  "activeForm": "Updating [document] - [brief description]"
}
```

**Example**:

```json
{
  "content": "Update architecture.md - Add ContractAwardEnrichmentService to services/ inventory",
  "status": "pending",
  "activeForm": "Updating architecture.md - Add ContractAwardEnrichmentService to services/ inventory"
}
```

**IMPORTANT**: These tasks are BLOCKING. The work is not complete until:

- Critical documentation is updated, OR
- User explicitly acknowledges skipping (with reason)

## Rationalization Counters

### ❌ "CLAUDE.md forbids creating documentation files"

**Reality**: CLAUDE.md forbids **creating NEW markdown files**, not **updating
EXISTING documentation**.

```
CLAUDE.md says:
"NEVER proactively create documentation files (*.md) or README files."

This means:
✅ Update architecture.md with new service → ALLOWED (existing file)
✅ Update architecture.md with new pattern → ALLOWED (existing file)
❌ Create new-feature-explained.md → FORBIDDEN (new file)
```

**When updating existing docs IS appropriate**:

- Adding entries to inventories (architecture.md, api endpoint lists)
- Updating sections in existing docs (architecture.md sections)
- Fixing inaccuracies caused by code changes
- Maintaining synchronization between code and docs

### ❌ "Documentation is not required for the service to function"

**Reality**: Operational documentation serves different purposes than code.

| Purpose             | Code                              | Documentation                    |
| ------------------- | --------------------------------- | -------------------------------- |
| Make it work        | ✅ Required                       | ❌ Not needed                    |
| Find what exists    | ❌ Requires knowing where to look | ✅ Inventories (architecture.md) |
| Understand patterns | 🟡 Implicit                       | ✅ Explicit (architecture.md)    |
| Onboard developers  | 🟡 Read all code                  | ✅ Read index docs               |

**Documentation types**:

- **Inventory docs** (architecture.md): What exists in the codebase
- **Architecture docs**: Patterns and principles
- **Workflow docs** (CLAUDE.md): How to develop
- **API docs**: Public contracts

Code comments ≠ operational documentation.

### ❌ "Token budget guidelines - avoid duplication"

**Reality**: Updating an inventory entry is NOT duplication.

**Duplication** (forbidden):

```markdown
## ContractAwardEnrichmentService

This service enriches contract awards. It takes a PrismaClient and Logger in the
constructor. The enrichContractAward method takes an awardId string and returns
a promise...
```

**Inventory** (required):

```markdown
## packages/services/

- `ContractAwardEnrichmentService` - Enriches contract award data
```

**Token budget applies to**:

- ❌ Creating verbose new documentation
- ❌ Duplicating code comments in docs
- ❌ Over-explaining standard patterns

**Token budget does NOT prevent**:

- ✅ Adding one line to an inventory
- ✅ Updating a section heading
- ✅ Fixing inaccurate documentation

### ❌ "Trust the workflow - if docs needed updating, it would be in the spec"

**Reality**: This IS the workflow. Identifying doc impacts IS the job.

**Circular reasoning**:

```
"If documentation updates were needed, they would be in the plan"
    ↓
"I don't see doc updates in the plan"
    ↓
"Therefore, docs don't need updating"
    ↓
[Documentation drifts out of sync]
```

**Correct reasoning**:

```
"I'm creating a Service Module"
    ↓
"Use doc-update skill to identify doc impacts"
    ↓
"Found: architecture.md, architecture.md need updates"
    ↓
"Create TodoWrite tasks for these updates"
    ↓
[Documentation stays synchronized]
```

**The spec can't predict all doc impacts** - that's why this skill exists.

### ❌ "Code discoverability - IntelliSense will surface the service"

**Reality**: IDE autocomplete ≠ documentation. Different purposes.

| Tool            | Purpose                              | Example                              |
| --------------- | ------------------------------------ | ------------------------------------ |
| IntelliSense    | "What can I import here?"            | Shows exported symbols               |
| architecture.md | "What Service Modules exist?"        | Lists all services with descriptions |
| architecture.md | "What's the Service Module pattern?" | Explains the architectural pattern   |

**IntelliSense shows**:

- What's exported
- Type signatures
- JSDoc comments

**Documentation shows**:

- What exists (inventory)
- Why it exists (purpose)
- How it fits (architecture)
- When to use it (patterns)

**Both are needed**. IntelliSense helps during coding, docs help during learning
and planning.

### ❌ "I would only update docs if explicitly asked"

**Reality**: Identifying documentation impacts IS the job, not waiting to be
asked.

**Passive approach** (wrong):

```
User: "Create ContractAwardEnrichmentService"
Agent: [Creates service]
Agent: "Done! Let me know if you need anything else"
User: [Weeks later] "Where's the list of all our services?"
User: [Manually updates architecture.md after discovering drift]
```

**Active approach** (correct):

```
User: "Create ContractAwardEnrichmentService"
Agent: [Creates service]
Agent: [Uses doc-update skill]
Agent: "I've identified 2 docs needing updates: architecture.md (CRITICAL), architecture.md (IMPORTANT)"
Agent: [Creates TodoWrite tasks]
Agent: "Updating documentation now..."
```

**Analogy**: If you add a book to a library, you update the catalog. You don't
wait for the librarian to ask you to update the catalog.

## Anti-Patterns (Don't Do This)

### ❌ Skipping Documentation Under Time Pressure

**Scenario**: "Quick task, just need the code working"

**Rationalization**: "No time for docs, we can update them later"

**Reality**: Later never comes. Documentation debt accumulates.

**Correct approach**: Documentation updates take <2 minutes for inventory
entries. Just do it.

### ❌ Skipping Documentation Due to Sunk Cost

**Scenario**: "We're 90% done, don't want to add doc tasks now"

**Rationalization**: "Adding doc tasks will delay completion"

**Reality**: The work isn't done until docs are updated. 90% complete code + 0%
updated docs = incomplete.

**Correct approach**: Identify doc impacts early (during planning), but if
discovered late, still create TodoWrite tasks.

### ❌ Skipping Documentation Due to Authority

**Scenario**: "User didn't mention docs, so they don't want them updated"

**Rationalization**: "If they wanted docs updated, they would have said so"

**Reality**: Users assume docs will be maintained. Silence ≠ "skip docs".

**Correct approach**: Proactively identify doc impacts. If user explicitly says
"skip docs", ask for confirmation and document the decision.

### ❌ Minimizing Scope to Avoid Documentation

**Scenario**: "It's just one small service"

**Rationalization**: "This change is too small to warrant doc updates"

**Reality**: Inventory docs need ALL components listed, not just "big" ones.

**Correct approach**: Size of code change ≠ doc impact. A one-line addition to
architecture.md is still required.

### ❌ Skipping Documentation Due to Exhaustion

**Scenario**: "This is iteration 5, just get it working"

**Rationalization**: "We've been at this for a while, let's just finish and
worry about docs later"

**Reality**: Exhaustion doesn't eliminate the need for doc synchronization.
"Later" becomes "never".

**Correct approach**: Documentation updates are part of completion. Not done
until docs are synchronized, regardless of iteration count.

### ❌ Claiming "Self-Documenting Code" as Sufficient

**Rationalization**: "The code is well-commented and uses clear names, so docs
aren't needed"

**Reality**: Code documents HOW, documentation documents WHAT and WHY.

**Correct approach**: Good code + good docs. Both serve different audiences and
purposes.

## Quick Reference

```
1. Context Analysis: What changed? (NEW/MODIFIED/DELETED)
   ↓
2. Documentation Discovery: Skill: doc-search [component-name]
   ↓
3. Impact Assessment: Classify each doc (Critical/Important/Review/None)
   ↓
4. Update Recommendations: Read docs, propose specific changes
   ↓
5. TodoWrite Integration: Create blocking tasks for Critical/Important
```

## Common Patterns

### New Service Module

```
Context: Created FooService in packages/services/
Search: "Service Module", "FooService"
Expected impacts:
  - architecture.md (CRITICAL) - Add to services/ inventory
  - architecture.md (IMPORTANT) - May need pattern update
  - CLAUDE.md (REVIEW) - Check Service Module examples
```

### New API Endpoint

```
Context: Added POST /api/v1/foo endpoint
Search: "API", "/api/v1", "endpoints"
Expected impacts:
  - docs/technical/api/endpoints.md (CRITICAL) - Document endpoint
  - docs/technical/api/authentication.md (REVIEW) - Check auth requirements
  - architecture.md (REVIEW) - Check API patterns section
```

### Database Schema Change

```
Context: Added field `status` to Opportunity model
Search: "Opportunity", "schema", "database"
Expected impacts:
  - docs/technical/database.md (CRITICAL) - Update schema docs
  - docs/product/requirements/*.md (REVIEW) - Check if mentioned
  - CLAUDE.md (REVIEW) - Check database examples
```

### New Data Pipeline Job

```
Context: Created awards-collection.service.ts job
Search: "data pipeline", "jobs", "awards"
Expected impacts:
  - docs/technical/data-pipeline/architecture.md (CRITICAL) - Add to jobs inventory
  - docs/technical/data-pipeline/jobs/awards-collection.md (NO IMPACT) - This would be a NEW file (forbidden)
  - docs/technical/integrations.md (IMPORTANT) - Document data source
```

## Checklist

Before claiming work complete:

- [ ] Ran doc-update skill to identify doc impacts
- [ ] Used doc-search to find potentially affected docs
- [ ] Classified each doc as Critical/Important/Review/None
- [ ] Created TodoWrite tasks for Critical and Important docs
- [ ] Updated documentation OR explicitly acknowledged skipping with user
      approval
- [ ] Verified no inventory docs are outdated (architecture.md, API lists, etc.)

## See Also

- **Skill: doc-search** - Primitive for finding documentation
- **Skill: code-search** - Code search and verification
- **.claude/skills/update-documentation/checklists/doc-changes.md** -
  Categorization checklist
