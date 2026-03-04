---
name: testing-frontend
description:
  Frontend testing guide for Wine Cellar. Covers React Testing Library,
  userEvent, Next.js 15 patterns, vitest-axe for accessibility testing, and
  proper query priority.
model: sonnet
parent: test-guide
---

# Frontend Testing Guide

> **Parent skill:** `Skill: test-guide` | **Sibling:**
> `Skill: test-guide/testing-backend`

## Test Hierarchy (Frontend - Testing Trophy)

| Layer               | Share | Focus                       |
| ------------------- | ----- | --------------------------- |
| E2E                 | 5%    | Critical user journeys only |
| Integration (RTL)   | 40%   | Primary focus               |
| Unit (Vitest)       | 35%   | Pure logic, utilities       |
| Static (TS, ESLint) | 20%   | Type safety, lint rules     |

"The more your tests resemble the way your software is used, the more confidence
they can give you." - Kent C. Dodds

---

## Planning Tests (New Specs)

### Step 1: Determine Test Type

| Feature Type             | Test Type         | Mocking Strategy        | Extra       |
| ------------------------ | ----------------- | ----------------------- | ----------- |
| Component with API calls | Integration (RTL) | Mock fetch with vi.fn() | --          |
| Pure utility function    | Unit (Vitest)     | None                    | --          |
| Client Component         | Unit (Vitest)     | Mock fetch              | --          |
| Form validation          | Unit              | None                    | --          |
| Interactive UI           | Accessibility     | vitest-axe              | ARIA, focus |

### Step 2: Estimate Test Counts

| Spec Complexity | Tasks | Expected Tests | Test Types                         |
| --------------- | ----- | -------------- | ---------------------------------- |
| Simple          | 1-2   | 5-15           | Unit only                          |
| Medium          | 3-5   | 15-30          | Unit + Integration                 |
| Complex         | 6+    | 30-50          | Unit + Integration + Accessibility |

### Step 3: Anti-Pattern Gate Check

Before writing tests, confirm:

1. Testing user behavior, not implementation details
2. Using accessible queries (`getByRole`, `getByLabelText`)
3. Using `userEvent` not `fireEvent`
4. Mock fetch for API calls
5. Accessibility tests for interactive elements (vitest-axe)

---

## Test Pragmatism Audit (MANDATORY)

Before implementing, answer for each test file:

**The Killer Question:** Which tests could be deleted with minimal confidence
loss?

**Parameterization Check:** Could 3+ similar tests become 1 parameterized test?

```typescript
// BEFORE: 5 separate tests for form validation
// AFTER: 1 parameterized test
test.each([
  ['valid@email.com', true],
  ['invalid', false],
])('validates email: %s', (input, expected) => ...)
```

Document findings: "Reduced from X to Y tests" or "No reduction needed because
[specific justification]"

---

## React Testing Library Patterns

### Query Priority (MANDATORY)

Use queries in this order -- accessibility-first:

| Priority        | Query                                     | Use When                  |
| --------------- | ----------------------------------------- | ------------------------- |
| 1 (prefer)      | `getByRole('button', { name: 'Submit' })` | Element has ARIA role     |
| 2               | `getByLabelText('Email address')`         | Form inputs               |
| 3               | `getByPlaceholderText(...)`               | No label available        |
| 4               | `getByText('Welcome back')`               | Static text content       |
| 5               | `getByAltText(...)`, `getByTitle(...)`    | Images, tooltips          |
| 6 (last resort) | `getByTestId('submit-btn')`               | No accessible alternative |

If reaching for `data-testid` first, reconsider your approach.

### userEvent + Async Patterns

```typescript
test('submits form on button click', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.type(screen.getByLabelText('Password'), 'password123');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));

  // findBy for async content (preferred over waitFor when possible)
  expect(await screen.findByText('Welcome')).toBeInTheDocument();

  // waitFor for complex async assertions
  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent('Success');
  });
});
```

| Rule              | Correct                              | Wrong                                      |
| ----------------- | ------------------------------------ | ------------------------------------------ |
| User simulation   | `userEvent.setup()` + `user.click()` | `fireEvent.click()`                        |
| Async content     | `await screen.findByText(...)`       | `setTimeout` / arbitrary waits             |
| Expected elements | `screen.getByText(...)`              | `screen.queryByText(...)`                  |
| Testing absence   | `screen.queryByRole('alert')`        | `screen.getByRole('alert')` with try/catch |

---

## Accessibility Testing (vitest-axe)

Wine Cellar uses vitest-axe for automated accessibility testing.

```typescript
import { axe, toHaveNoViolations } from 'vitest-axe';

expect.extend(toHaveNoViolations);

test('wine form has no accessibility violations', async () => {
  const { container } = render(<WineForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Keyboard Navigation

```typescript
test('can navigate wine form with keyboard', async () => {
  const user = userEvent.setup();
  render(<WineForm />);

  await user.tab();
  expect(screen.getByLabelText('Wine Name')).toHaveFocus();
  await user.tab();
  expect(screen.getByLabelText('Vintage')).toHaveFocus();
});
```

---

## Wine Cellar Specific Patterns

### Component with Fetch Mock

```typescript
test('displays wines from API', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([
      { id: '1', name: 'Chateau Margaux', vintage: 2015, color: 'RED' }
    ]),
  });

  render(<WineList />);
  expect(await screen.findByText('Chateau Margaux')).toBeInTheDocument();
});
```

### Optimistic Update Testing

```typescript
test('shows wine immediately on add (optimistic)', async () => {
  const user = userEvent.setup();
  render(<WineForm />);

  await user.type(screen.getByLabelText('Wine Name'), 'New Wine');
  await user.click(screen.getByRole('button', { name: 'Add Wine' }));

  // Should appear immediately (optimistic)
  expect(screen.getByText('New Wine')).toBeInTheDocument();
});
```

---

## Anti-Patterns Reference

| Anti-Pattern           | Wrong                                  | Correct                                   |
| ---------------------- | -------------------------------------- | ----------------------------------------- |
| Testing implementation | `expect(result.current.internalValue)` | Test user-visible output                  |
| Snapshot abuse         | `expect(container).toMatchSnapshot()`  | Targeted assertions                       |
| Mocking children       | `vi.mock('./Child')` then assert mock  | Render real tree                          |
| queryBy for expected   | `screen.queryByText('Welcome')`        | `screen.getByText('Welcome')`             |
| fireEvent              | `fireEvent.click(button)`              | `await user.click(button)`                |
| data-testid first      | `getByTestId('submit')`                | `getByRole('button', { name: 'Submit' })` |

---

## Quantitative Thresholds

| Metric                   | Expected | Warning   | Stop and Review |
| ------------------------ | -------- | --------- | --------------- |
| Component test time      | <100ms   | 100-500ms | >500ms          |
| Full suite time          | <30s     | 30-60s    | >60s            |
| Test count vs spec tasks | ~3-5:1   | 6-8:1     | >10:1           |
