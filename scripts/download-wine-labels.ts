/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to download ${url}: ${response.statusText}`);
      return false;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    writeFileSync(filepath, buffer);
    return true;
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
    return false;
  }
}

async function downloadWineLabels(): Promise<void> {
  try {
    console.log('Fetching wine label URLs from database...');

    // Get all wines with label images
    const winesWithLabels = await prisma.$queryRaw<Array<{ id: string; label_image: string }>>`
      SELECT id, label_image
      FROM vivino_export2
      WHERE label_image IS NOT NULL
      AND label_image != ''
    `;

    console.log(`Found ${winesWithLabels.length} wines with label images`);

    const outputDir = join(__dirname, '..', 'assets', 'wine-labels');
    let downloaded = 0;
    let skipped = 0;
    let failed = 0;

    for (const wine of winesWithLabels) {
      const extension = wine.label_image.split('.').pop() || 'jpg';
      const filename = `${wine.id}.${extension}`;
      const filepath = join(outputDir, filename);

      // Skip if already downloaded
      if (existsSync(filepath)) {
        skipped++;
        if (skipped % 50 === 0) {
          console.log(`Skipped ${skipped} existing images...`);
        }
        continue;
      }

      // Download the image
      const success = await downloadImage(wine.label_image, filepath);

      if (success) {
        downloaded++;
        if (downloaded % 10 === 0) {
          console.log(`Downloaded ${downloaded} images...`);
        }
      } else {
        failed++;
      }

      // Add a small delay to be respectful to the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log('\nDownload complete!');
    console.log(`Successfully downloaded: ${downloaded} images`);
    console.log(`Skipped (already exist): ${skipped} images`);
    console.log(`Failed: ${failed} images`);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

downloadWineLabels();
