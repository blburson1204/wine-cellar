# Wine Cellar Project Summary

**Last Updated**: January 23, 2026

## Project Overview

Wine Cellar is a full-stack web application for managing personal wine
collections. Built with modern web technologies, it provides a clean, intuitive
interface for tracking wines with full CRUD operations.

## Tech Stack

### Frontend

- **Framework**: Next.js 15.5.9 (App Router)
- **UI Library**: React 18.3.1
- **Language**: TypeScript 5.6.0
- **Styling**: Inline styles with wine-themed color palette
- **Font**: Inter (Google Fonts)

### Backend

- **API Framework**: Express.js
- **Language**: TypeScript
- **Architecture**: RESTful API

### Database

- **Database**: PostgreSQL
- **ORM**: Prisma
- **Containerization**: Docker Compose (port 5433)

### Testing

- **Test Runner**: Vitest 4.0.16
- **React Testing**: React Testing Library 16.3.1
- **User Interactions**: @testing-library/user-event 14.6.1
- **Assertions**: @testing-library/jest-dom 6.9.1
- **HTTP Testing**: Supertest 7.1.4
- **Environment**: Node.js (API), jsdom (Web)

### Error Handling & Logging

- **Logger**: Winston 3.x
- **HTTP Logging**: Morgan
- **Validation**: Zod 3.25.76 (stable)
- **Error Tracking**: Sentry-ready (not configured)

### Code Quality & Standards

- **Linter**: ESLint 9.39.2 with strict rules
- **Formatter**: Prettier 3.7.4
- **Git Hooks**: Husky 9.1.7
- **Staged Files**: lint-staged 16.2.7
- **Commit Linting**: commitlint with conventional commits
- **Type Checking**: TypeScript strict mode enabled

### Development Tools

- Docker Desktop
- Node.js 18.17+
- tsx (hot reload for API)

## Project Structure

```
wine-cellar/
├── apps/
│   ├── api/                    # Express API server (port 3001)
│   │   ├── src/
│   │   │   ├── server.ts      # API entry point
│   │   │   ├── app.ts         # Express app configuration
│   │   │   ├── errors/        # Custom error classes
│   │   │   ├── middleware/    # Error handling, logging, validation
│   │   │   ├── schemas/       # Zod validation schemas
│   │   │   └── utils/         # Winston logger
│   │   ├── logs/              # Log files (gitignored)
│   │   └── __tests__/         # API test suite (49 tests)
│   │
│   └── web/                    # Next.js frontend (port 3000)
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx  # Root layout with ErrorBoundary
│       │   │   ├── page.tsx    # Home page (wine list)
│       │   │   └── api/        # Next.js API routes (proxy)
│       │   ├── components/     # React components
│       │   │   └── ErrorBoundary.tsx  # Error boundary
│       │   └── utils/          # API utilities with error handling
│       ├── __tests__/          # React component tests (11 tests)
│       ├── jest.config.js      # Jest configuration
│       └── jest.setup.js       # Test environment setup
│
├── packages/
│   └── database/               # Shared Prisma client
│       ├── prisma/
│       │   └── schema.prisma   # Database schema
│       └── index.ts            # Exported Prisma client
│
├── .github/
│   ├── workflows/
│   │   └── code-quality.yml    # CI/CD pipeline for code quality
│   └── PULL_REQUEST_TEMPLATE.md  # Pull request template
│
├── .claude/
│   └── skills/
│       ├── error-handling/     # Error handling skill
│       ├── testing/            # Testing skill
│       ├── code-review/        # Code review skill
│       └── ui-design/          # UI design skill
│
├── .husky/                     # Git hooks
│   ├── pre-commit             # Pre-commit hooks
│   └── commit-msg             # Commit message validation
│
├── docker-compose.yml          # PostgreSQL container config
├── package.json                # Root workspace config
├── eslint.config.mjs          # ESLint configuration
├── .prettierrc                # Prettier configuration
├── .prettierignore            # Prettier ignore patterns
├── commitlint.config.js       # Commitlint configuration
├── TODO.md                     # Project roadmap
├── PROJECT_SUMMARY.md          # This file
└── ERROR-HANDLING-SUMMARY.md   # Error handling implementation details
```

## Database Schema

