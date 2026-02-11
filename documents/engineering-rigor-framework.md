# Engineering Rigor Framework for AI-Assisted Development

A practical approach to maintaining code quality, security, and reliability when
working with AI coding assistants.

## Executive Summary

This framework establishes **guardrails that feel like productivity tools**
rather than bureaucracy. The core principle: front-load friction (planning,
specs, verification) so execution is smoother and mistakes are prevented rather
than caught after the fact.

---

## Core Philosophy

### "Evidence Over Confidence, Discipline Over Speed"

Every feature goes through structured phases before implementation begins. Every
completion claim requires evidence (command output, test results), not just
assertions.

**Forbidden phrases:**

- "Should work"
- "Probably passes"
- "Looks correct"
- "I think it's fine"

If you can't prove it, you can't claim it.

### Two Interaction Models

| Model                    | When to Use                              | Human Role                  |
| ------------------------ | ---------------------------------------- | --------------------------- |
| **Developer-in-Control** | Bug fixes, small changes, sensitive code | Drives all decisions        |
| **AI-in-Driver-Seat**    | Large features, greenfield, docs/tests   | Sets goals, reviews results |

The **review gate is non-negotiable** in both models. The difference is how much
autonomy AI gets before that gate.

---

## The Four Pillars

### 1. Structured Development Workflow

```
Idea → Specify → Clarify → Analyze → Plan → Tasks → Implement
```

| Phase         | Purpose                                         |
| ------------- | ----------------------------------------------- |
| **Specify**   | Capture requirements in structured format       |
| **Clarify**   | Socratic Q&A to surface ambiguity               |
| **Analyze**   | Check spec for gaps and missing sections        |
| **Plan**      | Generate phased implementation approach         |
| **Tasks**     | Break plan into atomic, dependency-ordered work |
| **Implement** | Execute tasks with fresh context per task       |

**Why it matters:** Prevents the "just start coding" trap that leads to rework.
Ambiguity is surfaced early when it's cheap to address.

---

### 2. Verification Gates

**TDD Iron Law:** No production code without a failing test first.

The Red-Green-Refactor cycle is non-negotiable:

1. Write a failing test
2. Watch it fail (proves the test works)
3. Write minimal code to pass
4. Refactor if needed
5. Repeat

| Gate                  | What It Catches                                      |
| --------------------- | ---------------------------------------------------- |
| **TDD Enforcement**   | Tests written first, must fail before implementation |
| **Verify-Complete**   | Must show command output before claiming done        |
| **Code Review**       | Security and compliance check before commit          |
| **Spec Validation**   | Incomplete specs caught before planning              |
| **Pre-commit Hooks**  | Lint, format, type-check, commit message format      |
| **CI/CD Pipeline**    | Full test suite on every push                        |
| **ATOM Hooks**        | Stale-file edits, dangerous commands, file placement |
| **T-VERIFY Evidence** | Session blocked if verification evidence is stale    |

**Why it matters:** No "trust me, it works" - everything requires proof.

---

### 3. Systematic Problem-Solving

| Approach                   | When to Use                                              |
| -------------------------- | -------------------------------------------------------- |
| **Systematic Debug**       | Any bug: investigate → analyze → hypothesize → implement |
| **Root Cause Analysis**    | Errors deep in execution, trace backwards                |
| **Architecture Decisions** | Explicit tradeoff analysis, not gut decisions            |
| **Brainstorm**             | Socratic refinement before implementation                |

**Why it matters:** Replaces "try random things" with structured investigation.

---

### 4. Documentation as First-Class Citizen

| Document                 | Purpose                                        |
| ------------------------ | ---------------------------------------------- |
| **Project Context**      | Always-loaded instructions for AI assistant    |
| **Constitution**         | Development principles and values              |
| **Skill Manifest**       | Trigger conditions for when to use what        |
| **Error Handling Guide** | Consistent patterns across codebase            |
| **Doc Gates**            | Forces documentation updates when code changes |

**Why it matters:** Knowledge persists across sessions and team members. AI has
full context without asking.

---

## Anti-Rationalization: The 1% Rule

**If there's even a 1% chance a skill or practice applies, use it.**

Common rationalizations to reject:

- "This is too simple for TDD" → Use TDD anyway
- "I'll just check the files first" → Use the systematic approach anyway
- "This is a quick fix" → Use systematic debugging anyway
- "I already know the answer" → Verify anyway

Skills and practices encode hard-won lessons. Skipping them means repeating
mistakes. The small upfront cost prevents large downstream costs.

---

## Specialized Capabilities

### Skills (Reusable Workflows)

| Category         | Examples                                            |
| ---------------- | --------------------------------------------------- |
| Core Development | TDD, verify-complete, code review, systematic debug |
| Architecture     | Decision framework, brainstorm, reuse analysis      |
| Security         | OWASP-based review, defense-in-depth patterns       |
| Documentation    | Doc search, doc update, doc gates                   |
| UI/Quality       | Accessibility (WCAG 2.2), error handling, testing   |

