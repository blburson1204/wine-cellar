# Wine Cellar

Personal wine collection manager. Full-stack TypeScript monorepo.

## Quick Start

```bash
npm run dev          # Start API (3001) + Web (3000)
npm test             # Run all tests (479 tests)
npm run lint         # ESLint check
npm run type-check   # TypeScript check
npm run format:check # Prettier check
```

## Project Structure

```
apps/
  api/          # Express API server
  web/          # Next.js 15 frontend
packages/
  database/     # Prisma schema + client
```

## Tech Stack

- **Frontend**: React 18, Next.js 15, TypeScript, TailwindCSS
- **Backend**: Express, TypeScript, Zod validation
- **Database**: PostgreSQL (Docker), Prisma ORM
- **Testing**: Vitest, React Testing Library, Supertest

## Key Patterns

- **Zod schemas** for all API validation (`apps/api/src/schemas/`)
- **Optimistic updates** for UI responsiveness
- **AppError classes** for typed error handling (`apps/api/src/errors/`)
- **Winston logger** with request ID tracking

## Development Principles

1. **TDD**: Write failing test first, then implement
2. **Verify before claiming done**: Run commands, show evidence
3. **Check skills first**: See `.claude/skills/` before any task
4. **SpecKit for larger features**: `/specify` → `/plan` → `/tasks` →
   `/implement`

## Key Documentation

- [documents/project-summary.md](documents/project-summary.md) - Full
  architecture
- [.specify/memory/constitution.md](.specify/memory/constitution.md) -
  Development principles
- [documents/error-handling-summary.md](documents/error-handling-summary.md) -
  Error patterns

## Database Commands

```bash
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Apply schema changes
npm run db:studio    # Visual database editor
```

## Testing

```bash
npm run test:api        # API tests only (209)
npm run test:web        # Web tests only (270)
npm run test:coverage   # With coverage report
```

Coverage targets: 80%+ (currently exceeding all targets)

## Skills Available

Located in `.claude/skills/`:

- `test-driven-development` - TDD workflow enforcement
- `verification-before-completion` - Evidence-based completion
- `systematic-debugging` - Four-phase debugging approach
- `code-review-quality` - Review workflow
- `accessibility` - WCAG 2.2 compliance
- `security-review` - OWASP-based checks
- `error-handling` - Project error patterns
- `testing` - Testing patterns and utilities
