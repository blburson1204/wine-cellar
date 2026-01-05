# Quick Start Guide - Phase 1 Wine Label Images

**Updated**: January 4, 2026

**IMPORTANT**: Wine label images (~220) have already been downloaded and saved
in [assets/wine-labels](../assets/wine-labels), keyed by Wine ID. Phase 1 now
focuses on **displaying these existing images** in the Wine Detail modals, then
adding upload/edit capabilities.

**Ready to begin?** Follow these steps to get started immediately.

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

### Phase 1A: Display Existing Images (Day 1)

1. ✅ Database schema (add imageUrl field)
2. ✅ Run migration
3. ✅ Populate imageUrl with migration script
4. ✅ Image serving endpoint (GET /wines/:id/image)
5. Update Wine type in frontend
6. Display images in detail modal (view mode)
7. Display images in detail modal (edit mode)
8. Test image display
9. Handle missing images gracefully (placeholder)

### Phase 1B: Upload & Edit (Days 2-3)

10. Install dependencies (multer, sharp)
11. Storage configuration
12. Local storage service
13. Image validation utilities
14. Image processing utilities
15. Upload endpoint (POST /wines/:id/image)
16. Delete endpoint (DELETE /wines/:id/image)
17. Upload UI in edit modal
18. Backend tests

### Polish & Testing (Day 4)

19. Error handling
20. Manual testing
21. Code review & cleanup
22. Documentation
23. Final testing

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

## Ready to Code!

You're all set! Start with task #4 in the checklist (Storage Interface) and work
through systematically.

**Current Status**:

- ✅ Planning complete
- ✅ Decisions made
- ✅ Checklist created
- ✅ Database schema updated
- ✅ Dependencies installed
- ✅ Configuration created
- ✅ Project structure ready

**Next**: Open
[PHASE-1-IMPLEMENTATION-CHECKLIST.md](PHASE-1-IMPLEMENTATION-CHECKLIST.md) and
start with task #4!

Good luck! 🚀🍷
