# Wine Cellar

Personal wine collection manager. Full-stack TypeScript monorepo.

**Developer**: Brian

## Quick Start

```bash
npm run dev          # Start API (3001) + Web (3000)
npm test             # Run all tests (799 tests)
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
- **Testing**: Vitest, React Testing Library, Supertest, vitest-axe

## Key Patterns

- **Zod schemas** for all API validation (`apps/api/src/schemas/`)
- **Optimistic updates** for UI responsiveness
- **AppError classes** for typed error handling (`apps/api/src/errors/`)
- **Winston logger** with request ID tracking

## Development Principles

1. **TDD**: Write failing test first, then implement
2. **Verify before claiming done**: Run commands, show evidence
3. **Check skills first**: See `.specify/skill-manifest.yaml` for trigger
   conditions, `.claude/skills/` for full skill docs
4. **SpecKit for larger features**: `/specify` → `/clarify` → `/plan` → `/tasks`
   → `/implement`

## Key Documentation

- [documents/project-summary.md](documents/project-summary.md) - Full
  architecture
- [.specify/memory/constitution.md](.specify/memory/constitution.md) -
  Development principles
- [documents/error-handling-summary.md](documents/error-handling-summary.md) -
  Error patterns
- [.specify/skill-manifest.yaml](.specify/skill-manifest.yaml) - Skill trigger
  conditions (consult during SpecKit phases)

## Database Commands

```bash
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Apply schema changes
npm run db:studio    # Visual database editor
```

## Testing

```bash
npm run test:api        # API tests only (209)
npm run test:web        # Web tests only (590)
npm run test:coverage   # With coverage report
```

Coverage targets: 80%+ (currently exceeding all targets)

## Workflow Selection

For bug fixes and changes likely under ~3 files, use mainline (commit to main,
no SpecKit). For new features, refactors, or multi-file changes, suggest the
SpecKit feature branch workflow. When in doubt, ask.

## Skills Available

Located in `.claude/skills/`:

### Core Development

- `test-tdd` - TDD workflow enforcement
- `workflow-verify-complete` - Evidence-based completion
- `debug-systematic` - Four-phase debugging approach
- `debug-rca` - Root cause analysis tracing
- `code-review` - Review workflow
- `code-search` - Structured code verification with checklists
- `code-reuse-analysis` - Check for existing patterns before creating new ones

### Architecture & Design

- `arch-decisions` - Architecture decision framework
- `workflow-brainstorm` - Collaborative Socratic design refinement
- `db-prisma` - Prisma migration troubleshooting (never reset first)

### Security

- `security-review` - OWASP-based checks
- `security-defense-depth` - Four-layer validation pattern for Express APIs

### Documentation

- `doc-gate` - Post-feature documentation gate
- `doc-search` - Text-based documentation search
- `doc-update` - Systematic documentation maintenance

### Feature Lifecycle

- `feature-start` - Branch creation and context setup (feature branch workflow)
- `feature-ship` - Test, merge --no-ff, cleanup (feature branch workflow)
- `feature-capture-idea` - Quick idea capture to future-work.md
- `spec-validate` - Pre-planning spec completeness gate

### UI & Quality

- `ui-accessibility` - WCAG 2.2 compliance
- `error-handling` - Project error patterns
- `testing` - Testing patterns and utilities
- `ui-design` - UI design patterns

### Meta / Framework

- `meta-skill-guide` - Check for skills before any task
- `meta-health-check` - Audit framework artifacts for staleness
- `meta-context-optimize` - Context window management patterns

## Commands Available

Located in `.claude/commands/`:

### SpecKit Pipeline

- `/specify` - Create feature specification
- `/clarify` - Socratic questioning to reduce spec ambiguity
- `/analyze` - Analyze spec quality, detect missing sections
- `/plan` - Generate implementation plan from spec
- `/tasks` - Generate tasks.json with dependency ordering
- `/implement` - Execute tasks (delegates to `/ralph`)
- `/ralph` - Fresh-context-per-task execution (max 3 iterations)

### Code Quality

- `/code-review` - Pre-commit security and compliance review
- `/constitution` - Update project constitution

### Session Management

- `/session-note` - Quick timestamped note to current-work.md
- `/checkpoint` - Save session state at SpecKit phase boundary
- `/resume-spec` - Load checkpoint and resume work
- `/handoff` - Create resume prompt for new sessions

## Hooks Active

Located in `.claude/hooks/`, registered in `.claude/settings.json`. All hooks
are fail-open (errors allow through). See `.claude/docs/atom.md` for details.

### ATOM Hooks (Context & Verification)

- `pre-edit-verify.sh` - Blocks edits when `old_string` not found in file (stale
  file prevention)
- `precompact.sh` - Snapshots spec/task context before compaction
- `session-start.sh` - Restores context after compaction, cleans old task files
- `record-verification.sh` - Blocks session end if T-VERIFY evidence is
  missing/stale (only during active specs)

### Safety Hooks

- `forbidden-command-blocker.sh` - Blocks `npx prisma db push` (use
  `npm run db:push`), `git push --force` to main/master, `git reset --hard`
- `file-placement-guard.sh` - Blocks `.sh`/`.sql`/`.py` file creation in repo
  root (place in `scripts/`)

## Agents Available

Located in `.claude/agents/`:

- `code-reviewer` - Automated code review agent
- `test-analyzer` - Test failure categorization and prioritization
- `auto-fixer` - Automatic TypeScript/lint/import fixes
- `capture-idea` - Feature idea capture to future-work.md
- `spec-validator` - Spec completeness validation
- `documentation-reconciliation` - Documentation drift detection
