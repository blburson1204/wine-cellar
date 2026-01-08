# Quick Start Guide - Phase 1 Wine Label Images

**Updated**: January 8, 2026

**STATUS**: PHASE 1 COMPLETE ✅ (Both Phase 1A & 1B)

Phase 1 has been successfully completed! Wine label images (~220) are now fully
integrated with:

- ✅ Display in Wine Detail modals (view and edit modes)
- ✅ Image serving API endpoint with proper caching
- ✅ Upload capability during wine creation
- ✅ Upload/replace/delete functionality in edit mode
- ✅ Client-side and server-side validation
- ✅ Image optimization with sharp
- ✅ Comprehensive error handling
- ✅ All 270 tests passing

**This document is now ARCHIVED for reference.**

For next steps, see:

- [Phase-1-Implementation-Checklist.md](Phase-1-Implementation-Checklist.md) -
  Complete implementation details
- [NEXT-SESSION-TODO.md](NEXT-SESSION-TODO.md) - Next session planning
- [Wine-Label-Image-Feature-Plan.md](Wine-Label-Image-Feature-Plan.md) - Overall
  project roadmap (Phase 2: Thumbnails, Phase 3: AWS, Phase 4: Advanced
  Features)

---

## Pre-Implementation Checklist

Before you start coding, make sure:

- [ ] You've read the updated
      [WINE-LABEL-IMAGE-FEATURE-PLAN.md](WINE-LABEL-IMAGE-FEATURE-PLAN.md)
- [ ] You've reviewed the updated
      [PHASE-1-IMPLEMENTATION-CHECKLIST.md](PHASE-1-IMPLEMENTATION-CHECKLIST.md)
- [ ] You've confirmed images exist in `assets/wine-labels/` directory
- [ ] Your development environment is running (`npm run dev`)
- [ ] All existing tests are passing (`npm test`)
- [ ] You have a recent backup of your database
- [ ] You're on a clean git branch

---

## Step 1: Create Feature Branch (2 minutes)

```bash
cd /Users/brian/Documents/BLB\ Coding/wine-cellar

# Make sure you're on main and up to date
git checkout main
git pull

# Create feature branch
git checkout -b feature/wine-label-images

# Verify you're on the new branch
git branch
```

---

## Step 2: Database Schema (30 minutes)

### Update Prisma Schema

Edit `packages/database/prisma/schema.prisma`:

```prisma
model Wine {
  id            String    @id @default(cuid())
  name          String
  vintage       Int
  producer      String
  region        String?
  country       String
  grapeVariety  String?
  blendDetail   String?
  color         WineColor
  quantity      Int       @default(1)
  purchasePrice Float?
  purchaseDate  DateTime?
  drinkByDate   DateTime?
  rating        Float?
  notes         String?

  // NEW: Image field for Phase 1 (displaying existing images)
  imageUrl        String?    // Path to wine label image (e.g., "cmjx1sc6s0000yr445n60tinv.jpg")

  // Phase 2: Add these fields when implementing upload
  // imageMimeType   String?    // e.g., "image/jpeg"
  // imageSize       Int?       // File size in bytes
  // imageUploadedAt DateTime?  // When image was uploaded

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Generate and Apply Migration

```bash
# Generate Prisma client
npm run db:generate

# Create migration
npx prisma migrate dev --name add_wine_images

# Verify migration was created
ls packages/database/prisma/migrations/

