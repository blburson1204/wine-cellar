import { defineConfig } from 'vitest/config';
import path from 'path';

// Set test database URL if not already set (allows CI to override)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/wine_cellar_test';
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
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
      thresholds: {
        branches: 55, // TODO: Increase to 70% - see TODO.md section 3
        functions: 75, // TODO: Increase to 80% - see TODO.md section 3
        lines: 75, // TODO: Increase to 80% - see TODO.md section 3
        statements: 75, // TODO: Increase to 80% - see TODO.md section 3
      },
    },
  },
});
