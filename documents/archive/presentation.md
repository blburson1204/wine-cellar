# Wine Cellar Project Presentation

---

## Slide 1: Title Slide

**Wine Cellar** A Modern Full-Stack Web Application

_Brian Burson_ _January 23, 2026_

---

## Slide 2: Project Overview

**What is Wine Cellar?**

A full-stack web application for managing personal wine collections

**Key Features:**

- Clean, intuitive interface with keyboard navigation
- Full CRUD operations with search and filtering
- All table columns sortable (Wine, Type, Region, Grape, Producer, Country,
  etc.)
- Combo dropdown fields with auto-complete (Producer, Country, Grape, Region)
- Wine label image upload with optimization
- Mark wines as favorites with filtering
- Real-time validation
- Production-ready error handling
- Comprehensive test coverage (348 tests)

---

## Slide 3: Tech Stack - Frontend

**Modern React Stack**

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** CSS-in-JS (inline styles)
- **State Management:** React hooks
- **Error Handling:** Error Boundaries

**Design:**

- Wine-themed color palette (#7C2D3C burgundy)
- Left-aligned sticky header with wine bottle emoji
- Responsive table layout with keyboard navigation
- Consistent background colors (`rgba(245, 241, 232, 0.8)`)
- Visual focus indicators with burgundy borders
- Auto-focus management in modals

---

## Slide 4: Tech Stack - Backend

**Express API with TypeScript**

- **Runtime:** Node.js 18.17+
- **Framework:** Express.js
- **Language:** TypeScript
- **Architecture:** RESTful API
- **Hot Reload:** tsx for development

**Database:**

- PostgreSQL (Docker containerized)
- Prisma ORM
- Port 5433 (isolated from system)

---

## Slide 5: API Endpoints

**RESTful API Design**

| Method | Endpoint               | Description     | Status        |
| ------ | ---------------------- | --------------- | ------------- |
| GET    | `/api/health`          | Health check    | 200, 503      |
| GET    | `/api/wines`           | List all wines  | 200           |
| GET    | `/api/wines/:id`       | Get wine by ID  | 200, 404      |
| POST   | `/api/wines`           | Create wine     | 201, 400      |
| PUT    | `/api/wines/:id`       | Update wine     | 200, 400, 404 |
| DELETE | `/api/wines/:id`       | Delete wine     | 204, 404      |
| GET    | `/api/wines/:id/image` | Get wine image  | 200, 404      |
| POST   | `/api/wines/:id/image` | Upload image    | 200, 400, 404 |
| DELETE | `/api/wines/:id/image` | Delete image    | 204, 404      |
| GET    | `/api/docs`            | Swagger UI docs | 200           |

---

## Slide 6: Error Handling Architecture

**Production-Ready Error System**

**7 Custom Error Classes:**

- ValidationError (400)
- NotFoundError (404)
- UnauthorizedError (401)
- ForbiddenError (403)
- ConflictError (409)
- DatabaseError (500)
- AppError (base class)

**Consistent Error Response:**

```json
{
  "error": "Human-readable message",
  "errorCode": "MACHINE_READABLE_CODE",
  "requestId": "uuid-for-tracking",
  "fields": { "fieldName": ["errors"] }
}
```

---

## Slide 7: Structured Logging

**Winston Logger with Request Tracking**

**Features:**

- JSON-formatted structured logs
- Multiple log levels (error, warn, info, debug)
- File rotation (5MB max, 5 files)
- Request ID correlation
- Contextual metadata

**Log Files:**

- `logs/error.log` - Errors only
- `logs/combined.log` - All logs

**Every request tracked with unique UUID**

---

## Slide 8: Input Validation

**Zod 3.25.76 - Type-Safe Validation**

**Features:**

- Runtime type validation
- Field-level error messages
- Automatic string trimming
- Enum validation
- Number range checks
- Strict mode (rejects unknown fields)

**Example Rules:**

- Name: 1-200 characters, required
- Vintage: 1900 to current year
- Rating: 1-100 integer, optional
- Notes: Max 2000 characters

---

## Slide 9: Code Quality & Standards

**Automated Quality Enforcement**

**Tools & Configuration:**

- **ESLint 9.39.2**: Strict TypeScript and React rules
- **Prettier 3.7.4**: Automatic code formatting
- **Husky**: Git hooks for pre-commit checks
- **lint-staged**: Run checks only on changed files
- **commitlint**: Enforce conventional commits

**Pre-Commit Checks:**

- Lint all staged files
- Format code with Prettier
- TypeScript type checking
- Validate commit messages

**CI/CD Pipeline:**

- GitHub Actions workflow
- Automated quality checks on PRs
- Zero errors policy

---

## Slide 10: Testing - The Journey

**From Failure to Success**

**The Problem:**

- 22 test failures
- Validation errors returning 500 instead of 400
- Race conditions in parallel test execution

**The Root Cause:**

- Zod 4.2.1 (experimental, abandoned branch)
- Broken transform behavior
- Parallel test database conflicts

**The Solution:**

- Upgraded to Zod 3.25.76 (stable)
- Configured sequential test execution
- Result: **49/49 tests passing**

---

## Slide 11: Test Coverage

**Comprehensive Testing Strategy**

**348 Tests Passing (100% success rate)** ✅

**API Tests (144):**

- 18 CRUD endpoint tests
- 31 error handling tests
- 95 image upload tests (validation, processing, storage)

**Web Tests (204):**

- 23 API utility tests
- 14 ErrorBoundary tests
- 69 WineTable tests (sorting all columns, keyboard nav, favorites)
- 29 WineFilters tests
- 23 page.tsx integration tests
- 50 WineDetailModal tests (including image upload)

**Test duration: ~5s**

**All coverage targets exceeded!**

---

## Slide 12: Test Breakdown - API Tests

**18 CRUD Endpoint Tests**

**Coverage:**

- ✓ Health check endpoint
- ✓ Create wines (POST)
  - Valid data, optional fields, all wine colors
- ✓ List wines (GET)
  - Empty array, full list, sorted by date
- ✓ Get wine by ID
  - Success and 404 cases
- ✓ Update wines (PUT)
  - Single field, multiple fields, 404 handling
- ✓ Delete wines (DELETE)
  - Success and 404 cases
- ✓ Full lifecycle integration test

---

## Slide 13: Test Breakdown - Error Handling

**31 Error Handling Tests**

**Categories:**

- **Validation Errors (12 tests)**
  - Missing fields, invalid types, range checks
  - String length limits, multiple errors

- **Not Found Errors (4 tests)**
  - GET/PUT/DELETE non-existent wines

- **Request ID Tracking (3 tests)**
  - Headers, error responses, custom IDs

- **Data Type Validation (3 tests)**
  - String/number type enforcement

- **String Sanitization (3 tests)**
  - Whitespace trimming

- **Edge Cases (3 tests)**
  - Empty objects, null values

---

## Slide 14: Test Breakdown - Web Tests

**204 Component & Utility Tests**

**Test Coverage Achievements:**

- **Functions**: 78.85% (target: 50%) - **Exceeds by 58%** ✅
- **Branches**: 69.44% (target: 35%) - **Exceeds by 98%** ✅
- **Lines**: 80.16% (target: 50%) - **Exceeds by 60%** ✅
- **Statements**: 78.85% (target: 50%) - **Exceeds by 58%** ✅

**Component Coverage:**

- api.ts utils: 100% lines (23 tests)
- ErrorBoundary: 100% lines (14 tests)
- WineFilters: 96.96% lines (29 tests)
- WineTable: 88.33% lines (69 tests)
- WineDetailModal: 65.34% lines (50 tests)
- page.tsx: 83.52% lines (23 tests)

---

## Slide 15: Database Schema

**PostgreSQL with Prisma ORM**

**Wine Model:**

- id (String, CUID)
- name, vintage, producer, country (required)
- region, grapeVariety, blendDetail (optional)
- color (Enum: RED, WHITE, ROSE, SPARKLING, DESSERT, FORTIFIED)
- quantity (default: 1)
- purchasePrice, purchaseDate, wherePurchased
- drinkByDate, rating (1-100), expertRatings
- notes (max 2000 chars), wineLink
- imageUrl, favorite (default: false)
- createdAt, updatedAt

**Type-safe with Prisma Client**

---

## Slide 16: Test Configuration

**Vitest 4.0.16 Setup**

**Key Settings:**

```typescript
{
  environment: 'node',
  pool: 'forks',
  fileParallelism: false,  // Sequential!
  coverage: {
    provider: 'v8',
    thresholds: {
      branches: 70%,
      functions: 80%,
      lines: 80%
    }
  }
}
```

**Isolated test database on port 5433** **Clean state before each test**

---

## Slide 17: UI/UX Improvements

**January 1, 2026 - Enhanced User Experience**

**Keyboard Navigation:**

- Arrow Up/Down to navigate wine table rows
- Enter key to open wine details modal
- Visual focus with burgundy inset borders
- First row auto-focused on page load

**Consistent Design:**

- Unified background color (`rgba(245, 241, 232, 0.8)`) across:
  - Filter inputs (search, dropdowns, number fields)
  - Wine Type checkbox container
  - Table row highlights (hover and focus)
- Same styling for hover and keyboard focus
- Burgundy borders distinguish keyboard focus

**Smart Focus Management:**

- View mode: Auto-focus Close button
- Add/Edit mode: Auto-focus Name field
- Efficient data entry workflow

**Layout Refinements:**

- Left-aligned header (full viewport width)
- Filter sidebar and table properly aligned

---

## Slide 18: Recent Achievements

**January 2026 - Major Feature Updates**

**Combo Dropdown Fields (January 22):**

- Producer, Country, Grape Variety, Region now auto-complete
- Dropdown shows existing values from database
- Type to filter or add new values

**All Columns Sortable (January 23):**

- Extended sorting to Type, Region, Grape, Country, In Cellar
- All 10 columns now sortable with click-to-sort headers
- Consistent styling with dotted underlines and hover effects

**UI Styling Consistency (January 23):**

- Burgundy (#7C2D3C) color throughout filter panel
- Checkbox labels, borders, dropdown text, input text unified

**Test Coverage Excellence:**

- 348 tests passing (100% success rate)
- Web coverage: 80%+ lines, 78%+ functions
- API coverage: 89%+ functions, 83%+ lines

**Wine Label Images (Phase 1 Complete):**

- Upload, replace, delete wine label images
- Image optimization (resize, compress, format conversion)
- Preview before saving

**Result: Feature-rich, professionally tested application**

---

## Slide 17: Project Structure

**Monorepo Architecture**

```
wine-cellar/
├── apps/
│   ├── api/          # Express API (port 3001)
│   │   ├── src/      # Source code
│   │   ├── __tests__ # 49 tests
│   │   └── logs/     # Winston logs
│   └── web/          # Next.js app (port 3000)
│       ├── src/      # React components
│       └── __tests__ # 11 component tests
├── packages/
│   └── database/     # Shared Prisma client
└── .claude/
    └── skills/       # AI documentation
```

---

## Slide 18: Development Workflow

**Modern Development Experience**

**Setup:**

```bash
npm install
docker-compose up -d
npm run dev
```

**Testing:**

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

**Features:**

- Hot reload (API & frontend)
- Docker database
- TypeScript throughout
- Comprehensive logging

---

## Slide 19: Key Technical Decisions

**Why These Technologies?**

**Monorepo Structure:**

- Shared types between frontend/backend
- Single dependency management
- Consistent tooling

**Docker for Database:**

- Consistent dev environment
- Easy setup/teardown
- Data persistence
- Isolated from system

**Zod for Validation:**

- Runtime + compile-time safety
- Excellent error messages
- TypeScript integration

---

## Slide 20: Error Handling Features

**8 Major Components**

1. **Winston Logger** - Structured JSON logging
2. **Request ID Middleware** - UUID tracking
3. **Custom Error Classes** - 7 typed errors
4. **Centralized Handler** - Catches all errors
5. **Zod Validation** - Field-level messages
6. **React Error Boundaries** - Frontend catching
7. **Health Check Endpoint** - Database monitoring
8. **Comprehensive Tests** - 31 error scenarios

**Production-ready from day one**

---

## Slide 21: Known Limitations

**Areas for Future Enhancement**

1. No authentication (public access)
2. No pagination (performance risk with large collections)
3. Local image storage only (AWS S3 planned for production)
4. Inline styles (no CSS modules)
5. Sentry not configured (infrastructure ready)

**Trade-offs for rapid development**

---

## Slide 22: Next Priorities

**Roadmap Ahead**

**1. Security**

- XSS/CSRF protection
- Rate limiting
- Security headers (helmet.js)

**2. Performance**

- Database indexes
- Caching (Redis)
- Code splitting

---

## Slide 23: Project Metrics

**By the Numbers**

- **348** tests passing (100%)
- **~5s** test execution time
- **80%+** code coverage (web)
- **89%+** API function coverage
- **7** custom error classes
- **11** API endpoints (including image upload)
- **10** sortable table columns
- **4** combo dropdown fields
- **0** linting errors
- **0** formatting issues
- **0** type errors
- **0** test failures

**Production-ready application!**

---

## Slide 24: Documentation

**Comprehensive Documentation**

**Project Documentation:**

- project-summary.md - Full overview
- error-handling-summary.md - Error system
- test-summary.md - Test details
- TODO.md - Roadmap

**Code Documentation:**

- TypeScript interfaces
- JSDoc comments
- Zod schemas as documentation
- README files

**Skills Documentation:**

- .claude/skills/ - AI-assisted patterns

---

## Slide 25: Demo Time

**Live Application**

**Frontend:** http://localhost:3000

- Wine list view with search and filtering
- Keyboard navigation (Arrow Up/Down, Enter)
- Add new wine form with auto-focus
- Edit/delete operations
- Error handling

**API:** http://localhost:3001

- Health check: GET /api/health
- CRUD operations
- Error responses
- Request ID tracking

**Database:** PostgreSQL on port 5433

---

## Slide 26: Key Takeaways

**What We Built**

✅ Production-ready full-stack application ✅ Comprehensive error handling &
logging ✅ Wine label image upload with optimization ✅ All columns sortable,
combo dropdown fields ✅ 100% test pass rate (348 tests) ✅ 80%+ code coverage
✅ Type-safe end-to-end ✅ Docker-based development ✅ CI/CD pipeline with
GitHub Actions ✅ Complete documentation

**Ready for production deployment**

---

## Slide 27: Questions?

**Thank You!**

**Repository:** https://github.com/blburson1204/wine-cellar

**Documentation:**

- project-summary.md
- error-handling-summary.md
- test-summary.md

**Contact:** Brian Burson

---

## Slide 28: Bonus - Technical Deep Dive

**For the Curious**

**Interesting Challenges Solved:**

1. Zod versioning confusion (4.x vs 3.x)
2. Test race conditions
3. String trimming in middleware
4. Request ID correlation
5. Prisma error mapping
6. ESLint 9 flat config migration
7. Prettier + ESLint integration
8. Pre-commit hook performance

**Lessons Learned:**

- Always verify stable vs experimental
- Sequential tests for shared resources
- Middleware composition matters
- Error handling is not optional
- Tests catch everything
- Automated quality checks prevent issues
- Git hooks ensure consistency

---
