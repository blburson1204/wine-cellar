#!/usr/bin/env tsx
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// In CI, allow DATABASE_URL override but verify it's a test database.
// Locally, always use the test database URL.
const DEFAULT_TEST_URL = 'postgresql://postgres:postgres@localhost:5433/wine_cellar_test';
const TEST_DATABASE_URL =
  process.env.CI && process.env.DATABASE_URL ? process.env.DATABASE_URL : DEFAULT_TEST_URL;

if (!TEST_DATABASE_URL.includes('_test')) {
  throw new Error(
    `SAFETY: DATABASE_URL does not point to a test database: ${TEST_DATABASE_URL}\n` +
      'Test database URLs must contain "_test" to prevent accidental data deletion.'
  );
}

/* eslint-disable no-console */
async function setupTestDatabase(): Promise<void> {
  try {
    console.log('Setting up test database...');

    // Set the test database URL
    process.env.DATABASE_URL = TEST_DATABASE_URL;

    // Create the test database if it doesn't exist
    try {
      await execAsync(
        `psql "postgresql://postgres:postgres@localhost:5433/postgres" -c "CREATE DATABASE wine_cellar_test;"`
      );
      console.log('✓ Test database created');
    } catch (error: unknown) {
      // Database might already exist, which is fine
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('✓ Test database already exists');
      } else {
        console.log('Note: Could not create database (it may already exist)');
      }
    }

    // Push the schema to the test database
    const { stderr } = await execAsync(
      'cd ../../packages/database && npx prisma db push --skip-generate',
      {
        env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      }
    );

    if (stderr && !stderr.includes('warnings')) {
      console.error('Schema push stderr:', stderr);
    }

    console.log('✓ Test database schema is ready');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error setting up test database:', message);
    // Don't fail - the database might already be set up
  }
}
/* eslint-enable no-console */

void setupTestDatabase();
