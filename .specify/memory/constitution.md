# Wine Cellar Project Constitution

**"Evidence over confidence, discipline over speed"**

You cannot claim something works without proof. Rationalizations are explicitly
forbidden. Skills encode hard-won lessons — skipping them means repeating
mistakes.

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

Every feature begins with tests that define expected behavior. The TDD cycle is
mandatory: Write tests -> Verify tests fail (Red) -> Implement minimal code to
pass (Green) -> Refactor while maintaining green tests. Zero tolerance for test
failures - any failing test blocks all progress.

### II. Specification-Driven Development

For larger features, use the SpecKit framework: `/specify` creates
specifications -> `/plan` generates technical plans -> `/tasks` breaks down work
-> `/implement` executes. For smaller changes, direct implementation is
acceptable with proper testing.

### III. Verification Before Completion

Never claim work is complete without running verification commands and providing
evidence. Evidence must be actual command output, not summaries or claims. The
pattern: run command -> capture output -> paste evidence -> then claim
completion.

### IV. Skills Before Action

Before any task, check if a skill applies. Even a 1% chance of applicability
means invoke the skill first. Skills encode hard-won lessons - skipping them
means repeating mistakes.

### V. Code Review Compliance

All code changes must pass compliance review before commit. This includes: no
security vulnerabilities, follows established patterns, proper error handling,
adequate test coverage.

## Workflow Rules

### SpecKit Workflow (for larger features)

1. `/specify [name]` - Create specification with requirements
2. `/clarify [name]` - Clarify requirements through questioning
3. `/plan` - Create implementation plan
4. `/tasks` - Generate task list with verification gates
5. `/implement` - Execute tasks with verification

Manual creation of plan.md, tasks.json, or other SpecKit artifacts is forbidden
— always use the pipeline commands to ensure validation gates are applied.

### TDD Workflow

1. Write failing test first
2. Verify test fails (confirms test works)
3. Implement minimal code to pass
4. Verify test passes
5. Refactor while green
6. Run full test suite before commit

### Commit Rules

1. Run all tests before committing
2. Include meaningful commit message
3. Never commit failing tests
4. Never commit secrets or credentials (.env files)
5. Reference specification number in commit message if applicable

## Quality Gates

These match the wine-cellar npm scripts:

- **T-VERIFY-TYPECHECK**: `npm run type-check` - TypeScript must compile without
  errors
- **T-VERIFY-LINT**: `npm run lint` - Code must pass ESLint
- **T-VERIFY-FORMAT**: `npm run format:check` - Code must pass Prettier
- **T-VERIFY-TEST**: `npm test` - All tests must pass
- **T-VERIFY-COVERAGE**: `npm run test:coverage` - Coverage thresholds must be
  met

## Project-Specific Rules

### Wine Cellar Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Express + TypeScript + Prisma
- **Database**: SQLite (development), PostgreSQL-compatible schema
- **Testing**: Vitest for both apps

### UI Guidelines

- Use existing TailwindCSS patterns
- Follow accessibility best practices (invoke accessibility skill for UI work)
- Responsive design considerations for all new features

### API Guidelines

- RESTful endpoints under /api/
- Consistent error response format
- Input validation on all endpoints

---
