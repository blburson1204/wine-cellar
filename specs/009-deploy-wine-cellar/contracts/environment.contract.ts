/**
 * Contract: Environment Configuration
 *
 * Defines the environment variables required per workspace
 * and validation behavior at startup.
 */

/**
 * API environment variables
 *
 * Required in all environments:
 * - DATABASE_URL: PostgreSQL connection string
 *
 * Required in production (NODE_ENV=production):
 * - CLOUDINARY_CLOUD_NAME: Cloudinary cloud name
 * - CLOUDINARY_API_KEY: Cloudinary API key
 * - CLOUDINARY_API_SECRET: Cloudinary API secret
 *
 * Optional with defaults:
 * - NODE_ENV: defaults to 'development'
 * - PORT: defaults to 3001
 * - STORAGE_PROVIDER: 'local' | 'cloudinary', defaults to 'local'
 * - CORS_ORIGIN: comma-separated allowed origins, defaults to '*' in development
 */
interface ApiEnvironment {
  DATABASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  STORAGE_PROVIDER: 'local' | 'cloudinary';
  CORS_ORIGIN: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
}

/**
 * Web environment variables
 *
 * Required for build:
 * - NEXT_PUBLIC_API_URL: Full URL to the Express API (e.g., https://api.railway.app)
 *   Used in next.config.js rewrites destination
 */
interface WebEnvironment {
  NEXT_PUBLIC_API_URL: string;
}

/**
 * Validation contract:
 * - On startup, if NODE_ENV=production and STORAGE_PROVIDER=cloudinary,
 *   validate that CLOUDINARY_* vars are set
 * - If any required var is missing, throw with clear error message:
 *   "Missing required environment variable: VARIABLE_NAME"
 * - In development, missing optional vars use defaults silently
 */

export type { ApiEnvironment, WebEnvironment };
