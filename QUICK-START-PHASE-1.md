# Quick Start Guide - Phase 1 Wine Label Images

**Ready to begin?** Follow these steps to get started immediately.

---

## Pre-Implementation Checklist

Before you start coding, make sure:

- [ ] You've read
      [WINE-LABEL-IMAGE-FEATURE-PLAN.md](WINE-LABEL-IMAGE-FEATURE-PLAN.md)
- [ ] You've reviewed
      [PHASE-1-IMPLEMENTATION-CHECKLIST.md](PHASE-1-IMPLEMENTATION-CHECKLIST.md)
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

  // NEW: Image fields for Phase 1
  imageUrl        String?    // URL/path to optimized image
  imageMimeType   String?    // e.g., "image/jpeg"
  imageSize       Int?       // File size in bytes
  imageUploadedAt DateTime?  // When image was uploaded

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

## Step 3: Install Dependencies (15 minutes)

### Backend Dependencies

```bash
cd apps/api

# Multer for file uploads
npm install multer
npm install --save-dev @types/multer

# Sharp for image processing
npm install sharp
npm install --save-dev @types/sharp

# File type validation
npm install file-type

# Verify installations
npm list multer sharp file-type

cd ../..
```

### Update .gitignore

Add to `.gitignore`:

```
# Image uploads (development only)
apps/api/uploads/
```

### Create Upload Directory

```bash
mkdir -p apps/api/uploads/wines
```

### Commit Dependencies

```bash
git add apps/api/package.json apps/api/package-lock.json
git add .gitignore
git commit -m "feat: install image upload dependencies (multer, sharp, file-type)"
```

---

## Step 4: Project Structure Setup (10 minutes)

Create the following file/directory structure:

```bash
# Configuration
touch apps/api/src/config/storage.ts

# Storage services
mkdir -p apps/api/src/services/storage
touch apps/api/src/services/storage/storage.interface.ts
touch apps/api/src/services/storage/local-storage.service.ts
touch apps/api/src/services/storage/index.ts

# Utilities
touch apps/api/src/utils/image-validation.ts
touch apps/api/src/utils/image-processing.ts

# Tests
touch apps/api/__tests__/storage-service.test.ts
touch apps/api/__tests__/wine-images.test.ts

# Test fixtures directory
mkdir -p apps/api/__tests__/fixtures
```

### Verify Structure

```bash
tree apps/api/src/services/storage
tree apps/api/src/utils
tree apps/api/__tests__
```

---

## Step 5: Configuration File (20 minutes)

Create `apps/api/src/config/storage.ts`:

```typescript
import path from 'path';

export const storageConfig = {
  // Upload directory (local development)
  uploadDir:
    process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads/wines'),

  // File size limit (5MB)
  maxFileSize: 5 * 1024 * 1024,

  // Allowed MIME types
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,

  // Image optimization settings
  maxImageWidth: 1200, // Resize images larger than this
  imageQuality: 85, // JPEG quality (1-100)
} as const;

export const isProduction = process.env.NODE_ENV === 'production';
export const useS3 = isProduction && !!process.env.AWS_S3_BUCKET;

export type AllowedMimeType = (typeof storageConfig.allowedMimeTypes)[number];
```

Test it works:

```bash
cd apps/api
npx tsx src/config/storage.ts
# Should not error
```

Commit:

```bash
git add apps/api/src/config/storage.ts
git commit -m "feat: add storage configuration"
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

## Implementation Order (Recommended)

Follow the checklist in order, but here's the high-level flow:

### Backend First (Days 1-2)

1. ✅ Database schema (done above)
2. ✅ Install dependencies (done above)
3. ✅ Configuration (done above)
4. Storage interface
5. Local storage service
6. Image validation utilities
7. Image processing utilities
8. API endpoints (upload, delete, serve)
9. Backend tests

### Frontend Second (Day 3)

10. Update Wine type
11. Image upload UI in detail modal
12. Image display in detail modal
13. API utility functions
14. Frontend tests

### Polish & Testing (Days 4-5)

15. Error handling
16. Manual testing
17. Code review & cleanup
18. Documentation
19. Final testing

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
