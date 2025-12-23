# Wine Cellar Project Summary

**Last Updated**: December 23, 2025

## Project Overview

Wine Cellar is a full-stack web application for managing personal wine collections. Built with modern web technologies, it provides a clean, intuitive interface for tracking wines with full CRUD operations.

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
- **Test Runner**: Jest 30.2.0
- **React Testing**: React Testing Library 16.3.1
- **User Interactions**: @testing-library/user-event 14.6.1
- **Assertions**: @testing-library/jest-dom 6.9.1
- **Environment**: jsdom

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
│   │   │   ├── index.ts       # API entry point
│   │   │   └── routes/        # API route handlers
│   │   └── __tests__/         # API test suite (18 tests)
│   │
│   └── web/                    # Next.js frontend (port 3000)
│       ├── src/
│       │   └── app/
│       │       ├── layout.tsx  # Root layout with header
│       │       ├── page.tsx    # Home page (wine list)
│       │       └── api/        # Next.js API routes (proxy)
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
├── docker-compose.yml          # PostgreSQL container config
├── package.json                # Root workspace config
├── TODO.md                     # Project roadmap
└── PROJECT_SUMMARY.md          # This file
```

## Database Schema

```prisma
model Wine {
  id            String    @id @default(cuid())
  name          String
  vintage       Int
  producer      String
  region        String?
  country       String
  grapeVariety  String?
  color         WineColor
  quantity      Int       @default(1)
  purchasePrice Float?
  purchaseDate  DateTime?
  drinkByDate   DateTime?
  rating        Int?
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wines` | List all wines |
| GET | `/api/wines/:id` | Get a single wine by ID |
| POST | `/api/wines` | Create a new wine |
| PUT | `/api/wines/:id` | Update an existing wine |
| DELETE | `/api/wines/:id` | Delete a wine |

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

### Database & Infrastructure
- [x] PostgreSQL database with Docker setup
- [x] Prisma ORM with type-safe client
- [x] Database migrations via `prisma db push`
- [x] Schema with enums for wine colors

### Testing
- [x] **API Testing**: 18 tests with >70% coverage
  - Endpoint validation
  - Error handling
  - Database operations

- [x] **React Component Testing**: 11 tests with >70% coverage
  - Loading states
  - Empty collection display
  - Wine list rendering
  - Form toggle and submission
  - Delete functionality
  - Error handling for fetch/add/delete operations

### Test Coverage Metrics
```
Statements   : 80.39% (82/102)
Branches     : 76.47% (13/17)
Functions    : 61.9% (13/21)
Lines        : 81.63% (80/98)
```
All coverage thresholds met (70% for statements/branches/lines, 60% for functions).

### Design & UX
- [x] Wine-themed color palette (#7C2D3C burgundy, #F5F1E8 off-white)
- [x] Sticky header with wine bottle emoji
- [x] Responsive table layout
- [x] Hover effects and transitions
- [x] Inter font family for clean typography

## Setup Instructions

### Prerequisites
- Node.js 18.17+
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

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both API and web servers |
| `npm run dev:api` | Start API server only |
| `npm run dev:web` | Start web server only |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Prisma Studio (visual DB editor) |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |

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

## Next Priorities

See [TODO.md](TODO.md) for the complete roadmap. Top priorities:

### 1. Error Handling and Logging (HIGH PRIORITY)
- Implement structured logging (Winston/Pino)
- Add request ID tracking
- Centralized error handling middleware
- Custom error classes
- Error tracking with Sentry
- Frontend error boundaries

### 2. Code Review and Standards (HIGH PRIORITY)
- ESLint configuration with strict rules
- Prettier for code formatting
- TypeScript strict mode
- Pre-commit hooks (Husky + lint-staged)
- Pull request templates

### 3. Security Best Practices
- Input validation with Zod
- XSS/CSRF protection
- Rate limiting
- Security headers (helmet.js)
- Dependency scanning

### 4. Performance Optimization
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
- Unit tests for API endpoints
- Component tests for React UI
- Mock fetch for API calls
- Coverage thresholds enforced
- Fast feedback loop with Jest

## Known Limitations

1. **No Authentication**: All wines are publicly accessible
2. **No Pagination**: Large collections may have performance issues
3. **No Search/Filter**: Users must scroll through entire list
4. **Basic Error Handling**: Errors only logged to console
5. **No Image Upload**: Wine labels/photos not supported yet
6. **Inline Styles**: No CSS modules or styled-components
7. **No Optimistic Updates**: UI waits for API responses

## Future Enhancements

See [TODO.md](TODO.md) for comprehensive list. Major features planned:

- User authentication and authorization
- Search and filtering capabilities
- Wine label photo uploads
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

**Project Status**: Active Development
**Version**: 1.0.0
**Repository**: https://github.com/blburson1204/wine-cellar
