---
parent: arch
name: DECISION-FRAMEWORK
---

# Decision Framework

## ADR Template

```markdown
## ADR-[NUMBER]: [TITLE]

**Status:** proposed | accepted | deprecated | superseded by ADR-X **Date:**
YYYY-MM-DD **Context:** [One sentence on what prompted this decision]

### Decision Drivers

- [What forces are at play?]
- [What constraints exist?]

### Options Considered

#### Option 1: [Name]

- **What**: [Brief description]
- **Pros**: [Benefits]
- **Cons**: [Drawbacks]
- **Effort**: S/M/L
- **Reversibility**: Easy/Medium/Hard
- **Maintenance**: Low/Medium/High

#### Option 2: [Name]

[Same structure]

#### Option 3: Do Nothing

- **What**: Keep current approach
- **Pros**: No work, no risk
- **Cons**: [Why this prompted the decision]
- **Effort**: None
- **Reversibility**: N/A

### Decision

[Which option and why]

### Consequences

- [What changes]
- [What debt incurred, if any]
- [What's now possible/impossible]
```

## Evaluation Criteria

### For Solo Developer Context

**Prioritize (in order):**

1. **Debuggability** - Can you fix it at 2am after 3 weeks away?
2. **Simplicity** - Fewer moving parts = fewer failure modes
3. **Familiarity** - Known tech > "better" unknown tech
4. **Reversibility** - Can you undo this decision easily?
5. **Maintenance burden** - Does this need constant attention?

**Deprioritize:**

- Theoretical scalability (solve when you have the problem)
- "Best practices" designed for large teams
- Feature completeness (build what you need now)

### Tradeoff Matrix

| Choice               | Simplicity | Reversibility | Maintenance | When to Choose       |
| -------------------- | ---------- | ------------- | ----------- | -------------------- |
| Built-in AWS feature | +++        | +++           | +++         | Always check first   |
| Managed service      | ++         | ++            | ++          | When it fits well    |
| Simple custom code   | +          | ++            | +           | Small, focused needs |
| Complex custom code  | -          | -             | --          | Last resort          |
| Multiple services    | --         | --            | ---         | Almost never         |

## Project-Specific Considerations

### Constitution Compliance Check

Before any significant decision:

- [ ] Does this follow TDD principles?
- [ ] Does this respect portal boundaries?
- [ ] Does this use the design system?
- [ ] Does this follow API versioning?
- [ ] Does this use feature toggles appropriately?

### Infrastructure Decision Checklist

From Constitution Principle XII (Pre-Implementation Sanity Checks):

1. **Does the service already solve this?**
   - Check AWS/provider built-in features first
   - If provider solves it → DON'T BUILD IT

2. **What's the simplest solution?**
   - Prefer: AWS Console config > CloudWatch alarm > Lambda > Custom service

3. **Am I building a dashboard that duplicates a console?**
   - AWS Console, Stripe Dashboard exist and are maintained
   - Ask: "Will I look at this more than once a month?"

4. **What's the actual volume/frequency?**
   - Calculate: How often will this code actually run?
   - If rare → Simpler solution or manual handling is fine

5. **What's the maintenance burden?**
   - Every AWS resource needs monitoring
   - Every scheduled job can fail silently

### Simplicity Hierarchy

(From Constitution - Prefer higher options)

1. **Don't build it** - Use provider's built-in feature
2. **Configure it** - AWS Console setting, environment variable
3. **Alert on it** - CloudWatch alarm → SNS → Email
4. **Log it** - Write to existing logs, query when needed
5. **Automate simply** - Single Lambda triggered by event
6. **Build it** - Custom service (LAST RESORT)

## Common Decision Patterns

### Build vs Buy

| Question                | Build | Buy/Use Existing |
| ----------------------- | ----- | ---------------- |
| Core differentiator?    | Yes   | No               |
| Exists in ecosystem?    | No    | Yes              |
| Well-understood domain? | Yes   | No               |
| Maintenance acceptable? | Yes   | No               |

Example: Wine database/CellarTracker integration = build (core value). Auth =
buy. Email = buy.

### When to Add Abstraction

Only when:

- Same pattern appears 3+ times
- Abstraction is simpler than copies
- Interface is stable and understood
- You'd use it again within a month

### When to Create New Service/Package

Almost never. But consider if:

- Truly independent domain
- Different deployment lifecycle
- Team boundary (future)
- Completely different tech requirements

Example: a background worker is separate because it runs on a different compute
target. That's a valid reason.
