/**
 * Migration script to populate Wine.imageUrl from existing label images
 *
 * This script:
 * 1. Reads image files from assets/wine-labels/
 * 2. Extracts wine IDs from filenames (e.g., "cmjx1sc6s0000yr445n60tinv.jpg" -> "cmjx1sc6s0000yr445n60tinv")
 * 3. Updates the corresponding wine records with the filename
 */

/* eslint-disable no-console, @typescript-eslint/explicit-function-return-type */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function populateWineImages() {
  const labelsDir = path.join(__dirname, '..', 'assets', 'wine-labels');

  console.log(`Reading images from: ${labelsDir}\n`);

  // Check if directory exists
  if (!fs.existsSync(labelsDir)) {
    console.error(`❌ Directory not found: ${labelsDir}`);
    process.exit(1);
  }

  // Read all files from the labels directory
  const files = fs.readdirSync(labelsDir);
  const imageFiles = files.filter(
    (file) =>
      file.endsWith('.jpg') ||
      file.endsWith('.jpeg') ||
      file.endsWith('.png') ||
      file.endsWith('.webp')
  );

  console.log(`Found ${imageFiles.length} image files\n`);

  let updatedCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;

  for (const filename of imageFiles) {
    // Extract wine ID from filename (remove extension)
    const wineId = path.parse(filename).name;

    try {
      // Check if wine exists
      const wine = await prisma.wine.findUnique({
        where: { id: wineId },
      });

      if (!wine) {
        console.log(`⚠️  Wine not found for image: ${filename} (ID: ${wineId})`);
        notFoundCount++;
        continue;
      }

      // Update wine with image filename
      await prisma.wine.update({
        where: { id: wineId },
        data: { imageUrl: filename },
      });

      console.log(`✅ Updated: ${wine.name} (${wine.vintage}) -> ${filename}`);
      updatedCount++;
    } catch (error) {
      console.error(`❌ Error processing ${filename}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total images found:     ${imageFiles.length}`);
  console.log(`Successfully updated:   ${updatedCount}`);
  console.log(`Wine not found:         ${notFoundCount}`);
  console.log(`Errors:                 ${errorCount}`);
  console.log('='.repeat(60));
}

// Run the migration
populateWineImages()
  .then(() => {
    console.log('\n✨ Migration complete!');
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