### Agents (Automated Tasks)

| Agent                        | Purpose                                           |
| ---------------------------- | ------------------------------------------------- |
| Code Reviewer                | Automated review against standards                |
| Test Analyzer                | Categorize failures, identify flaky tests         |
| Auto-Fixer                   | Fix TypeScript, lint, import issues automatically |
| Spec Validator               | Check spec completeness before planning           |
| Capture Idea                 | Feature idea capture to future-work.md            |
| Documentation Reconciliation | Documentation drift detection                     |

---

## Workflow Selection Guide

| Change Type           | Workflow                 | Review Required    |
| --------------------- | ------------------------ | ------------------ |
| Typo, single-line fix | Direct commit            | Pre-commit hooks   |
| Bug fix (<3 files)    | Mainline                 | PR review          |
| New feature           | Full structured workflow | Plan approval + PR |
| Security-sensitive    | Developer-in-control     | Expert review      |
| Refactor              | Full structured workflow | Plan approval + PR |

---

## Standards

### Conventional Commits

Enforced commit message format for clear history:

```
feat: add wine rating feature
fix: resolve wine deletion bug
docs: update README
test: improve coverage for auth module
refactor: extract validation logic
chore: update dependencies
```

### Error Handling

Consistent patterns across the codebase:

- Custom error classes (AppError, ValidationError, NotFoundError, etc.)
- Structured JSON logging with request ID tracking
- Field-level validation details in responses
- Consistent error response format across all endpoints

---

## Adoption Strategy

### Phase 1: Foundation (Week 1-2)

- [ ] Set up pre-commit hooks (lint, format, type-check)
- [ ] Establish PR review requirement
- [ ] Create project context file (CLAUDE.md equivalent)
- [ ] Document existing patterns and conventions

### Phase 2: Verification (Week 3-4)

- [ ] Adopt TDD workflow for new features
- [ ] Implement "verify before claiming done" practice
- [ ] Add code review skill/checklist
- [ ] Establish coverage targets

### Phase 3: Structured Planning (Week 5-6)

- [ ] Introduce spec → plan → tasks workflow for larger features
- [ ] Create skill manifest (when to use what)
- [ ] Add Socratic clarification for ambiguous requirements
- [ ] Document architectural decisions

### Phase 4: Automation (Week 7+)

- [x] Add specialized agents (code review, test analysis, auto-fixer, etc.)
- [x] Install ATOM hooks (stale-file prevention, compaction recovery, evidence
      enforcement)
- [x] Install safety hooks (dangerous command blocking, file placement guards)
- [ ] Integrate with project management (Jira, etc.)
- [ ] Add progress notifications (Slack, etc.)
- [ ] Continuous refinement based on team feedback

---

## Risk Mitigation

### Highest-Risk AI Usage Patterns

1. **No human review gate** - AI commits directly without review
2. **Blind trust / rubber-stamping** - Approving without reading
3. **Security-sensitive code without expert review** - Auth, encryption,
   payments
4. **No test coverage** - AI generates code, nothing verifies it
5. **Skill atrophy** - Juniors never learn fundamentals
6. **Hallucinated dependencies** - Packages that don't exist or are malicious
7. **Context leakage** - Sensitive data sent to AI services

### Mitigations Built Into This Framework

| Risk             | Mitigation                                                  |
| ---------------- | ----------------------------------------------------------- |
| No review        | PR requirement, pre-commit hooks                            |
| Blind trust      | Verify-complete requires evidence                           |
| Security gaps    | Security review skill, expert review gate                   |
| Missing tests    | TDD enforcement, coverage targets                           |
| Skill atrophy    | Developer-in-control for learning opportunities             |
| Bad dependencies | Code review catches, security scanning                      |
| Context leakage  | Clear data handling policies                                |
| Stale edits      | ATOM pre-edit-verify hook blocks edits on outdated files    |
| Dangerous cmds   | Safety hook blocks force-push, hard reset, raw db push      |
| Missing evidence | T-VERIFY Stop hook blocks session end without fresh results |

---

## Metrics to Track

| Metric               | Target                 |
| -------------------- | ---------------------- |
| Test coverage        | 80%+ (adjust per team) |
| PR review turnaround | <24 hours              |
| Spec → Deploy time   | Track for improvement  |
| Defect escape rate   | Trending down          |
| Rework percentage    | Trending down          |

---

## Key Takeaways

1. **It's codified, not tribal** - Everything is in files, not in someone's head
2. **It's incremental** - Adopt pieces without the whole framework
3. **It's self-documenting** - Project context teaches the approach
4. **It scales down** - Light process for small fixes, full process for big
   features
5. **It has escape hatches** - "When in doubt, ask" not "never deviate"

---

## References

- Developed through iterative refinement on the Wine Cellar project
- Incorporates TDD, conventional commits, OWASP security practices
- Compatible with SpecKit workflow framework

---

_Last Updated: February 2026_
