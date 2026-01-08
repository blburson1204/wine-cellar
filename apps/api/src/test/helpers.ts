import { prisma } from '@wine-cellar/database';
import type { Wine } from '@wine-cellar/database';
import fs from 'fs/promises';
import path from 'path';
import { storageConfig } from '../config/storage';

/**
 * Clean up all test data from database
 */
export async function cleanupDatabase(): Promise<void> {
  await prisma.wine.deleteMany();
}

/**
 * Clean up all uploaded test images
 */
export async function cleanupUploads(): Promise<void> {
  try {
    const files = await fs.readdir(storageConfig.uploadDir);
    await Promise.all(
      files.map((file) => fs.unlink(path.join(storageConfig.uploadDir, file)).catch(() => {}))
    );
  } catch {
    // Directory might not exist, that's fine
  }
}

/**
 * Create a test wine in the database
 */
export async function createTestWine(data?: {
  name?: string;
  vintage?: number;
  varietal?: string;
  imageUrl?: string | null;
}): Promise<Wine> {
  return prisma.wine.create({
    data: {
      name: data?.name || 'Test Wine',
      vintage: data?.vintage || 2020,
      grapeVariety: data?.varietal || 'Cabernet Sauvignon',
      region: 'Napa Valley',
      producer: 'Test Winery',
      country: 'USA',
      color: 'RED',
      quantity: 1,
      imageUrl: data?.imageUrl,
    },
  });
}

/**
 * Create a minimal valid JPEG buffer for testing
 * This is a 1x1 pixel red JPEG image
 */
export function createValidJpegBuffer(): Buffer {
  return Buffer.from(
    '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a' +
      'HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIy' +
      'MjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIA' +
      'AhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEB' +
      'AQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q==',
    'base64'
  );
}

/**
 * Create a minimal valid PNG buffer for testing
 * This is a 1x1 pixel transparent PNG image
 */
export function createValidPngBuffer(): Buffer {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
}

/**
 * Create a minimal valid WebP buffer for testing
 */
export function createValidWebPBuffer(): Buffer {
  // This is a 1x1 pixel WebP image
  return Buffer.from('UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=', 'base64');
}

/**
 * Create an invalid image buffer (not an actual image)
 */
export function createInvalidImageBuffer(): Buffer {
  return Buffer.from('This is not an image file');
}

/**
 * Create a buffer that's too large (exceeds max file size)
 */
export function createOversizedBuffer(): Buffer {
  return Buffer.alloc(storageConfig.maxFileSize + 1024);
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
