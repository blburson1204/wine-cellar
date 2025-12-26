# Testing Skill - Wine Cellar

This skill provides testing strategies, patterns, and best practices for the
Wine Cellar application.

## Testing Philosophy

**Why We Test:**

1. **Confidence** - Deploy changes without fear of breaking things
2. **Documentation** - Tests describe how the code should work
3. **Refactoring Safety** - Change implementation without changing behavior
4. **Bug Prevention** - Catch issues before users do

**Testing Pyramid:**

```
        /\
       /E2E\      <- Few, slow, expensive (user flows)
      /------\
     /Integration\ <- Some (API + DB interactions)
    /------------\
   /  Unit Tests  \ <- Many, fast, cheap (business logic)
  /----------------\
```

## Test Coverage Targets

| Layer              | Coverage Goal | Why                          |
| ------------------ | ------------- | ---------------------------- |
| **API Routes**     | 90%+          | Critical business logic      |
| **Business Logic** | 80%+          | Core functionality           |
| **UI Components**  | 70%+          | User-facing features         |
| **Utils/Helpers**  | 95%+          | Pure functions, easy to test |

## Testing Stack

### Backend (API)

- **Framework**: Jest
- **Supertest**: HTTP assertions
- **@prisma/client**: Database mocking

### Frontend (Web)

- **Framework**: Vitest (faster than Jest for Vite/Next.js)
- **React Testing Library**: Component testing
- **MSW**: API mocking

## Unit Testing Patterns

### API Endpoint Tests

**Structure:**

```typescript
describe('POST /api/wines', () => {
  it('creates a new wine with valid data', async () => {
    // Arrange: Set up test data
    const wineData = { name: 'Test Wine', vintage: 2020, ... };

    // Act: Make the request
    const response = await request(app)
      .post('/api/wines')
      .send(wineData);

    // Assert: Check the result
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(wineData);
  });

  it('returns 400 for invalid vintage', async () => {
    const invalidData = { name: 'Wine', vintage: 'invalid' };

    const response = await request(app)
      .post('/api/wines')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});
```

**What to Test:**

- ✅ Happy path (valid data succeeds)
- ✅ Validation (invalid data fails appropriately)
- ✅ Edge cases (empty data, max values, special characters)
- ✅ Error handling (database errors, network issues)
- ✅ Authentication/Authorization (when applicable)

### React Component Tests

**Structure:**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from './page';

describe('Home Page', () => {
  it('displays empty state when no wines', async () => {
    // Mock API to return empty array
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([])
      })
    );

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/your cellar is empty/i)).toBeInTheDocument();
    });
  });

  it('opens form when Add Wine button clicked', () => {
    render(<Home />);

    const addButton = screen.getByText(/add wine/i);
    fireEvent.click(addButton);

    expect(screen.getByText(/add new wine/i)).toBeInTheDocument();
  });
});
```

**What to Test:**

- ✅ Rendering with different props/state
- ✅ User interactions (clicks, form inputs)
- ✅ Conditional rendering (loading, empty states)
- ✅ API calls triggered correctly
- ❌ Don't test implementation details (CSS, internal state names)
- ❌ Don't test third-party libraries

## Test Organization

### File Structure

```
wine-cellar/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   └── server.ts
│   │   └── __tests__/
│   │       └── server.test.ts
│   └── web/
│       ├── src/app/
│       │   └── page.tsx
│       └── __tests__/
│           └── page.test.tsx
└── packages/
    └── database/
        └── __tests__/
            └── prisma.test.ts
