# Wine Label Image Feature - Implementation Plan

**Date**: December 31, 2025 **Status**: Planning Phase **Author**: Brian (with
Claude)

---

## Executive Summary

This document outlines a comprehensive plan to add wine label image upload,
storage, and display capabilities to the Wine Cellar application. The feature
will allow users to upload, view, and manage wine label photos for each wine in
their collection.

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Database Design](#database-design)
3. [Storage Strategy](#storage-strategy)
4. [File Upload Implementation](#file-upload-implementation)
5. [API Endpoints](#api-endpoints)
6. [Frontend Implementation](#frontend-implementation)
7. [Image Processing](#image-processing)
8. [Security Considerations](#security-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Considerations](#deployment-considerations)
11. [Performance & Optimization](#performance--optimization)
12. [Error Handling](#error-handling)
13. [Implementation Phases](#implementation-phases)
14. [Open Questions for Discussion](#open-questions-for-discussion)

---

## Feature Overview

### Goals

- Allow users to upload wine label photos for each wine
- Display wine label images in the wine detail modal
- Provide thumbnail images in the wine table/list view
- Support multiple images per wine (future enhancement)
- Ensure images are properly optimized for web display

### User Stories

1. As a user, I want to upload a photo of my wine label so I can visually
   identify wines in my collection
2. As a user, I want to see wine label thumbnails in the wine list so I can
   quickly browse my collection
3. As a user, I want to see a full-size wine label image in the detail view so I
   can read the label details
4. As a user, I want to replace or remove a wine label image if I upload the
   wrong photo
5. As a user, I want my images to load quickly without consuming excessive
   bandwidth

---

## Database Design

### Schema Changes

We need to add image-related fields to the `Wine` model:

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

  // NEW IMAGE FIELDS
  imageUrl      String?   // Full-size image URL/path
  thumbnailUrl  String?   // Thumbnail image URL/path
  imageMimeType String?   // e.g., "image/jpeg", "image/png"
  imageSize     Int?      // File size in bytes
  imageUploadedAt DateTime? // When image was uploaded

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum WineColor {
  RED
  WHITE
  ROSE
  SPARKLING
  DESSERT
  FORTIFIED
}
```

### Alternative Approach: Separate Image Table

For future scalability (multiple images per wine), we could use a separate
table:

```prisma
model Wine {
  // ... existing fields ...
  images        WineImage[]
}

model WineImage {
  id           String   @id @default(cuid())
  wineId       String
  wine         Wine     @relation(fields: [wineId], references: [id], onDelete: Cascade)
  imageUrl     String
  thumbnailUrl String
  mimeType     String
  fileSize     Int
  isPrimary    Boolean  @default(false) // Mark one image as primary
  uploadedAt   DateTime @default(now())

  @@index([wineId])
}
```

**Recommendation**: Start with the simpler single-field approach in the Wine
model. We can migrate to a separate table later if we need multiple images per
wine.

---

## Storage Strategy

### Development Environment

**Local File System Storage**

- **Location**: `apps/api/uploads/wines/{wineId}/`
- **Structure**:
  ```
  uploads/
    wines/
      {wineId}/
        original.jpg      // Original uploaded image
        thumbnail.jpg     // Thumbnail (150x150 or 200x200)
  ```
- **Pros**:
  - Simple to implement
  - No external dependencies
  - Fast for local development
  - No costs
- **Cons**:
  - Not suitable for production (server restart clears ephemeral storage)
  - Doesn't work with multiple server instances
  - No CDN benefits

**Implementation**:

```typescript
// apps/api/src/config/storage.ts
export const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads/wines';
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
```

### Production Environment (AWS)

**AWS S3 Storage**

- **Bucket Structure**:
  ```
  wine-cellar-{environment}/
    wines/
      {wineId}/
        original/{timestamp}.jpg
        thumbnail/{timestamp}.jpg
  ```
- **Configuration**:
  - Private bucket with signed URLs
  - CloudFront CDN for fast image delivery
  - Lifecycle policies for old image cleanup
  - Versioning enabled for backup

**Pros**:

- Highly scalable and durable (99.999999999% durability)
- Works with multiple server instances
- CDN integration for fast global delivery
- Automatic backup and versioning
- Pay only for what you use

**Cons**:

- Requires AWS account setup
- Monthly costs (small for typical usage)
- More complex configuration

**Cost Estimate** (for reference):

- S3 Storage: ~$0.023 per GB/month
- Data Transfer: First 1 GB free, then $0.09 per GB
- Typical usage (100 wines, 1 MB each): ~$0.002/month
- CloudFront: First 1 TB free tier, then minimal costs

**Implementation**:

```typescript
// apps/api/src/services/storage.service.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class StorageService {
  private s3Client: S3Client;

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    }
  }

  async uploadImage(
    wineId: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<string> {
    // Implementation
  }

  async deleteImage(wineId: string): Promise<void> {
    // Implementation
  }

  async getSignedUrl(key: string): Promise<string> {
    // Implementation for private images
  }
}
```

### Storage Service Abstraction

Create a unified interface that works in both dev and production:

```typescript
// apps/api/src/services/storage/storage.interface.ts
export interface IStorageService {
  uploadImage(
    wineId: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<UploadResult>;
  deleteImage(wineId: string): Promise<void>;
  getImageUrl(wineId: string): string;
}

export interface UploadResult {
  imageUrl: string;
  thumbnailUrl: string;
  fileSize: number;
}

// Local implementation
export class LocalStorageService implements IStorageService {
  // ... local file system implementation
}

// AWS S3 implementation
export class S3StorageService implements IStorageService {
  // ... S3 implementation
}

// Factory
export function createStorageService(): IStorageService {
  if (process.env.NODE_ENV === 'production' && process.env.AWS_S3_BUCKET) {
    return new S3StorageService();
  }
  return new LocalStorageService();
}
```

---

## File Upload Implementation

### Supported Formats

**Recommended**: JPEG, PNG, WebP

- **JPEG**: Best for photographs, good compression, universal support
- **PNG**: Lossless, good for images with text, larger file size
- **WebP**: Modern format, better compression than JPEG, excellent quality

**Not Recommended**: GIF (animated GIFs not needed), TIFF (too large), BMP
(inefficient)

### File Size Limits

**Maximum Upload Size**: 5 MB

- Typical smartphone photo: 2-4 MB
- High-quality label scan: 1-3 MB
- 5 MB provides headroom for high-res images

**Why 5 MB**:

- Large enough for excellent quality
- Small enough to prevent abuse
- Fast upload on most connections
- Reasonable storage costs

### Upload Mechanism

**Option 1: Multipart Form Data (Recommended for MVP)**

```typescript
// Frontend
const formData = new FormData();
formData.append('image', file);

const response = await fetch(`/api/wines/${wineId}/image`, {
  method: 'POST',
  body: formData,
});
```

**Backend (using Multer)**:

```typescript
import multer from 'multer';
import { Router } from 'express';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(new Error('Invalid file type'));
      return;
    }
    cb(null, true);
  },
});

router.post('/wines/:id/image', upload.single('image'), async (req, res) => {
  // Process uploaded file
});
```

**Option 2: Base64 Encoding** (Not recommended due to 33% size overhead)

**Option 3: Presigned URLs** (Future enhancement for direct S3 upload)

---

## API Endpoints

### New Endpoints

#### 1. Upload Wine Label Image

```
POST /api/wines/:id/image
Content-Type: multipart/form-data

Request Body:
- image: File (max 5MB, JPEG/PNG/WebP)

Response 200:
{
  "wine": {
    "id": "abc123",
    "name": "Château Margaux",
    "imageUrl": "/uploads/wines/abc123/original.jpg",
    "thumbnailUrl": "/uploads/wines/abc123/thumbnail.jpg",
    "imageMimeType": "image/jpeg",
    "imageSize": 2048576,
    "imageUploadedAt": "2025-12-31T10:00:00Z"
  }
}

Error 400: Invalid file type or size
Error 404: Wine not found
Error 500: Upload failed
```

#### 2. Delete Wine Label Image

```
DELETE /api/wines/:id/image

Response 204: No Content
Error 404: Wine not found or image doesn't exist
```

#### 3. Get Image (if using local storage)

```
GET /api/wines/:id/image?type=thumbnail|original

Response 200: Image file with appropriate Content-Type header
Error 404: Image not found
```

### Modified Endpoints

#### GET /api/wines

Already returns wine objects - will now include image URLs if available.

#### GET /api/wines/:id

Already returns wine object - will now include image URLs if available.

---

## Frontend Implementation

### Upload UI Location

**Option 1: In Wine Detail Modal** (Recommended)

Add an image upload section in the detail modal:

```tsx
// In WineDetailModal.tsx

{
  /* Image Section */
}
<div style={{ marginBottom: '24px' }}>
  <label style={{ display: 'block', marginBottom: '8px' }}>
    Wine Label Image
  </label>

  {wine.imageUrl ? (
    <div style={{ position: 'relative' }}>
      <img
        src={wine.imageUrl}
        alt={`${wine.name} label`}
        style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
      />
      <button
        onClick={handleDeleteImage}
        style={{ position: 'absolute', top: '8px', right: '8px' }}
      >
        Delete Image
      </button>
    </div>
  ) : (
    <div
      style={{
        border: '2px dashed #D4A5A5',
        borderRadius: '8px',
        padding: '32px',
        textAlign: 'center',
      }}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
        id="image-upload"
      />
      <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
        📷 Click to upload wine label image
      </label>
    </div>
  )}
</div>;
```

**Option 2: Separate Upload Modal** (More complex, not recommended for MVP)

### Image Display

#### In Wine Table (Thumbnail)

```tsx
// In WineTable.tsx
<td>
  {wine.thumbnailUrl ? (
    <img
      src={wine.thumbnailUrl}
      alt={`${wine.name} label`}
      style={{
        width: '40px',
        height: '40px',
        objectFit: 'cover',
        borderRadius: '4px',
      }}
    />
  ) : (
    <div
      style={{
        width: '40px',
        height: '40px',
        backgroundColor: '#F5F1E8',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      🍷
    </div>
  )}
</td>
```

#### In Detail Modal (Full Size)

Display full-size image with proper aspect ratio, up to a maximum width (e.g.,
600px).

### Upload Progress Indicator

```tsx
const [uploadProgress, setUploadProgress] = useState(0);
const [isUploading, setIsUploading] = useState(false);

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file size
  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB');
    return;
  }

  // Validate file type
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    alert('Only JPEG, PNG, and WebP images are supported');
    return;
  }

  setIsUploading(true);

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`/api/wines/${wine.id}/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');

    const updatedWine = await response.json();
    // Update wine in state
    onUpdate(updatedWine);
  } catch (error) {
    alert('Failed to upload image. Please try again.');
  } finally {
    setIsUploading(false);
  }
};
```

### Image Preview Before Upload

Show a preview of the selected image before uploading:

```tsx
const [previewUrl, setPreviewUrl] = useState<string | null>(null);

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Create preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setPreviewUrl(reader.result as string);
  };
  reader.readAsDataURL(file);
};
```

---

## Image Processing

### Thumbnail Generation

Generate thumbnails on the backend to reduce bandwidth and improve load times.

**Library**: `sharp` (fast, efficient, well-maintained)

```bash
npm install sharp
```

**Implementation**:

```typescript
import sharp from 'sharp';

async function generateThumbnail(
  originalBuffer: Buffer,
  thumbnailPath: string
): Promise<void> {
  await sharp(originalBuffer)
    .resize(200, 200, {
      fit: 'cover', // Crop to fill
      position: 'center',
    })
    .jpeg({ quality: 80 }) // Good balance of quality and size
    .toFile(thumbnailPath);
}
```

### Thumbnail Size

**Recommended**: 200x200 pixels

**Why**:

- Large enough for clarity on high-DPI displays (Retina, etc.)
- Small file size (typically 10-30 KB)
- Square format works well for table cells
- Consistent aspect ratio

### Image Optimization

**For Original Images**:

- Resize to max 1200px width (preserving aspect ratio)
- Compress JPEG to 85% quality
- Strip EXIF metadata (privacy and size reduction)

```typescript
async function optimizeOriginal(
  buffer: Buffer,
  outputPath: string
): Promise<void> {
  await sharp(buffer)
    .resize(1200, null, {
      fit: 'inside', // Resize only if larger
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toFile(outputPath);
}
```

### Image Format Conversion

Convert all uploads to JPEG for consistency:

```typescript
.jpeg({ quality: 85 })
```

**Alternative**: Keep original format, convert PNGs to WebP for better
compression.

---

## Security Considerations

### File Validation

1. **MIME Type Check**: Validate `Content-Type` header
2. **Magic Number Validation**: Check file signature bytes (prevents spoofed
   extensions)
3. **File Size Limit**: Enforce 5 MB maximum
4. **File Extension**: Only allow `.jpg`, `.jpeg`, `.png`, `.webp`

```typescript
import { fromBuffer } from 'file-type';

async function validateImageFile(buffer: Buffer): Promise<boolean> {
  const fileType = await fromBuffer(buffer);

  if (!fileType) return false;

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return allowedTypes.includes(fileType.mime);
}
```

### Path Traversal Prevention

Never use user-provided filenames directly:

```typescript
// ❌ BAD
const filePath = path.join(uploadDir, req.file.originalname);

// ✅ GOOD
const filePath = path.join(uploadDir, `${wineId}/original.jpg`);
```

### Access Control

**For Local Storage**:

- Store uploads outside the public web root
- Serve images through authenticated API endpoints
- Check wine ownership before serving image

**For S3**:

- Use private bucket (not public)
- Generate presigned URLs with expiration
- Implement per-user access control

### Content Security Policy

Update CSP headers to allow image sources:

```typescript
// In app.ts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        imgSrc: [
          "'self'",
          'data:',
          process.env.AWS_CLOUDFRONT_DOMAIN, // For S3/CloudFront
        ],
      },
    },
  })
);
```

### Rate Limiting

Prevent abuse of upload endpoint:

```typescript
import rateLimit from 'express-rate-limit';

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per 15 minutes
  message: 'Too many uploads, please try again later',
});

router.post('/wines/:id/image', uploadLimiter, upload.single('image'), ...);
```

---

## Testing Strategy

### Unit Tests

#### Storage Service Tests

```typescript
describe('StorageService', () => {
  it('uploads image and generates thumbnail', async () => {
    const buffer = await fs.readFile('test/fixtures/wine-label.jpg');
    const result = await storageService.uploadImage(
      'wine-123',
      buffer,
      'image/jpeg'
    );

    expect(result.imageUrl).toBeDefined();
    expect(result.thumbnailUrl).toBeDefined();
    expect(result.fileSize).toBeGreaterThan(0);
  });

  it('rejects files larger than 5MB', async () => {
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

    await expect(
      storageService.uploadImage('wine-123', largeBuffer, 'image/jpeg')
    ).rejects.toThrow('File too large');
  });

  it('rejects invalid MIME types', async () => {
    const buffer = await fs.readFile('test/fixtures/document.pdf');

    await expect(
      storageService.uploadImage('wine-123', buffer, 'application/pdf')
    ).rejects.toThrow('Invalid file type');
  });
});
```

#### Image Processing Tests

```typescript
describe('Image Processing', () => {
  it('generates 200x200 thumbnail', async () => {
    const buffer = await fs.readFile('test/fixtures/wine-label.jpg');
    const thumbnail = await generateThumbnail(buffer);

    const metadata = await sharp(thumbnail).metadata();
    expect(metadata.width).toBe(200);
    expect(metadata.height).toBe(200);
  });

  it('optimizes original to max 1200px width', async () => {
    const largeBuffer = await fs.readFile('test/fixtures/large-image.jpg');
    const optimized = await optimizeOriginal(largeBuffer);

    const metadata = await sharp(optimized).metadata();
    expect(metadata.width).toBeLessThanOrEqual(1200);
  });
});
```

### Integration Tests

#### API Endpoint Tests

```typescript
describe('POST /api/wines/:id/image', () => {
  it('uploads image successfully', async () => {
    const wine = await createTestWine();
    const imageBuffer = await fs.readFile('test/fixtures/wine-label.jpg');

    const response = await request(app)
      .post(`/api/wines/${wine.id}/image`)
      .attach('image', imageBuffer, 'wine-label.jpg')
      .expect(200);

    expect(response.body.wine.imageUrl).toBeDefined();
    expect(response.body.wine.thumbnailUrl).toBeDefined();
  });

  it('returns 400 for invalid file type', async () => {
    const wine = await createTestWine();
    const pdfBuffer = Buffer.from('fake pdf');

    const response = await request(app)
      .post(`/api/wines/${wine.id}/image`)
      .attach('image', pdfBuffer, 'document.pdf')
      .expect(400);

    expect(response.body.error).toContain('Invalid file type');
  });

  it('returns 404 for non-existent wine', async () => {
    const imageBuffer = await fs.readFile('test/fixtures/wine-label.jpg');

    await request(app)
      .post('/api/wines/invalid-id/image')
      .attach('image', imageBuffer, 'wine-label.jpg')
      .expect(404);
  });
});

describe('DELETE /api/wines/:id/image', () => {
  it('deletes image successfully', async () => {
    const wine = await createTestWineWithImage();

    await request(app).delete(`/api/wines/${wine.id}/image`).expect(204);

    const updatedWine = await prisma.wine.findUnique({
      where: { id: wine.id },
    });

    expect(updatedWine.imageUrl).toBeNull();
  });
});
```

### Frontend Component Tests

```typescript
describe('WineDetailModal - Image Upload', () => {
  it('shows upload button when no image', () => {
    const wine = createMockWine({ imageUrl: null });
    render(<WineDetailModal wine={wine} />);

    expect(screen.getByText(/upload wine label/i)).toBeInTheDocument();
  });

  it('shows image when available', () => {
    const wine = createMockWine({ imageUrl: '/uploads/wines/123/original.jpg' });
    render(<WineDetailModal wine={wine} />);

    const image = screen.getByAlt(/wine label/i);
    expect(image).toHaveAttribute('src', wine.imageUrl);
  });

  it('validates file size before upload', async () => {
    const wine = createMockWine();
    render(<WineDetailModal wine={wine} />);

    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    const input = screen.getByLabelText(/upload/i);
    await userEvent.upload(input, largeFile);

    expect(screen.getByText(/file size must be less than 5mb/i)).toBeInTheDocument();
  });
});
```

### Manual Testing Checklist

- [ ] Upload JPEG image (< 5MB)
- [ ] Upload PNG image (< 5MB)
- [ ] Upload WebP image (< 5MB)
- [ ] Try uploading file > 5MB (should reject)
- [ ] Try uploading PDF (should reject)
- [ ] Verify thumbnail appears in wine table
- [ ] Verify full image appears in detail modal
- [ ] Delete image and verify it's removed
- [ ] Upload new image to replace existing
- [ ] Test on mobile device (file picker works)
- [ ] Test with slow connection (progress indicator)

---

## Deployment Considerations

### Environment Variables

```bash
# .env (Development)
UPLOAD_DIR=./uploads/wines
MAX_FILE_SIZE=5242880

# .env (Production)
NODE_ENV=production
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=wine-cellar-production
AWS_CLOUDFRONT_DOMAIN=https://d1234567890.cloudfront.net
```

### AWS Setup Steps (Production)

1. **Create S3 Bucket**
   - Name: `wine-cellar-production`
   - Region: `us-east-1` (or your preferred region)
   - Block all public access: Yes
   - Versioning: Enabled
   - Encryption: AES-256

2. **Create IAM User**
   - Name: `wine-cellar-uploader`
   - Permissions: S3 PutObject, DeleteObject, GetObject
   - Generate access keys

3. **Set up CloudFront (Optional)**
   - Create distribution pointing to S3 bucket
   - Enable HTTPS
   - Set cache policies (TTL: 1 year for images)

4. **Configure CORS (if using direct S3 upload)**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://your-domain.com"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

### Database Migration

```bash
# 1. Create migration
npx prisma migrate dev --name add_wine_images

# 2. Apply to production
npx prisma migrate deploy
```

### Cleanup Strategy

#### Delete Images When Wine is Deleted

```typescript
// In wine deletion handler
router.delete('/wines/:id', async (req, res) => {
  const wine = await prisma.wine.findUnique({ where: { id: req.params.id } });

  if (wine?.imageUrl) {
    await storageService.deleteImage(wine.id);
  }

  await prisma.wine.delete({ where: { id: req.params.id } });

  res.status(204).send();
});
```

#### Orphaned Image Cleanup (Cron Job)

```typescript
// Scheduled task to clean up orphaned images
async function cleanupOrphanedImages() {
  const storedImages = await storageService.listAllImages();
  const wineIds = await prisma.wine.findMany({ select: { id: true } });
  const validIds = new Set(wineIds.map((w) => w.id));

  for (const imageId of storedImages) {
    if (!validIds.has(imageId)) {
      await storageService.deleteImage(imageId);
    }
  }
}
```

---

## Performance & Optimization

### Caching Strategy

**CloudFront CDN** (Production):

- Cache images for 1 year (immutable after upload)
- Use versioned URLs if image can be replaced

**Browser Caching**:

```typescript
res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
```

### Lazy Loading Images

```tsx
<img
  src={wine.imageUrl}
  alt={wine.name}
  loading="lazy" // Native lazy loading
/>
```

### Responsive Images

Generate multiple sizes for different viewports:

```typescript
// Generate 3 sizes: thumbnail, medium, large
const sizes = [
  { width: 200, name: 'thumbnail' },
  { width: 600, name: 'medium' },
  { width: 1200, name: 'large' },
];
```

### Image Optimization Best Practices

1. **WebP format** for better compression
2. **Progressive JPEG** for faster perceived loading
3. **Blur placeholder** while loading
4. **Image dimensions** in HTML to prevent layout shift

---

## Error Handling

### Upload Errors

```typescript
// Custom error classes
export class ImageUploadError extends AppError {
  constructor(
    message: string,
    public reason?: string
  ) {
    super(400, message, true, 'IMAGE_UPLOAD_ERROR');
  }
}

export class FileTooLargeError extends ImageUploadError {
  constructor(size: number, maxSize: number) {
    super(
      `File size ${size} bytes exceeds maximum ${maxSize} bytes`,
      'FILE_TOO_LARGE'
    );
  }
}

export class InvalidFileTypeError extends ImageUploadError {
  constructor(mimeType: string) {
    super(`File type ${mimeType} is not supported`, 'INVALID_FILE_TYPE');
  }
}
```

### Storage Errors

```typescript
try {
  await storageService.uploadImage(wineId, buffer, mimeType);
} catch (error) {
  if (error instanceof S3ServiceException) {
    log.error('S3 upload failed', error);
    throw new AppError(500, 'Image upload failed', true, 'STORAGE_ERROR');
  }
  throw error;
}
```

### Frontend Error Handling

```typescript
try {
  const response = await uploadImage(file);
  toast.success('Image uploaded successfully!');
} catch (error) {
  if (error instanceof ApiError) {
    if (error.errorCode === 'FILE_TOO_LARGE') {
      toast.error('File is too large. Please choose an image under 5MB.');
    } else if (error.errorCode === 'INVALID_FILE_TYPE') {
      toast.error(
        'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
      );
    } else {
      toast.error(error.message);
    }
  } else {
    toast.error('Failed to upload image. Please try again.');
  }
}
```

---

## Implementation Phases

### Phase 1: MVP (Core Functionality)

**Goal**: Basic image upload and display working in development

**Tasks**:

1. ✅ Database schema changes (add image fields to Wine model)
2. ✅ Backend: Local file storage service
3. ✅ Backend: Image upload endpoint (POST /wines/:id/image)
4. ✅ Backend: Image deletion endpoint (DELETE /wines/:id/image)
5. ✅ Backend: Image serving endpoint (GET /wines/:id/image)
6. ✅ Backend: Image processing (thumbnail generation with sharp)
7. ✅ Frontend: Upload UI in detail modal
8. ✅ Frontend: Display thumbnail in table
9. ✅ Frontend: Display full image in detail modal
10. ✅ Testing: Unit tests for storage service
11. ✅ Testing: Integration tests for API endpoints
12. ✅ Testing: Frontend component tests

**Success Criteria**:

- Can upload JPEG/PNG images up to 5MB
- Thumbnails auto-generated and displayed in table
- Full images displayed in detail modal
- All tests passing
- Error handling for invalid files

**Timeline**: ~3-5 days

---

### Phase 2: Production Readiness

**Goal**: AWS S3 storage, optimization, production deployment

**Tasks**:

1. ✅ AWS S3 service implementation
2. ✅ Storage service abstraction (dev vs. prod)
3. ✅ CloudFront CDN setup
4. ✅ Environment variable configuration
5. ✅ Image optimization (resize, compress)
6. ✅ Security hardening (file validation, rate limiting)
7. ✅ Migration script for existing data
8. ✅ Production deployment
9. ✅ Monitoring and logging

**Success Criteria**:

- Images stored in S3 with CloudFront delivery
- Fast image loading (< 500ms)
- Proper error handling and logging
- Security measures in place
- All tests passing in production

**Timeline**: ~2-3 days

---

### Phase 3: Enhancements (Future)

**Tasks**:

1. Multiple images per wine
2. Image editing (crop, rotate)
3. Drag-and-drop upload
4. Image gallery view
5. OCR to read wine label text
6. Image search/filtering

**Timeline**: TBD based on user feedback

---

## Open Questions for Discussion

Before we begin implementation, let's discuss and decide on the following:

### 1. Image Display Size in Detail Modal

**Question**: What size should the full wine label image be in the detail modal?

**Options**:

- **Option A**: Max width 600px (fits well in modal, good for label readability)
- **Option B**: Max width 800px (larger, but may require scrolling)
- **Option C**: Lightbox/full-screen view (click to expand to full size)

**Recommendation**: Option A for MVP, add Option C (lightbox) in Phase 3

---

### 2. Thumbnail Size in Table

**Question**: What size thumbnail do you want in the wine table?

**Options**:

- **Option A**: 40x40px (compact, fits well in dense tables)
- **Option B**: 60x60px (larger, easier to see details)
- **Option C**: No thumbnail in table (only in detail modal)

**Recommendation**: Option A (40x40px) - larger than 200x200 source ensures
sharp display

---

### 3. Default Image Placeholder

**Question**: What should we show when no image is uploaded?

**Options**:

- **Option A**: Wine glass emoji 🍷
- **Option B**: Placeholder image with "No Image" text
- **Option C**: Empty space (no visual indicator)

**Recommendation**: Option A (wine glass emoji) - simple, wine-themed

---

### 4. Image Replacement

**Question**: What happens when uploading a new image for a wine that already
has one?

**Options**:

- **Option A**: Automatically replace (delete old, upload new)
- **Option B**: Require explicit deletion first
- **Option C**: Keep old images as history (versioning)

**Recommendation**: Option A for MVP - simpler UX, less storage

---

### 5. Upload Location in UI

**Question**: Where should the image upload control be located?

**Options**:

- **Option A**: In detail modal (view mode and edit mode)
- **Option B**: Only in edit mode
- **Option C**: Separate "Manage Images" section

**Recommendation**: Option A - always visible for easy access

---

### 6. Testing Scope

**Question**: How comprehensive should testing be for Phase 1?

**Options**:

- **Option A**: Essential tests only (upload, delete, display)
- **Option B**: Comprehensive tests (including error cases, edge cases)
- **Option C**: Add E2E tests with Playwright

**Recommendation**: Option B for Phase 1 - thorough testing prevents production
issues

---

### 7. AWS Account

**Question**: Do you already have an AWS account for production deployment?

- If **Yes**: We can plan S3 setup in Phase 2
- If **No**: We can delay Phase 2 until you're ready to deploy

---

### 8. Multiple Images per Wine

**Question**: Do you foresee needing multiple images per wine in the future?

- If **Yes**: We should use the separate `WineImage` table from the start
- If **No**: We can use simple fields on the Wine model (easier for MVP)

**Recommendation**: Start with simple fields (Phase 1), migrate to separate
table only if needed (Phase 3)

---

## ✅ Design Decisions Summary (LOCKED IN)

**Date Finalized**: December 31, 2025

All open questions have been discussed and decided:

1. **Image Display**: Max 600px width in detail modal
2. **Thumbnails**: **DEFERRED TO PHASE 2** (faster MVP, validate quality first)
3. **Placeholder**: Wine emoji 🍷 (Phase 1) → Professional image (Phase 2)
4. **Image Replacement**: Auto-replace with confirmation dialog
5. **Upload Location**: Only in edit mode
6. **Testing**: Comprehensive (80%+ coverage, all error/edge cases)
7. **Storage**: Abstraction layer (local dev, S3-ready for Phase 2)
8. **Database**: Simple fields on Wine model (single image)

**See**:
[PHASE-1-IMPLEMENTATION-CHECKLIST.md](PHASE-1-IMPLEMENTATION-CHECKLIST.md) for
detailed task breakdown

---

## Next Steps

✅ Design decisions finalized ✅ Implementation checklist created ⏭️ **Ready to
begin implementation!**

**Start with**:

1. Database schema changes (30 min)
2. Install dependencies (15 min)
3. Storage service implementation
4. API endpoints
5. Frontend integration
6. Comprehensive testing

**Total Estimated Time**: 3-5 days (~30 hours)

---

## Success Metrics

How will we know this feature is successful?

1. **Functionality**: 95%+ of image uploads succeed
2. **Performance**: Images load in < 500ms
3. **User Experience**: Intuitive upload process, clear error messages
4. **Quality**: Thumbnails are sharp and recognizable
5. **Storage**: Efficient storage usage (thumbnails < 30KB each)
6. **Testing**: 80%+ test coverage on new code

---

## Related Documentation

- [Code Review Standards Summary](Code-Review-Standards-Summary.md)
- [Error Handling Summary](ERROR-HANDLING-SUMMARY.md)
- [Testing Summary](Test-Summary.md)
- [TODO.md](TODO.md) - Will be updated with image feature tasks

---

**End of Planning Document**
