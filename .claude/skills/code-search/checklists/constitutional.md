# Constitutional Compliance Checklist

## API Versioning

- [ ] All routes have version prefix (`/api/v1/`, `/api/v2/`)
- [ ] No routes without version prefix
- [ ] Breaking changes require new version
- [ ] Old versions maintained during deprecation period

## Portal Boundaries

- [ ] Admin portal routes in `(admin)` directory
- [ ] App portal routes in `(app)` directory
- [ ] Public routes in `(public)` directory
- [ ] No cross-portal imports

## Design System

- [ ] Components use existing TailwindCSS components
- [ ] No raw Tailwind colors (use design tokens)
- [ ] No arbitrary values without justification
- [ ] Typography uses design system scale

## Service Modules

- [ ] Business logic in Service Modules
- [ ] Services accept dependencies via constructor
- [ ] No controllers with business logic
- [ ] Services return typed results

## Database Access

- [ ] Prisma ORM used (no raw SQL except justified)
- [ ] Transactions for multi-step operations
- [ ] No N+1 queries
- [ ] Proper error handling

## Security

- [ ] Authentication required on protected routes
- [ ] Authorization checked at API and UI layers
- [ ] Input validation on all endpoints
- [ ] Sensitive data not logged

## Testing

- [ ] TDD followed (tests before implementation)
- [ ] Unit tests for services
- [ ] Contract tests for APIs
- [ ] No E2E tests for high-risk external APIs