# Test in Prisma Studio
npm run db:studio
```

### Commit Schema Changes

```bash
git add packages/database/prisma/schema.prisma
git add packages/database/prisma/migrations/
git commit -m "feat: add image fields to Wine model"
```

---

## Step 3: Migration Script to Populate imageUrl (45 minutes)

### Create Migration Script

Since the images are already downloaded and keyed by Wine ID, create a script to
populate the `imageUrl` field in the database.

Create `scripts/populate-wine-images.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function populateWineImages() {
  const imagesDir = path.join(__dirname, '../assets/wine-labels');

  console.log('Reading images from:', imagesDir);

  // Get all image files
  const files = await fs.readdir(imagesDir);
  const imageFiles = files.filter(
    (f) => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')
  );

  console.log(`Found ${imageFiles.length} image files`);

  let updated = 0;
  let notFound = 0;

  for (const imageFile of imageFiles) {
    // Extract wine ID from filename (remove extension)
    const wineId = path.parse(imageFile).name;

    // Check if wine exists
    const wine = await prisma.wine.findUnique({
      where: { id: wineId },
    });

    if (wine) {
      // Update wine with imageUrl
      await prisma.wine.update({
        where: { id: wineId },
        data: { imageUrl: imageFile },
      });
      updated++;
      console.log(`✓ Updated wine ${wineId}`);
    } else {
      notFound++;
      console.log(`✗ Wine not found for image: ${imageFile}`);
    }
  }

  console.log('\nMigration complete!');
  console.log(`Updated: ${updated} wines`);
  console.log(`Not found: ${notFound} wines`);
}

populateWineImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Run Migration Script

```bash
# From project root
npx tsx scripts/populate-wine-images.ts
```

### Verify in Database

```bash
npm run db:studio
# Check that wines now have imageUrl populated
```

---

## Step 4: Image Serving Endpoint (1 hour)

### Create Endpoint to Serve Images

Modify `apps/api/src/routes/wines.ts` to add an image serving endpoint:

```typescript
// GET /wines/:id/image - Serve wine label image
router.get('/wines/:id/image', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find wine
    const wine = await prisma.wine.findUnique({
      where: { id },
      select: { id: true, imageUrl: true },
    });

    if (!wine) {
      return res.status(404).json({ error: 'Wine not found' });
    }

    if (!wine.imageUrl) {
      return res.status(404).json({ error: 'No image for this wine' });
    }

    // Construct full path to image
    const imagePath = path.join(
      __dirname,
      '../../assets/wine-labels',
      wine.imageUrl
    );

    // Check if file exists
    try {
      await fs.access(imagePath);
    } catch {
      return res.status(404).json({ error: 'Image file not found' });
    }

    // Determine MIME type from extension
    const ext = path.extname(wine.imageUrl).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

    // Set caching headers (1 year for immutable images)
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    // Send file
    res.sendFile(imagePath);
  } catch (error) {
    next(error);
  }
});
```

### Test the Endpoint

```bash
# Start the API server
npm run dev:api

# In another terminal, test the endpoint
curl http://localhost:3001/api/wines/{WINE_ID}/image --output test-image.jpg
# Replace {WINE_ID} with an actual wine ID from your database
```

---

## Development Workflow

### Running the App

```bash
# Terminal 1: Start API server
npm run dev:api

# Terminal 2: Start web server
npm run dev:web

# Terminal 3: Watch tests
npm run test:watch
```

### Testing as You Go

```bash
# Run all tests
npm test

# Run specific test file
npm test storage-service

# Run with coverage
npm run test:coverage
```

### Code Quality Checks

```bash
# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Type checking
npm run type-check
```

---

## Implementation Order (REVISED)

Follow the checklist in order, but here's the high-level flow:

### Phase 1A: Display Existing Images (COMPLETED ✅)

1. ✅ Database schema (add imageUrl field)
2. ✅ Run migration
3. ✅ Populate imageUrl with migration script (217 wines updated)
4. ✅ Image serving endpoint (GET /wines/:id/image)
5. ✅ Update Wine type in frontend (3 files)
6. ✅ Display images in detail modal (view mode)
7. ✅ Display images in detail modal (edit mode)
8. ✅ Test image display
9. ✅ Handle missing images gracefully (wine emoji + "Image not available" text)
10. ✅ Side-by-side layout optimization
11. ✅ UI refinements (removed Drink By Date, renamed to Tasting Notes)

### Phase 1B: Upload & Edit (COMPLETED ✅)

10. ✅ Install dependencies (multer, sharp)
11. ✅ Storage configuration
12. ✅ Local storage service
13. ✅ Image validation utilities
14. ✅ Image processing utilities
15. ✅ Upload endpoint (POST /wines/:id/image)
16. ✅ Delete endpoint (DELETE /wines/:id/image)
17. ✅ Upload UI in edit modal
18. ✅ **Upload UI in add modal** (staged image approach)
19. ✅ Backend tests (270 passing)

