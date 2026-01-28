# Testing Anti-Patterns Checklist

## Test Suite Quality

- [ ] No excessive E2E tests (quota protection)
- [ ] No real API calls in tests
- [ ] No testing implementation details
- [ ] No brittle selectors (use test IDs)
- [ ] No flaky tests tolerated

## TDD Violations

- [ ] Tests written before implementation
- [ ] Tests fail before code written
- [ ] No code without tests
- [ ] No skipped tests in CI

## Mocking Strategy

- [ ] External APIs mocked
- [ ] High-risk APIs never called
- [ ] SAM.gov/FPDS mocked (quota protection)
- [ ] Database mocked for unit tests
- [ ] Test database used for integration tests

## Test Distribution

- [ ] ~90% unit tests (backend)
- [ ] <10% integration tests
- [ ] Minimal E2E tests (<5 for critical paths)
- [ ] No E2E for high-risk APIs
- [ ] Contract tests for API validation only

## Test Quality

- [ ] Tests focused and isolated
- [ ] One assertion per test
- [ ] Descriptive test names
- [ ] Arrange-Act-Assert structure
- [ ] No test interdependencies

## Performance

- [ ] Fast unit tests (<100ms each)
- [ ] Integration tests reasonable (<5s)
- [ ] No slow E2E in CI (move to manual)
- [ ] Parallel execution enabled
- [ ] Test data minimal

## Maintenance

- [ ] No commented-out tests
- [ ] No duplicate test logic
- [ ] Test helpers for common setup
- [ ] Fixtures for test data
- [ ] Tests refactored with code

## Coverage

- [ ] Critical paths covered
- [ ] Edge cases covered
- [ ] Error paths covered
- [ ] No testing for coverage sake
- [ ] Coverage ≥80% for business logic
