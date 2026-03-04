---
name: testing-anti-patterns
description:
  Testing anti-patterns and what NOT to do. Covers wrong test types, mock
  misuse, production pollution, and correct alternatives.
model: haiku
parent: test-guide
---

# Testing Anti-Patterns Guide

> **Parent skill:** `Skill: test-guide` | **Siblings:**
> `Skill: test-guide/testing-backend`, `Skill: test-guide/testing-frontend`

Use when reviewing tests for anti-patterns, understanding why an approach is
wrong, or auditing test suites.

---

## The Iron Laws

1. NEVER test mock behavior -- test real behavior
2. NEVER add test-only methods to production code
3. NEVER mock without understanding dependencies
4. NEVER test implementation details over user behavior
5. NEVER write tests after implementation (TDD always)

---

## Category 1: Wrong Test Type

### Real HTTP Calls in Tests

Tests that hit real networks drain quotas, run slow, and break on service
downtime.

**Fix:** Mock fetch and assert on the call shape:

```typescript
beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: '123', name: 'Test Wine' }),
  });
});

test('fetches wine data', async () => {
  const data = await fetchWine(123);
  expect(data.name).toBe('Test Wine');
  expect(fetch).toHaveBeenCalledWith('/api/wines/123');
});
```

---

## Category 2: Mock Misuse

### Testing Mock Behavior

Asserting on mock elements (e.g., `getByTestId('sidebar-mock')`) verifies the
mock exists, not that the component works.

**Fix:** Test the real component:

```typescript
test('renders sidebar with navigation', () => {
  render(<Page />);  // Don't mock sidebar
  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
});
```

**Gate:** "Am I testing real behavior or mock existence?"

### Incomplete Mocks

Mocks missing fields that downstream code uses give false confidence -- test
passes but production fails.

**Fix:** Mirror the real API response completely.

**Gate:** Check actual API response shape. Include ALL fields.

### Mocking Without Understanding Side Effects

Mocking a dependency whose side effects the test depends on silently breaks the
test logic.

**Fix:** Mock only external/slow dependencies; keep dependencies the test relies
on.

**Gate:** "What side effects does this mock have? Does my test depend on them?"

---

## Category 3: Production Pollution

### Test-Only Methods in Production Code

Adding methods solely for test cleanup pollutes the API surface.

**Fix:** Put cleanup logic in test utilities:

```typescript
// test-utils/cleanup.ts
export async function cleanupTestData(prisma: PrismaClient) {
  await prisma.wine.deleteMany({ where: { name: { startsWith: 'TEST_' } } });
}

// In tests
afterEach(() => cleanupTestData(prisma));
```

**Gate:** "Is this method only used by tests?" If yes, it belongs in test
utilities.

---

## Category 4: Frontend-Specific Anti-Patterns

### Testing Implementation Details

Testing internal state or props couples tests to implementation and breaks on
refactoring.

**Fix:** Test user-visible behavior:

```typescript
test('displays updated count', async () => {
  const user = userEvent.setup();
  render(<Counter />);
  await user.click(screen.getByRole('button', { name: 'Increment' }));
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### Snapshot Abuse

Large component snapshots produce unreadable diffs and get blindly updated.

**Fix:** Targeted assertions on specific content.

### fireEvent Instead of userEvent

`fireEvent` dispatches synthetic DOM events that skip focus, blur, and hover.

**Fix:** Use `userEvent` for realistic simulation:

```typescript
test('submits form', async () => {
  const user = userEvent.setup();
  render(<WineForm />);
  await user.type(screen.getByLabelText('Wine Name'), 'Chateau Margaux');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Wine saved')).toBeInTheDocument();
});
```

### queryBy for Expected Elements

`queryBy` returns null instead of throwing, masking failures.

**Fix:** Use `getBy` for elements that should exist; reserve `queryBy` for
testing absence:

```typescript
// Expected element
expect(screen.getByText('Welcome')).toBeInTheDocument();

// Testing absence (correct use of queryBy)
expect(screen.queryByRole('alert')).not.toBeInTheDocument();
```

### data-testid Overuse

**Fix:** Use accessible queries (getByRole, getByLabelText) first.

---

## Category 5: Over-Engineering

### Redundant Tests

Writing dozens of tests for trivial attributes tests framework behavior, not
your code.

**Fix:** Consolidate into fewer, meaningful tests:

```typescript
test('renders wine form with accessible inputs', () => {
  render(<WineForm />);
  expect(screen.getByLabelText('Wine Name')).toBeInTheDocument();
  expect(screen.getByLabelText('Vintage')).toHaveAttribute('type', 'number');
});
```

---

## Quick Reference

| Anti-Pattern                   | Fix                                           |
| ------------------------------ | --------------------------------------------- |
| Real HTTP calls in tests       | Mock fetch with vi.fn()                       |
| Testing mock elements          | Test real component; unmock                   |
| Incomplete mocks               | Mirror real API response completely           |
| Mocking without understanding  | Understand side effects first; mock minimally |
| Test-only production methods   | Move to test utilities                        |
| Testing implementation details | Test user-visible behavior                    |
| Snapshot abuse                 | Use targeted assertions                       |
| fireEvent for interactions     | Use userEvent                                 |
| queryBy for expected elements  | Use getBy; reserve queryBy for absence        |
| data-testid as first choice    | Use accessible queries                        |
| Redundant tests                | Consolidate into meaningful tests             |
| Tests as afterthought          | TDD -- tests first, always                    |
