import { defineConfig } from 'vitest/config';
import path from 'path';

const TEST_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/wine_cellar_test';

// In CI, allow DATABASE_URL override but verify it points to a test database.
// Locally, always force the test database URL to prevent accidental dev data deletion.
if (process.env.CI && process.env.DATABASE_URL) {
  if (!process.env.DATABASE_URL.includes('_test')) {
    throw new Error(
      `SAFETY: DATABASE_URL does not point to a test database: ${process.env.DATABASE_URL}\n` +
        'Test database URLs must contain "_test" to prevent accidental data deletion.'
    );
  }
} else {
  process.env.DATABASE_URL = TEST_DATABASE_URL;
}

// Use a separate upload directory for tests to avoid deleting real uploaded images
if (!process.env.UPLOAD_DIR) {
  process.env.UPLOAD_DIR = path.join(process.cwd(), 'uploads-test/wines');
}

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.test.ts'],
    pool: 'forks',
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
