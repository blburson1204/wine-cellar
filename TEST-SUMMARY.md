# Wine Cellar API - Test Summary

## ✅ All Tests Passing (49/49)

### Test Suite Results

```
✓ __tests__/wines.test.ts (18 tests) 215ms
✓ __tests__/errorHandling.test.ts (31 tests) 162ms

Test Files  2 passed (2)
Tests       49 passed (49)
Duration    851ms
```

### Quick Stats

- **Test Runner**: Vitest 4.0.16
- **Total Tests**: 49
- **Pass Rate**: 100%
- **Execution Time**: ~851ms
- **Test Files**: 2

---

## Test Breakdown

### wines.test.ts (18 tests)

#### GET /api/health

- ✓ returns healthy status

#### POST /api/wines

- ✓ creates a new wine with valid data
- ✓ creates wine with all optional fields
- ✓ creates wine with different colors (RED, WHITE, ROSE, SPARKLING, DESSERT,
  FORTIFIED)

#### GET /api/wines

- ✓ returns empty array when no wines exist
- ✓ returns all wines
- ✓ returns wines in descending order by creation date

#### GET /api/wines/:id

- ✓ returns a wine by ID
- ✓ returns 404 when wine not found

#### PUT /api/wines/:id

- ✓ updates a wine
- ✓ updates multiple fields
- ✓ returns error when wine not found

#### DELETE /api/wines/:id

- ✓ deletes a wine
- ✓ returns error when wine not found

#### Integration: Full Wine Lifecycle

- ✓ completes create → read → update → delete flow

#### Data Validation

- ✓ handles special characters in wine names
- ✓ handles very old vintages
- ✓ handles large quantities

---

### errorHandling.test.ts (31 tests)

#### Validation Errors (400)

- ✓ returns 400 for missing required field: name
- ✓ returns 400 for missing required field: vintage
- ✓ returns 400 for vintage too old (< 1900)
- ✓ returns 400 for vintage in the future
- ✓ returns 400 for invalid wine color
- ✓ returns 400 for negative quantity
- ✓ returns 400 for rating out of range (too low)
- ✓ returns 400 for rating out of range (too high)
- ✓ returns 400 for name too long (> 200 chars)
- ✓ returns 400 for notes too long (> 2000 chars)
- ✓ returns 400 for multiple validation errors
- ✓ rejects unknown fields in update

#### Not Found Errors (404)

- ✓ returns 404 when getting non-existent wine
- ✓ returns 404 when updating non-existent wine
- ✓ returns 404 when deleting non-existent wine
- ✓ returns 404 for undefined routes

#### Request ID Tracking

- ✓ includes request ID in successful response headers
- ✓ includes request ID in error responses
- ✓ accepts and uses custom request ID from header

#### Error Response Format

- ✓ has consistent error format with error message
- ✓ includes field-specific errors for validation failures

#### Health Check Endpoint

- ✓ returns 200 when healthy

#### Data Type Validation

- ✓ returns 400 for vintage as string
- ✓ returns 400 for quantity as string
- ✓ returns 400 for rating as decimal

#### String Trimming and Sanitization

- ✓ trims whitespace from name
- ✓ trims whitespace from producer
- ✓ trims whitespace from country

#### Edge Cases

- ✓ handles empty object in POST request
- ✓ handles null values correctly
- ✓ validates ID parameter in GET request

---

## Running Tests

### Run all tests:

```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes):

```bash
npm run test:watch
```

### Run tests with coverage report:

```bash
npm run test:coverage
```

### View HTML coverage report:

```bash
npm run test:coverage
open apps/api/coverage/lcov-report/index.html
```

---

## Test Coverage

Coverage thresholds are configured in `apps/api/vitest.config.ts`:

- **Branches**: 70%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

---

## Test Configuration

### Vitest Configuration (`apps/api/vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.test.ts'],
    pool: 'forks',
    fileParallelism: false, // Sequential execution to prevent race conditions
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
      thresholds: {
        /* ... */
      },
    },
  },
});
```

**Key Settings:**

- `fileParallelism: false` - Tests run sequentially to avoid database race
  conditions
- Test database:
  `postgresql://postgres:postgres@localhost:5433/wine_cellar_test`
- Environment: Node.js (not jsdom)
- Setup script: `scripts/setup-test-db.ts` (runs before tests)

---

## Dependencies

### Testing Stack

- **Vitest**: 4.0.16 (test runner)
- **Supertest**: 7.1.4 (HTTP assertion library)
- **Zod**: 3.25.76 (validation library - stable version)
- **Prisma**: Database ORM with test database isolation

### Recent Changes

- **December 24, 2025**: Upgraded Zod from 4.2.1 (experimental) to 3.25.76
  (stable)
  - Fixed validation errors returning 500 instead of 400
  - Reduced test failures from 22 to 0
- **December 24, 2025**: Configured sequential test execution
  - Added `fileParallelism: false` to prevent database race conditions
  - Fixed 4 failing tests related to parallel execution

---

## Notes

- Console errors in test output are **expected** - they're from tests that
  verify error handling when trying to update/delete non-existent records
- The test suite uses an isolated test database (`wine_cellar_test`) and cleans
  up before each test
- All tests use the AAA pattern (Arrange, Act, Assert) for clarity
- Database cleanup happens in `beforeEach` hooks to ensure test isolation
