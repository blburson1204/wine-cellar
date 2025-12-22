# Wine Cellar

A full-stack wine collection management app built with Next.js, Express, PostgreSQL, and Prisma.

## Features

- Add, view, and delete wines
- Track vintage, producer, country, color, and quantity
- Clean, simple UI
- RESTful API

## Tech Stack

- **Frontend**: Next.js 13, React, TypeScript
- **Backend**: Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
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

- Node.js 18.17+ (or 18.3+ for Next.js 13)
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

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both API and web servers |
| `npm run dev:api` | Start API server only |
| `npm run dev:web` | Start web server only |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Prisma Studio (visual DB editor) |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wines` | List all wines |
| GET | `/api/wines/:id` | Get a single wine |
| POST | `/api/wines` | Create a wine |
| PUT | `/api/wines/:id` | Update a wine |
| DELETE | `/api/wines/:id` | Delete a wine |

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

Your data is preserved in a Docker volume and will be there when you start up again.

## License

MIT