```

### Naming Conventions

- Test files: `*.test.ts` or `*.spec.ts`
- Test suites: `describe('ComponentName', () => ...)`
- Test cases: `it('should do something specific', () => ...)`

## Test Data Patterns

### Factories (Reusable Test Data)

```typescript
// tests/factories/wine.factory.ts
export const createWine = (overrides = {}) => ({
  id: 'test-id-' + Math.random(),
  name: 'Test Wine',
  vintage: 2020,
  producer: 'Test Producer',
  country: 'France',
  color: 'RED',
  quantity: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Usage in tests:
const wine = createWine({ vintage: 2015 });
```

### Database Setup/Teardown

```typescript
beforeEach(async () => {
  // Clear database before each test
  await prisma.wine.deleteMany();
});

afterAll(async () => {
  // Disconnect after all tests
  await prisma.$disconnect();
});
```

## Mocking Strategies

### Mock External APIs

```typescript
// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'mocked' }),
  })
);
```

### Mock Prisma

```typescript
import { prismaMock } from '../__mocks__/prisma';

prismaMock.wine.findMany.mockResolvedValue([
  createWine({ name: 'Mocked Wine' }),
]);
```

### Mock External Services

```typescript
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(),
  })),
}));
```

## Testing Checklist

Before pushing code, ensure:

- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Test coverage meets targets
- [ ] No console errors/warnings in tests
- [ ] Tests run in CI/CD pipeline

## Common Testing Mistakes

### ❌ Don't:

1. **Test implementation details**

   ```typescript
   // BAD: Testing internal state
   expect(component.state.isOpen).toBe(true);

   // GOOD: Testing behavior
   expect(screen.getByRole('dialog')).toBeVisible();
   ```

2. **Write flaky tests**

   ```typescript
   // BAD: Time-dependent
   setTimeout(() => expect(result).toBe(true), 100);

   // GOOD: Use waitFor
   await waitFor(() => expect(result).toBe(true));
   ```

3. **Test too much in one test**

   ```typescript
   // BAD: Testing multiple things
   it('does everything', () => { ... });

   // GOOD: One behavior per test
   it('validates required fields', () => { ... });
   it('saves to database', () => { ... });
   ```

### ✅ Do:

1. **Follow AAA pattern** (Arrange, Act, Assert)
2. **Use descriptive test names** (`it('returns 404 when wine not found')`)
3. **Keep tests independent** (no shared state between tests)
4. **Test user behavior, not code** (what users see/do)

## Performance Testing

### Database Query Performance

```typescript
it('fetches wines efficiently', async () => {
  // Create 100 wines
  await Promise.all(
    Array(100)
      .fill(null)
      .map((_, i) =>
        prisma.wine.create({ data: createWine({ name: `Wine ${i}` }) })
      )
  );

  const start = Date.now();
  await prisma.wine.findMany();
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(100); // Should take < 100ms
});
```

## Integration Testing

**What to Test:**

- API endpoints with real database (using test DB)
- Full user flows (add wine → list wines → delete wine)
- Error scenarios (database down, network errors)

**Example:**

```typescript
describe('Wine CRUD Flow', () => {
  it('completes full lifecycle', async () => {
    // Create
    const createRes = await request(app).post('/api/wines').send(createWine());
    const wineId = createRes.body.id;

    // Read
    const getRes = await request(app).get(`/api/wines/${wineId}`);
    expect(getRes.status).toBe(200);

    // Update
    const updateRes = await request(app)
      .put(`/api/wines/${wineId}`)
      .send({ quantity: 5 });
    expect(updateRes.body.quantity).toBe(5);

    // Delete
    const deleteRes = await request(app).delete(`/api/wines/${wineId}`);
    expect(deleteRes.status).toBe(204);
  });
});
```

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test server.test.ts

# Run tests matching pattern
npm test -- --grep "POST /api/wines"
```

### Coverage Reports

```bash
# Generate HTML coverage report
npm test -- --coverage

# View in browser
open coverage/index.html
```

## Continuous Integration

### Pre-commit Hook

```bash
# .husky/pre-commit
npm test
```

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
```

## Learning Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## When to Update This Skill

- After discovering new testing patterns
- When adding new testing tools
- If test philosophy changes
- When coverage targets are adjusted
