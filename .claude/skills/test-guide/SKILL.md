---
name: test-guide
description:
  Comprehensive TDD guide for Wine Cellar. Use when creating new specs to plan
  tests, or when evaluating existing test suites for over-engineering or
  anti-patterns. Covers proper mocking, test distribution, and the Iron Laws of
  testing.
model: sonnet
---

# Testing - Wine Cellar Platform

## When to Use

- **Creating new specs** - Plan test types, counts, mocking strategy
- **Before implementing features** - Ensure TDD workflow
- **Reviewing existing tests** - Detect over-engineering, anti-patterns
- **Evaluating test proportionality** - Check test count matches complexity

## Auto-Routing

### Backend → `Skill: testing-backend`

Working in: `apps/api/src/`, API routes, services, middleware

### Frontend → `Skill: testing-frontend`

Working in: `apps/web/src/`, React components, pages, hooks

---

## Test Anti-Pattern Audit

```
Skill: code-search

Audit test suite for anti-patterns using testing-antipatterns.md checklist.

Scope: Test quality, TDD violations, mocking strategy, distribution, performance
Priority: P1=real API calls, P2=excessive E2E/mock assertions, P3=TDD violations, P4=maintenance

Collect evidence with file:line references.
```

---

## The Iron Laws

1. **Test-first always** (RED → GREEN → REFACTOR)
2. **Never test mock behavior** - test real behavior
3. **Never add test-only methods** to production code
4. **Never mock without understanding** dependencies
5. **Test user behavior** not implementation (Frontend)
6. **Write fewer, longer tests** (user journeys > isolated assertions)

---

## Quick Reference

### Test Type Selection

| Situation                  | Test Type         | Mock Strategy              |
| -------------------------- | ----------------- | -------------------------- |
| React component with API   | Integration (RTL) | Mock fetch with vi.fn()    |
| Backend endpoint           | Integration       | Real test DB via Supertest |
| Service with external deps | Unit              | Mock SDK completely        |
| Client Component           | Unit (Vitest)     | Mock fetch                 |
| Form validation            | Unit              | None                       |
| Interactive UI             | Accessibility     | vitest-axe                 |

### Test Distribution

| Layer         | Backend | Frontend |
| ------------- | ------- | -------- |
| Unit          | 60%     | 30%      |
| Integration   | 35%     | 40%      |
| Static        | 5%      | 20%      |
| E2E           | -       | 5%       |
| Accessibility | -       | 5%       |

### Anti-Pattern Quick Fixes

| Anti-Pattern              | Fix                           |
| ------------------------- | ----------------------------- |
| Assert on mock elements   | Test real component or unmock |
| Test-only prod methods    | Move to test utilities        |
| Incomplete mocks          | Mirror real API completely    |
| >50 tests for simple spec | Cut redundant tests           |
| Testing implementation    | Test user behavior            |
| fireEvent usage           | Use userEvent                 |
| data-testid first         | Use getByRole, getByLabelText |

### Red Flags

- `*-mock` test IDs in assertions
- Methods only called in test files
- Mock setup >50% of test code
- Test suite >10s total
- Testing state/props directly
- No userEvent setup pattern

---

## Required Outputs

### For New Specs: Test Plan Summary

```
Feature: [name]
Spec complexity: [simple/medium/complex]

Backend: Unit [N], Integration [N]
Frontend: Unit [N], Integration [N]

External deps to mock: [list]
```

### Anti-Pattern Checklist

```
[ ] No mock behavior assertions
[ ] No test-only production methods
[ ] All mocks complete
[ ] Test count proportional to spec
[ ] Frontend uses accessible queries
[ ] Frontend uses userEvent pattern
[ ] Mock fetch for API calls
```

### For Existing Suites: Audit Report

```
Suite: [name/path]
Total: [count] (Unit [%], Integration [%])
Execution time: [seconds]

Issues: [list with file:line]
Recommendations: [prioritized actions]
```

## Success Criteria

**Backend:** All external APIs mocked, no anti-patterns, fast (<5s unit),
proportional count **Frontend:** Accessible queries, userEvent, accessibility
tests, no huge snapshots
