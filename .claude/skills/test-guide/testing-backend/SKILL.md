---
name: testing-backend
description:
  Backend testing guide for Wine Cellar. Covers TDD workflow, test planning,
  proper mocking patterns, anti-patterns, and Prisma schema testing with Vitest
  + Supertest.
model: sonnet
parent: test-guide
---

# Backend Testing Guide

> **Parent skill:** `Skill: test-guide` | **Sibling:**
> `Skill: test-guide/testing-frontend`

## Test Hierarchy (Backend)

1. **Unit Tests** - Fast (<5s for 30 tests), isolated, dependencies mocked
2. **Integration Tests** - API endpoints with real test database via Supertest
3. **E2E Tests** - Almost never, only for critical flows

---

## Planning Tests (New Specs)

Complete this workflow before writing any implementation code.

### Step 1: Verify Test Requirements Exist

If specification lacks test tasks, **STOP and add them now**. Test tasks must
appear before implementation tasks.

### Step 2: Determine Test Type

| Feature Type                | Test Type               | Mocking Strategy                  |
| --------------------------- | ----------------------- | --------------------------------- |
| Utility/helper function     | Unit (Vitest)           | vi.spyOn for deps                 |
| API endpoint                | Integration (Supertest) | Real test DB                      |
| Service with external deps  | Unit                    | Mock external SDK                 |
| Middleware                  | Unit                    | Mock req/res/next                 |
| Zod schema validation       | Unit                    | None                              |
| **Database schema changes** | **Schema Sync**         | **Validate against Prisma types** |

### Step 3: Check for Schema Sync Requirements

**If the spec adds or modifies database fields:**

1. Update Prisma schema first
2. Run `npm run db:generate` to regenerate client
3. Run `npm run db:push` to apply changes
4. Ensure tests validate field names match schema

This is MANDATORY because mocked Prisma in unit tests won't catch schema
mismatches.

### Step 4: Estimate Test Counts

| Spec Complexity | Tasks | Expected Tests | Test Types         |
| --------------- | ----- | -------------- | ------------------ |
| Simple          | 1-2   | 5-15           | Unit only          |
| Medium          | 3-5   | 15-30          | Unit + Integration |
| Complex         | 6+    | 30-50          | Unit + Integration |

**Warning signs during planning:**

- Planning >50 tests for any spec → over-engineering
- Planning >10 integration tests → should be unit tests

### Step 5: Anti-Pattern Gate Check

Before writing any test, answer these questions:

```
[ ] Am I testing real behavior or mock existence?
[ ] Am I adding any methods to production classes just for tests?
[ ] Do I understand what side effects the real method has?
[ ] Does my mock include ALL fields the real API returns?
[ ] Is my mock setup simpler than the test logic?
```

If any answer is wrong, STOP and fix before proceeding.

### Step 6: Write Failing Tests (RED)

Create test file and write tests that fail. Verify they fail before
implementing.

### Step 7: Implement Minimally (GREEN)

Write just enough code to make tests pass.

### Step 8: Refactor (Keep Green)

Clean up code while maintaining passing tests.

---

## Test Pragmatism Audit (MANDATORY - Read After Drafting Tests)

STOP. Before implementing any code, answer these questions for each test file:

### The Killer Question

**Which tests could be DELETED with minimal confidence loss?**

If your answer is "none," you're probably wrong. Look harder. Consider:

- Tests that verify obvious framework behavior (e.g., "Express returns 404")
- Tests that duplicate validation already done elsewhere
- Tests for edge cases that will never occur in production

### Parameterization Check

Could 3+ similar tests become 1 parameterized test?

```typescript
// BEFORE: 5 separate tests
test('validates wine name required', ...)
test('validates wine vintage required', ...)
test('validates wine country required', ...)

// AFTER: 1 parameterized test
test.each([
  ['name', { vintage: 2020 }],
  ['vintage', { name: 'Test' }],
  ['country', { name: 'Test', vintage: 2020 }],
])('validates %s is required', (field, data) => ...)
```

### Duplication Check

Is any test verifying behavior that's already tested?

- Same validation logic tested in unit AND integration? Pick one.

### After Review

Document your findings:

- "Reduced from X to Y tests"
- "Combined N tests into parameterized tests"
- "No reduction needed because [specific justification]"

**"Looks good" is not a justification.**

---

## Reviewing Existing Tests

### Quantitative Thresholds

| Metric                         | Expected     | Warning | Stop & Review    |
| ------------------------------ | ------------ | ------- | ---------------- |
| Integration tests              | 0-10         | 10-20   | >20 per endpoint |
| Test count vs spec tasks       | ~3-5:1 ratio | 6-8:1   | >10:1            |
| Mock setup lines vs test lines | <50%         | 50-75%  | >75%             |
| Total suite time               | <10s         | 10-30s  | >30s             |

### Over-Engineering Detection

```
[ ] Could this integration test be a unit test?
[ ] Am I testing implementation details instead of behavior?
[ ] Are multiple tests asserting the same thing differently?
[ ] Is mock complexity hiding that I should test differently?
[ ] Would removing this test reduce confidence in the code?
```

---

## Wine Cellar Specific Patterns

### API Integration Test with Supertest

```typescript
import request from 'supertest';
import { app } from '../server';

describe('POST /api/wines', () => {
  it('creates a new wine with valid data', async () => {
    const wineData = { name: 'Test Wine', vintage: 2020, color: 'RED' };
    const response = await request(app).post('/api/wines').send(wineData);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(wineData);
  });

  it('returns 400 for invalid vintage', async () => {
    const response = await request(app)
      .post('/api/wines')
      .send({ name: 'Wine', vintage: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});
```

### Zod Schema Validation Test

```typescript
import { wineSchema } from '../schemas/wine';

test.each([
  ['missing name', { vintage: 2020 }],
  ['invalid vintage', { name: 'Wine', vintage: -1 }],
])('rejects %s', (_, data) => {
  expect(wineSchema.safeParse(data).success).toBe(false);
});
```

### AppError Class Test

```typescript
import { NotFoundError } from '../errors';

test('NotFoundError has correct status', () => {
  const error = new NotFoundError('Wine not found');
  expect(error.statusCode).toBe(404);
  expect(error.message).toBe('Wine not found');
});
```

---

## Anti-Patterns Reference

| Anti-Pattern                   | Fix                                 |
| ------------------------------ | ----------------------------------- |
| Real HTTP calls in tests       | Mock fetch/axios                    |
| Testing mock elements          | Test real component; unmock         |
| Incomplete mocks               | Mirror real API response completely |
| Test-only production methods   | Move to test utilities              |
| Testing implementation details | Test behavior and output            |
| Redundant tests                | Consolidate with test.each          |