```prisma
model Wine {
  id             String    @id @default(cuid())
  name           String
  vintage        Int
  producer       String
  region         String?
  country        String
  grapeVariety   String?
  blendDetail    String?
  color          WineColor
  quantity       Int       @default(1)
  purchasePrice  Float?
  purchaseDate   DateTime?
  drinkByDate    DateTime?
  rating         Float?
  expertRatings  String?
  wherePurchased String?
  notes          String?
  wineLink       String?
  imageUrl       String?
  favorite       Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

enum WineColor {
  RED
  WHITE
  ROSE
  SPARKLING
  DESSERT
  FORTIFIED
}
```

## API Endpoints

| Method | Endpoint               | Description                       | Status Codes  |
| ------ | ---------------------- | --------------------------------- | ------------- |
| GET    | `/api/docs`            | Interactive API docs (Swagger UI) | 200           |
| GET    | `/api/docs.json`       | OpenAPI 3.0 specification         | 200           |
| GET    | `/api/health`          | Health check with DB status       | 200, 503      |
| GET    | `/api/wines`           | List all wines                    | 200           |
| GET    | `/api/wines/:id`       | Get a single wine by ID           | 200, 404      |
| POST   | `/api/wines`           | Create a new wine                 | 201, 400      |
| PUT    | `/api/wines/:id`       | Update an existing wine           | 200, 400, 404 |
| DELETE | `/api/wines/:id`       | Delete a wine                     | 204, 404      |
| GET    | `/api/wines/:id/image` | Get wine label image              | 200, 404      |
| POST   | `/api/wines/:id/image` | Upload wine label image           | 200, 400, 404 |
| DELETE | `/api/wines/:id/image` | Delete wine label image           | 204, 404      |

### API Documentation

Interactive API documentation is available at http://localhost:3001/api/docs.
Built with:

- **@asteasolutions/zod-to-openapi**: Auto-generates OpenAPI specs from Zod
  schemas
- **swagger-ui-express**: Provides interactive documentation UI

The documentation stays in sync with validation schemas automatically.

### Error Response Format

All errors return a consistent JSON format:

```json
{
  "error": "Human-readable error message",
  "errorCode": "MACHINE_READABLE_CODE",
  "requestId": "uuid-for-tracking",
  "fields": {
    "fieldName": ["validation error 1", "validation error 2"]
  }
}
```

### Example Request

```bash
curl -X POST http://localhost:3001/api/wines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chateau Margaux",
    "vintage": 2015,
    "producer": "Chateau Margaux",
    "country": "France",
    "color": "RED",
    "quantity": 2
  }'
```

## Features Completed ✅

### Core Functionality

- [x] Full CRUD operations for wines
- [x] RESTful API with proper error handling
- [x] Clean, responsive UI with wine collection management
- [x] Loading states and empty state messaging
- [x] Confirmation dialogs for destructive actions
- [x] Color-coded wine types with visual indicators
- [x] Form validation (required fields, vintage range)
- [x] Combo dropdown fields for Producer, Country, Grape Variety, Region
      (auto-complete from existing values)
- [x] All table columns sortable (Wine, Vintage, Producer, Price, Rating, Type,
      Region, Grape, Country, In Cellar)

### Wine Label Images (Phase 1 Complete)

- [x] Display wine label images in detail modal
- [x] Upload new wine label images during creation
- [x] Upload, replace, and delete images for existing wines
- [x] Image preview before committing changes
- [x] Image optimization (resize, compress, format conversion)
- [x] File validation (type, size, magic number)
- [x] Local file storage with caching

### Wine Favorites

