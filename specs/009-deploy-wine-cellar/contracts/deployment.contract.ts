/**
 * Contract: Deployment Configuration Files
 *
 * Defines the expected structure of platform configuration files.
 * These are NOT TypeScript modules — they're JSON/YAML config files.
 * This contract documents their expected shape.
 */

/**
 * vercel.json — Vercel project configuration
 *
 * Expected location: apps/web/vercel.json (or repo root)
 *
 * Purpose: Configure Vercel to build the Next.js app from apps/web
 * and set up API rewrites to Railway backend
 */
// Vercel config: Build handled by Next.js auto-detection, rewrites via
// next.config.js using NEXT_PUBLIC_API_URL env var. No vercel.json needed
// if using Vercel dashboard for root directory config.
type VercelConfig = Record<string, never>;

/**
 * railway.json — Railway project configuration
 *
 * Expected location: repo root
 *
 * Purpose: Configure Railway to build and deploy the Express API
 * from apps/api directory within the monorepo
 */
interface RailwayConfig {
  build: {
    /** Build from repo root to access workspaces */
    buildCommand: string; // "npm ci && npm run db:generate && cd apps/api && npm run build"
  };
  deploy: {
    /** Start the API server */
    startCommand: string; // "cd apps/api && npm start"
    /** Health check for Railway's monitoring */
    healthcheckPath: string; // "/api/health"
    /** Restart on failure */
    restartPolicyType: string; // "ON_FAILURE"
  };
}

/**
 * next.config.js update
 *
 * Current: hardcoded http://localhost:3001 rewrite destination
 * Updated: read from NEXT_PUBLIC_API_URL env var, default to localhost for dev
 *
 * const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
 * rewrites: [{ source: '/api/:path*', destination: `${apiUrl}/api/:path*` }]
 */

/**
 * .env.example files needed:
 *
 * Root .env.example:
 *   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/wine_cellar
 *
 * apps/api/.env.example:
 *   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/wine_cellar
 *   NODE_ENV=development
 *   PORT=3001
 *   STORAGE_PROVIDER=local
 *   # CORS_ORIGIN=https://winescellar.net
 *   # CLOUDINARY_CLOUD_NAME=
 *   # CLOUDINARY_API_KEY=
 *   # CLOUDINARY_API_SECRET=
 *
 * apps/web/.env.example:
 *   NEXT_PUBLIC_API_URL=http://localhost:3001
 *
 * packages/database/.env.example:
 *   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/wine_cellar
 */

export type { VercelConfig, RailwayConfig };
