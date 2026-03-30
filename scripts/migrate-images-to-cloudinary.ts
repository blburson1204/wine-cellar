/**
 * One-time migration script: Upload local wine images to Cloudinary
 * and update the production database with Cloudinary URLs.
 *
 * Usage: CLOUDINARY_CLOUD_NAME=xxx CLOUDINARY_API_KEY=xxx CLOUDINARY_API_SECRET=xxx \
 *        DATABASE_URL="postgresql://..." npx tsx scripts/migrate-images-to-cloudinary.ts
 */

import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const CLOUDINARY_FOLDER = 'wine-cellar/wines';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect to production database
const prisma = new PrismaClient();

// Local image directories
const uploadsDir = path.join(process.cwd(), 'apps/api/uploads/wines');
const assetsDir = path.join(process.cwd(), 'assets/wine-labels');

/* eslint-disable no-console */

function findLocalImage(imageUrl: string): string | null {
  const uploadPath = path.join(uploadsDir, imageUrl);
  if (fs.existsSync(uploadPath)) return uploadPath;

  const assetPath = path.join(assetsDir, imageUrl);
  if (fs.existsSync(assetPath)) return assetPath;

  return null;
}

function uploadToCloudinary(
  filePath: string,
  wineId: string
): Promise<{ secure_url: string; bytes: number }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: CLOUDINARY_FOLDER,
        public_id: wineId,
        resource_type: 'image',
        overwrite: true,
      },
      (error, result) => {
        if (error) reject(error);
        else if (result) resolve(result);
        else reject(new Error('No result'));
      }
    );
  });
}

async function main(): Promise<void> {
  console.log('=== Wine Image Migration to Cloudinary ===\n');

  // Get all wines with local image URLs (not already Cloudinary URLs)
  const wines = await prisma.wine.findMany({
    where: {
      imageUrl: {
        not: null,
      },
    },
    select: { id: true, name: true, imageUrl: true },
  });

  const localWines = wines.filter((w) => w.imageUrl && !w.imageUrl.startsWith('http'));

  console.log(`Total wines with images: ${wines.length}`);
  console.log(`Already on Cloudinary: ${wines.length - localWines.length}`);
  console.log(`Need migration: ${localWines.length}\n`);

  let success = 0;
  let notFound = 0;
  let failed = 0;

  for (const wine of localWines) {
    const localPath = findLocalImage(wine.imageUrl!);

    if (!localPath) {
      console.log(`  SKIP (file not found): ${wine.name} — ${wine.imageUrl}`);
      notFound++;
      continue;
    }

    try {
      const result = await uploadToCloudinary(localPath, wine.id);

      // Update database with Cloudinary URL
      await prisma.wine.update({
        where: { id: wine.id },
        data: { imageUrl: result.secure_url },
      });

      success++;
      if (success % 10 === 0) {
        console.log(`  Uploaded ${success}/${localWines.length}...`);
      }
    } catch (err) {
      console.log(`  FAIL: ${wine.name} — ${err}`);
      failed++;
    }
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`  Uploaded: ${success}`);
  console.log(`  Not found: ${notFound}`);
  console.log(`  Failed: ${failed}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