### Polish & Testing (COMPLETED ✅)

20. ✅ Error handling
21. ✅ Manual testing (all 7 scenarios passing)
22. ✅ Code review & cleanup
23. ✅ Documentation
24. ✅ Final testing

---

## Useful Commands Reference

```bash
# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to DB (dev)
npm run db:studio        # Open Prisma Studio

# Development
npm run dev              # Start both servers
npm run dev:api          # API only
npm run dev:web          # Web only

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage

# Code Quality
npm run lint             # Check linting
npm run lint:fix         # Fix linting issues
npm run format           # Format code
npm run type-check       # TypeScript check
```

---

## Common Issues & Solutions

### Issue: Prisma client not generated

```bash
npm run db:generate
```

### Issue: Port already in use

```bash
# Kill process on port 3001 (API)
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000 (Web)
lsof -ti:3000 | xargs kill -9
```

### Issue: Tests failing after schema change

```bash
# Regenerate Prisma client
npm run db:generate

# Reset test database
npx prisma migrate reset
```

### Issue: TypeScript errors

```bash
# Rebuild
npm run build

# Check specific file
npx tsc --noEmit apps/api/src/yourfile.ts
```

---

## Git Commit Message Convention

Follow your existing commitlint rules:

```bash
# Good commit messages
git commit -m "feat: add image upload endpoint"
git commit -m "test: add storage service unit tests"
git commit -m "fix: handle missing image gracefully"
git commit -m "refactor: extract image validation logic"

# Bad commit messages (will be rejected)
git commit -m "WIP"
git commit -m "Fixed stuff"
git commit -m "Updated code"
```

---

## When You Get Stuck

1. **Check the planning docs**:
   - [WINE-LABEL-IMAGE-FEATURE-PLAN.md](WINE-LABEL-IMAGE-FEATURE-PLAN.md) -
     Overall plan
   - [PHASE-1-IMPLEMENTATION-CHECKLIST.md](PHASE-1-IMPLEMENTATION-CHECKLIST.md) -
     Detailed tasks

2. **Review existing code patterns**:
   - Look at how wines endpoint is structured
   - Check existing error handling patterns
   - Review existing test files for patterns

3. **Test incrementally**:
   - Don't write too much code before testing
   - Write failing test → implement feature → test passes

4. **Ask questions**:
   - Document any deviations from the plan
   - Note any unexpected challenges
   - Keep track of time estimates vs. actuals

---

## Success Indicators

You're on track if:

- ✅ All tests continue to pass
- ✅ No TypeScript errors
- ✅ Linter is clean
- ✅ Each commit is focused and buildable
- ✅ You're making steady progress through the checklist

---

## Phase 1 Complete!

**Implementation Summary**:

- ✅ Planning complete
- ✅ All decisions made and validated
- ✅ Database schema updated (imageUrl field)
- ✅ Migration completed (217 wines with images)
- ✅ Dependencies installed (multer, sharp, file-type)
- ✅ Image serving endpoint with caching
- ✅ Upload endpoints (POST/DELETE)
- ✅ Local storage service
- ✅ Image validation and optimization
- ✅ Frontend UI (view, edit, and add modes)
- ✅ Staged image upload during wine creation
- ✅ All 270 tests passing
- ✅ Manual testing complete (7/7 scenarios passing)
- ✅ Documentation updated

**Implementation Dates**: January 4-8, 2026

**What's Next**:

Phase 1 is complete! For future enhancements, see:

- **Phase 2**: Thumbnails in table view
- **Phase 3**: AWS S3 storage and CloudFront CDN
- **Phase 4**: Advanced features (multiple images, OCR, drag-and-drop)

See [NEXT-SESSION-TODO.md](NEXT-SESSION-TODO.md) for immediate next steps and
[Wine-Label-Image-Feature-Plan.md](Wine-Label-Image-Feature-Plan.md) for the
complete roadmap.

Congratulations! 🎉🍷
