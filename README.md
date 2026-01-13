# Wine Cellar

A full-stack wine collection management app built with Next.js, Express,
PostgreSQL, and Prisma.

## Features

- Add, view, edit, and delete wines
- Track vintage, producer, country, color, quantity, and more
- Search and filter wines (by type, variety, country, vintage, price)
- Sortable table columns (name, vintage, producer, price)
- Full keyboard navigation with arrow keys and Enter
- Auto-focus for efficient data entry
- Clean, wine-themed UI with consistent interactions
- RESTful API

## Tech Stack

- **Frontend**: Next.js 13, React, TypeScript
- **Backend**: Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Code Quality**: ESLint, Prettier, Husky, lint-staged, commitlint
- **Dev Tools**: Docker Compose, tsx (hot reload)

## Project Structure

```
wine-cellar/
├── apps/
│   ├── api/          # Express API (port 3001)
│   └── web/          # Next.js frontend (port 3000)
├── packages/
│   └── database/     # Prisma schema and client
├── docker-compose.yml
└── package.json
```

## Setup

### Prerequisites

- Node.js 20+ (required for test runner compatibility)
- Docker Desktop
- npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/blburson1204/wine-cellar.git
cd wine-cellar
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/wine_cellar"
EOF
```

4. Copy .env to subdirectories:

```bash
cp .env packages/database/.env
cp .env apps/api/.env
```

5. Start PostgreSQL:

```bash
docker-compose up -d
```

6. Set up the database:

```bash
npm run db:generate
npm run db:push
```

7. Start the development servers:

```bash
npm run dev
```

The app will be available at:

- **Web**: http://localhost:3000
- **API**: http://localhost:3001

## Available Scripts

### Development

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start both API and web servers |
| `npm run dev:api` | Start API server only          |
| `npm run dev:web` | Start web server only          |

### Database

| Command               | Description                           |
| --------------------- | ------------------------------------- |
| `npm run db:generate` | Generate Prisma client                |
| `npm run db:push`     | Push schema changes to database       |
| `npm run db:studio`   | Open Prisma Studio (visual DB editor) |

### Code Quality

| Command                | Description                      |
| ---------------------- | -------------------------------- |
| `npm run lint`         | Run ESLint to check code quality |
| `npm run lint:fix`     | Auto-fix ESLint issues           |
| `npm run format`       | Format code with Prettier        |
| `npm run format:check` | Check code formatting            |
| `npm run type-check`   | Run TypeScript type checking     |

### Testing

| Command                 | Description                   |
| ----------------------- | ----------------------------- |
| `npm test`              | Run all tests                 |
| `npm run test:watch`    | Run tests in watch mode       |
| `npm run test:coverage` | Generate test coverage report |

**Test Stats:**

- **Total Tests**: 175 (49 API + 126 web)
- **Pass Rate**: 100%
- **Coverage**: 70%+ on all metrics (exceeds all targets!)

See [Test-Summary.md](Test-Summary.md) for detailed test breakdown.

## API Endpoints

| Method | Endpoint         | Description                                |
| ------ | ---------------- | ------------------------------------------ |
| GET    | `/api/docs`      | Interactive API documentation (Swagger UI) |
| GET    | `/api/docs.json` | OpenAPI 3.0 specification (JSON)           |
| GET    | `/api/wines`     | List all wines                             |
| GET    | `/api/wines/:id` | Get a single wine                          |
| POST   | `/api/wines`     | Create a wine                              |
| PUT    | `/api/wines/:id` | Update a wine                              |
| DELETE | `/api/wines/:id` | Delete a wine                              |

### API Documentation

Interactive API documentation is available at http://localhost:3001/api/docs
when the server is running. The documentation includes:

- All endpoint descriptions with request/response schemas
- "Try it out" functionality to test endpoints directly
- Example requests and responses

### Example API Request

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

## Stopping the App

Stop the development servers with `Ctrl+C`, then stop the database:

```bash
docker-compose down
```

Your data is preserved in a Docker volume and will be there when you start up
again.

## Code Quality

This project maintains high code quality standards with automated tooling:

### Tools

- **ESLint 9.39.2**: Strict linting rules for TypeScript and React
- **Prettier 3.7.4**: Automatic code formatting with consistent style
- **Husky**: Git hooks for pre-commit quality checks
- **lint-staged**: Run linters on staged files only
- **commitlint**: Enforce conventional commit messages

### Pre-commit Checks

Every commit automatically runs:

- ESLint to catch code issues
- Prettier to ensure consistent formatting
- TypeScript type checking
- Conventional commit message validation

### Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/)
specification:

```
feat: add wine rating feature
fix: resolve wine deletion bug
docs: update README with new scripts
chore: upgrade dependencies
```

## License

MIT
