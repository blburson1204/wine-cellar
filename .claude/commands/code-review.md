---
model: sonnet
description:
  Audit code for constitutional compliance, security issues, and architectural
  anti-patterns
argument-hint: (scope)
---

# Code Review

Audit code for constitutional compliance, security issues, and architectural
anti-patterns.

## Instructions

Use `Skill: security-review --constitutional` to perform the review.

**Default scope:** Changed files from current branch vs main:

```bash
git diff --name-only origin/main...HEAD
```

If no changes or user specifies a different scope, review that instead.

**Process:**

1. Identify files to review
2. Run P1-P4 checks per skill
3. Output findings in format:
   ```
   [P1|P2|P3|P4] Category: Title
     Location: file:line
     Issue: What's wrong
     Fix: How to fix
   ```
4. Summary with recommended actions

**After review, user may say:**

- "Fix P1 issues" - Address blocking violations
- "Fix all" - Address everything
- "Fix [specific finding]" - Address one item
- "Continue" - Proceed (only if no P1/P2)