- [x] Mark wines as favorites with star icon in table
- [x] Toggle favorite status from detail modal header
- [x] Filter to show only favorite wines
- [x] Ruby red star color matching app theme (#E63946)
- [x] Optimistic UI updates for instant feedback

### Database & Infrastructure

- [x] PostgreSQL database with Docker setup
- [x] Prisma ORM with type-safe client
- [x] Database migrations via `prisma db push`
- [x] Schema with enums for wine colors

### Testing

- [x] **API Testing**: 144 tests passing (100% success rate)
  - 18 CRUD endpoint tests
  - 31 error handling tests
  - 95 image upload tests (validation, processing, storage, integration)
  - Input validation (Zod 3.25.76)
  - Request ID tracking
  - Database operations
  - Prisma error handling
  - Health check endpoint
  - Sequential execution to prevent race conditions
  - Isolated test database on port 5433

- [x] **React Component Testing**: 204 tests with **78%+ coverage** ✅
  - 23 API utility tests (fetchApi, ApiError, getErrorMessage)
  - 14 ErrorBoundary tests (normal rendering, error catching, Try Again)
  - 69 WineTable tests (empty state, sorting all columns, row clicks, color
    indicators, favorites, keyboard navigation)
  - 29 WineFilters tests (search, wine types, country, rating, price ranges,
    favorites)
  - 23 page.tsx tests (loading, empty state, add/delete wine, sorting)
  - 22 WineDetailModal tests (view/edit/add modes, validation, save/update)
  - 28 WineDetailModal image tests (upload, delete, preview, validation)

**Test Configuration:**

- Vitest 4.0.16 with `fileParallelism: false`
- ESM module system for compatibility
- **Coverage targets exceeded** ✅:
  - API: 77% branches, 89% functions, 83% lines/statements
  - Web: **78% functions**, **69% branches**, **80% lines** (all exceed
    targets!)
- Test duration: ~5s for full suite (348 tests)
- Database URL configurable via environment variable for CI/local
- **Isolated test directories**: Tests use separate `uploads-test/wines`
  directory to prevent cleanup from deleting real uploaded images

**CI/CD Pipeline** (GitHub Actions):

- Runs on all PRs and pushes to main/develop branches
- **Lint job**: ESLint + Prettier format checking
- **Type-check job**: TypeScript compilation verification
- **Test job**: Full test suite with PostgreSQL service container, coverage
  upload to Codecov
- **Build job**: Verifies both API and Web apps compile successfully

### Test Coverage Metrics

**API Coverage:**

- Functions: 89.94% (target: 80%) ✅ **Exceeds target**
- Branches: 77.34% (target: 70%) ✅ **Exceeds target**
- Lines: 83.33% (target: 80%) ✅ **Exceeds target**
- Statements: 83.63% (target: 80%) ✅ **Exceeds target**

**Web Coverage:**

- Functions: 78.85% (target: 50%) ✅ **Exceeds by 58%**
- Branches: 69.44% (target: 35%) ✅ **Exceeds by 98%**
- Lines: 80.16% (target: 50%) ✅ **Exceeds by 60%**
- Statements: 78.85% (target: 50%) ✅ **Exceeds by 58%**

**Component Coverage Breakdown:**

- page.tsx: 83.52% lines (23 tests)
- WineTable.tsx: 88.33% lines (69 tests)
- WineFilters.tsx: 96.96% lines (29 tests)
- WineDetailModal.tsx: 65.34% lines (50 tests combined)
- ErrorBoundary.tsx: 100% lines (14 tests)
- api.ts utils: 100% lines (23 tests)

All coverage targets exceeded. See [TEST-SUMMARY.md](TEST-SUMMARY.md) for
detailed test breakdown.

### Design & UX

- [x] Wine-themed color palette (#7C2D3C burgundy, #F5F1E8 off-white)
- [x] Left-aligned sticky header with wine bottle emoji
- [x] Two-column layout: 25% filter sidebar, 75% wine table
- [x] Background image with transparency effects (wine_cellar_4.jpg at 0.75
      opacity)
- [x] Semi-transparent components with frosted glass effect (0.6 opacity, 4px
      blur)
- [x] Unified burgundy headers (#7C2D3C) across all UI elements
- [x] Bottle count header with filtered/total display
- [x] Scrollable wine table with fixed headers
- [x] Responsive table layout
- [x] Consistent background colors (`rgba(245, 241, 232, 0.8)`) for filter
      inputs and table highlights
- [x] Keyboard navigation (Arrow Up/Down, Enter) for wine table
- [x] Visual focus indicators with burgundy inset borders
- [x] Unified hover/focus states for consistent UX
- [x] Auto-focus management in modals (Close button in view mode, Name field in
      add/edit mode)
- [x] Hover effects and transitions (200ms)
- [x] Inter font family for clean typography
- [x] Consistent burgundy (#7C2D3C) styling in filter panel (checkbox labels,
      checkbox borders, dropdown text, input text)

### Accessibility (WCAG Compliance)

- [x] **Modal Accessibility**: `role="dialog"`, `aria-modal="true"`,
      `aria-labelledby` linking to modal title
- [x] **Escape Key Support**: Press Escape to close modals
- [x] **Focus Trap**: Tab/Shift+Tab cycles within modal, preventing focus escape
- [x] **Visible Focus Indicators**: Burgundy outline (`#7C2D3C`) on all
      interactive elements when focused via keyboard
  - Form inputs, selects, textareas: 2px outline with box-shadow
  - Buttons: 2px outline with 2px offset on `:focus-visible`
  - Table rows: 2px inset outline on focused row
  - Custom checkboxes: `:focus-within` on parent label highlights checkbox
    indicator
- [x] **Screen Reader Support**: Decorative emojis hidden with
      `aria-hidden="true"`
  - Header wine glass icon
  - Empty state wine icons
  - Error boundary warning icon
  - Placeholder wine icons in detail modal

**Files Modified for Accessibility:**

- `WineDetailModal.tsx` - Modal ARIA attributes, Escape key, focus trap
- `WineFilters.tsx` - Focus styles for inputs, selects, custom checkboxes
- `WineTable.tsx` - Focus indicator on table rows with tabIndex
- `layout.tsx` - aria-hidden on header emoji
- `ErrorBoundary.tsx` - aria-hidden on warning emoji

### Error Handling & Logging ✅

- [x] **Structured Logging**: Winston logger with JSON format
- [x] **Request Tracking**: UUID-based request IDs in all logs and responses
- [x] **Log Levels**: error, warn, info, debug with contextual metadata
- [x] **File Rotation**: Automatic log rotation (5MB max, 5 files)
- [x] **Custom Errors**: 7 error classes (ValidationError, NotFoundError, etc.)
- [x] **Error Handler**: Centralized middleware handling all error types
- [x] **Input Validation**: Zod schemas with field-level error messages
- [x] **React Error Boundaries**: Component-level error catching
- [x] **API Error Utility**: Typed error handling for frontend
- [x] **Health Endpoint**: Database connectivity monitoring
- [x] **Error Tests**: Comprehensive test suite for error scenarios

### Code Quality & Standards ✅

- [x] **ESLint Configuration**: Strict rules for TypeScript and React
  - TypeScript ESLint parser and plugin
  - React, React Hooks, and JSX accessibility plugins
  - Import statement organization
  - Prettier integration (no conflicts)
- [x] **Prettier Formatting**: Automatic code formatting
  - Consistent code style across all files
  - Integrated with ESLint
  - Pre-commit formatting checks
- [x] **TypeScript Strict Mode**: Enhanced type safety
  - Strict null checks
  - No implicit any
  - Strict property initialization
- [x] **Git Hooks with Husky**: Pre-commit quality gates
  - Auto-run linting on staged files
  - Format check before commit
  - Type checking validation
- [x] **Conventional Commits**: Standardized commit messages
  - commitlint validation
  - Semantic versioning ready
  - Clear changelog generation
- [x] **GitHub Actions CI/CD**: Automated quality checks
  - Lint, format, and type check on PRs
  - Automated test execution
  - Build verification
- [x] **Pull Request Template**: Structured code review process
- [x] **Code Review Checklist**: Comprehensive review guidelines
- [x] **Documentation Standards**: Skill-based documentation in .claude/

## Setup Instructions

### Prerequisites

- Node.js 20+ (required for test runner compatibility)
- Docker Desktop
- npm

### Installation Steps

1. **Clone and install dependencies**:

   ```bash
   git clone https://github.com/blburson1204/wine-cellar.git
   cd wine-cellar
   npm install
   ```

2. **Create environment file**:

   ```bash
   cat > .env << 'EOF'
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/wine_cellar"
   EOF
   ```

3. **Copy .env to subdirectories**:

   ```bash
   cp .env packages/database/.env
   cp .env apps/api/.env
   ```

4. **Start PostgreSQL**:

   ```bash
   docker-compose up -d
   ```

5. **Set up database**:

   ```bash
   npm run db:generate
   npm run db:push
   ```

6. **Start development servers**:

   ```bash
   npm run dev
   ```

7. **Access the application**:
   - Web: http://localhost:3000
   - API: http://localhost:3001

### Available Scripts

| Command                 | Description                           |
| ----------------------- | ------------------------------------- |
| `npm run dev`           | Start both API and web servers        |
| `npm run dev:api`       | Start API server only                 |
| `npm run dev:web`       | Start web server only                 |
| `npm run db:generate`   | Generate Prisma client                |
| `npm run db:push`       | Push schema changes to database       |
| `npm run db:studio`     | Open Prisma Studio (visual DB editor) |
| `npm test`              | Run all tests                         |
| `npm run test:watch`    | Run tests in watch mode               |
| `npm run test:coverage` | Generate test coverage report         |
| `npm run lint`          | Run ESLint to check code quality      |
| `npm run lint:fix`      | Auto-fix ESLint issues                |
| `npm run format`        | Format code with Prettier             |
| `npm run format:check`  | Check code formatting                 |
| `npm run type-check`    | Run TypeScript type checking          |

## Development Workflow

1. **Making Schema Changes**:

   ```bash
   # Edit packages/database/prisma/schema.prisma
   npm run db:generate  # Regenerate Prisma client
   npm run db:push      # Apply changes to database
   ```

2. **Running Tests**:

   ```bash
   # API tests
   cd apps/api
   npm test

   # React tests
   cd apps/web
   npm test

   # Coverage report
   npm run test:coverage
   ```

3. **Stopping the Application**:
   ```bash
   # Stop dev servers: Ctrl+C
   # Stop database:
   docker-compose down
   ```

## Error Handling & Logging Implementation

A comprehensive error handling and logging system has been implemented. See
[ERROR-HANDLING-SUMMARY.md](ERROR-HANDLING-SUMMARY.md) for complete details.

### Key Features

- **Winston Logger**: Structured JSON logging with file rotation
- **Request IDs**: Track requests across all logs and error responses
- **Custom Error Classes**: 7 typed error classes with HTTP status codes
- **Centralized Handler**: Catches Zod, Prisma, and custom errors
- **Input Validation**: Zod schemas for type-safe validation
- **React Error Boundaries**: Frontend error catching
- **Health Check**: Database connectivity monitoring at `/api/health`

### Files Added

- `apps/api/src/utils/logger.ts` - Winston configuration
- `apps/api/src/middleware/requestId.ts` - Request ID tracking
- `apps/api/src/middleware/errorHandler.ts` - Error handling
- `apps/api/src/errors/AppError.ts` - Custom error classes
- `apps/api/src/schemas/wine.schema.ts` - Zod validation
- `apps/web/src/components/ErrorBoundary.tsx` - React error boundary
- `apps/web/src/utils/api.ts` - API error handling
- `.claude/skills/error-handling/SKILL.md` - Error handling documentation

## Next Priorities

See [TODO.md](TODO.md) for the complete roadmap. Top priorities:

### 1. Security Best Practices (NEXT PRIORITY)

- XSS/CSRF protection
- Rate limiting
- Security headers (helmet.js)
- Dependency scanning

### 2. Performance Optimization

- Database indexes
- Caching strategy (Redis)
- Code splitting
- Bundle size analysis
- Load testing

## Key Technical Decisions

### Why Next.js 15?

- App Router for modern routing patterns
- Server components support (future enhancement)
- Built-in API routes for proxying
- Excellent TypeScript support

### Why Prisma?

- Type-safe database client
- Automatic migrations
- Excellent TypeScript integration
- Built-in protection against SQL injection

### Why Docker for Database?

- Consistent development environment
- Easy setup and teardown
- Data persistence via volumes
- Isolated from host system

### Testing Strategy

- Unit tests for API endpoints (Vitest + Supertest)
- Component tests for React UI (React Testing Library)
- Error scenario testing (31 dedicated error tests)
- Mock fetch for API calls
- Coverage thresholds enforced (70% branches, 80% functions/lines/statements)
- Fast feedback loop with Vitest
- Sequential test execution to prevent database race conditions
- Isolated test database with cleanup between tests

## Known Limitations

1. **No Authentication**: All wines are publicly accessible
2. **No Pagination**: Large collections may have performance issues
3. **Local Image Storage Only**: Wine images stored locally (AWS S3 planned for
   production)
4. **Inline Styles**: No CSS modules or styled-components
5. **No Sentry Integration**: Error tracking service not configured
   (infrastructure ready)

## Future Enhancements

See [TODO.md](TODO.md) for comprehensive list. Major features planned:

- User authentication and authorization
- Thumbnail images in wine table (Phase 2)
- AWS S3 + CloudFront for production image storage (Phase 3)
- Cellar location tracking
- Drinking window recommendations
- Collection analytics and reports
- Mobile PWA
- CSV import/export
- Deployment to production (Vercel/Railway)

## Contributing

This is a personal project. Contributions are welcome via pull requests.

## License

MIT

---

**Project Status**: Active Development **Version**: 1.0.0 **Repository**:
https://github.com/blburson1204/wine-cellar
