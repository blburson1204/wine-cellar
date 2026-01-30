# Wine Cellar

A full-stack wine collection management app built with Next.js, Express,
PostgreSQL, and Prisma.

## Features

- **Collection Management**: Add, view, edit, and delete wines with full CRUD
- **Wine Label Images**: Upload and display wine label photos
- **Favorites**: Mark wines as favorites with star toggle
- **Search & Filter**: Filter by type, country, vintage, price, rating,
  favorites
- **Sortable Columns**: Sort by any column (name, vintage, producer, price,
  etc.)
- **Keyboard Navigation**: Arrow keys and Enter for efficient browsing
- **Accessibility**: WCAG-compliant with focus indicators, ARIA labels, screen
  reader support
- **API Documentation**: Interactive Swagger UI at `/api/docs`

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Express, TypeScript, Zod validation
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Vitest, React Testing Library, Supertest, vitest-axe (752 tests,
  80%+ coverage)
- **Code Quality**: ESLint, Prettier, Husky, commitlint
- **CI/CD**: GitHub Actions

## Quick Start

### Prerequisites

- Node.js 20+
- Docker Desktop
- npm

### Installation

```bash
# Clone and install
git clone https://github.com/blburson1204/wine-cellar.git
cd wine-cellar
npm install

# Create environment file
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/wine_cellar"
EOF

# Copy to subdirectories
cp .env packages/database/.env
cp .env apps/api/.env

# Start database and initialize
docker-compose up -d
npm run db:generate
npm run db:push

# Start development servers
npm run dev
```

The app will be available at:

- **Web**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## Project Structure

```
wine-cellar/
├── apps/
│   ├── api/          # Express API (port 3001)
│   └── web/          # Next.js frontend (port 3000)
├── packages/
│   └── database/     # Prisma schema and client
├── documents/        # Project documentation
└── .claude/          # AI assistant skills and agents
```

## Available Scripts

| Command              | Description               |
| -------------------- | ------------------------- |
| `npm run dev`        | Start API and web servers |
| `npm test`           | Run all tests (752 tests) |
| `npm run lint`       | Run ESLint                |
| `npm run type-check` | TypeScript checking       |
| `npm run db:studio`  | Open Prisma Studio        |

## API Endpoints

| Method | Endpoint               | Description                   |
| ------ | ---------------------- | ----------------------------- |
| GET    | `/api/docs`            | Interactive API documentation |
| GET    | `/api/health`          | Health check with DB status   |
| GET    | `/api/wines`           | List all wines                |
| GET    | `/api/wines/:id`       | Get a single wine             |
| POST   | `/api/wines`           | Create a wine                 |
| PUT    | `/api/wines/:id`       | Update a wine                 |
| DELETE | `/api/wines/:id`       | Delete a wine                 |
| GET    | `/api/wines/:id/image` | Get wine label image          |
| POST   | `/api/wines/:id/image` | Upload wine label image       |
| DELETE | `/api/wines/:id/image` | Delete wine label image       |

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
  RED | WHITE | ROSE | SPARKLING | DESSERT | FORTIFIED
}
```

## Documentation

For detailed documentation, see:

- [Project Summary](documents/project-summary.md) - Full architecture and
  features
- [TODO](TODO.md) - Project roadmap and backlog
- [Error Handling](documents/error-handling-summary.md) - Error patterns and
  logging
- [Test Summary](documents/test-summary.md) - Test coverage details

## Code Quality

- **ESLint**: Strict TypeScript and React rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality checks
- **commitlint**: Conventional commit messages
- **GitHub Actions**: Automated CI/CD pipeline

## License

MIT
