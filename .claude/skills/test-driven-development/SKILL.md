---
name: test-driven-development
description:
  Use when implementing any feature or bugfix, before writing implementation
  code - write the test first, watch it fail, write minimal code to pass;
  ensures tests actually verify behavior by requiring failure first
---

# Test-Driven Development (TDD)

Write the test first. Watch it fail. Write minimal code to pass.

**Core principle:** If you didn't watch the test fail, you don't know if it
tests the right thing.

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? **Delete it. Start over.**

No keeping it as "reference." No "adapting" it. Delete means delete.

## Red-Green-Refactor

### RED - Write Failing Test

Write one minimal test showing what should happen.

```typescript
test('retries failed operations 3 times', async () => {
  let attempts = 0;
  const operation = () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  };
  const result = await retryOperation(operation);
  expect(result).toBe('success');
  expect(attempts).toBe(3);
});
```

### Verify RED - Watch It Fail

**MANDATORY. Never skip.**

```bash
npm test path/to/test.test.ts
```

Confirm: Test fails (not errors), failure message expected, fails because
feature missing.

### GREEN - Minimal Code

Write simplest code to pass. Don't add features beyond the test.

### Verify GREEN - Watch It Pass

```bash
npm test path/to/test.test.ts
```

All tests pass. Output pristine (no errors, warnings).

### REFACTOR - Clean Up

After green only. Keep tests green. Don't add behavior.

## Good Tests

| Quality | Criteria                            |
| ------- | ----------------------------------- |
| Minimal | One thing. "and" in name? Split it. |
| Clear   | Name describes behavior             |
| Real    | Tests real code, not mocks          |

## Rationalizations That Mean "Start Over"

| Excuse                       | Reality                                        |
| ---------------------------- | ---------------------------------------------- |
| "Too simple to test"         | Simple code breaks. Test takes 30 seconds.     |
| "I'll test after"            | Tests passing immediately prove nothing.       |
| "Need to explore first"      | Fine. Throw away exploration, start with TDD.  |
| "Test hard = design unclear" | Hard to test = hard to use. Fix design.        |
| "Already manually tested"    | Ad-hoc ≠ systematic. No record, can't re-run.  |
| "Keep as reference"          | You'll adapt it. That's testing after. Delete. |

## Red Flags - STOP and Start Over

- Code before test
- Test passes immediately
- Can't explain why test failed
- "Just this once"
- "Already spent X hours"
- "This is different because..."

## Verification Checklist

- [ ] Every new function has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for expected reason
- [ ] Wrote minimal code to pass
- [ ] All tests pass
- [ ] Output pristine
- [ ] Edge cases covered

Can't check all boxes? Start over.

## When Stuck

| Problem                | Solution                            |
| ---------------------- | ----------------------------------- |
| Don't know how to test | Write wished-for API first          |
| Test too complicated   | Design too complicated. Simplify.   |
| Must mock everything   | Code too coupled. Use DI.           |
| Test setup huge        | Extract helpers or simplify design. |

## Final Rule

Production code → test exists and failed first. Otherwise → not TDD.
