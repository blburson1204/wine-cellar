# Data Model: 009 Deploy Wine Cellar

**Date**: 2026-03-29

## Schema Changes

**None.** No database migrations required. The existing `Wine` model is
unchanged — the `imageUrl` field already stores a `String?` which will hold
Cloudinary URLs in production (full URL) and filenames in development (current
behavior).

## New Entities (Code-Level, Not Database)

### CloudinaryStorageService

Implements `IStorageService` interface. No new database tables or fields.

```typescript
class CloudinaryStorageService implements IStorageService {
  uploadImage(
    wineId: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<UploadResult>;
  deleteImage(wineId: string): Promise<void>;
  getImageUrl(wineId: string): string;
  imageExists(wineId: string): Promise<boolean>;
}
```

**Storage mapping**:

- Cloudinary folder: `wine-cellar/wines/`
- Cloudinary public_id: `wine-cellar/wines/{wineId}`
- Returned `imageUrl`: Cloudinary `secure_url` (full HTTPS URL)

### CloudinaryConfig (in config/storage.ts)

```typescript
cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};
```

## Environment Variable Map

| Variable                | Workspace     | Dev Value                                     | Production Value          | Required                 |
| ----------------------- | ------------- | --------------------------------------------- | ------------------------- | ------------------------ |
| `DATABASE_URL`          | api, database | `postgresql://...@localhost:5433/wine_cellar` | Railway-provided          | Yes                      |
| `NODE_ENV`              | api           | `development`                                 | `production`              | Yes                      |
| `PORT`                  | api           | `3001`                                        | Railway-provided          | No (defaults 3001)       |
| `STORAGE_PROVIDER`      | api           | `local`                                       | `cloudinary`              | No (defaults `local`)    |
| `CLOUDINARY_CLOUD_NAME` | api           | —                                             | From Cloudinary dashboard | If cloudinary            |
| `CLOUDINARY_API_KEY`    | api           | —                                             | From Cloudinary dashboard | If cloudinary            |
| `CLOUDINARY_API_SECRET` | api           | —                                             | From Cloudinary dashboard | If cloudinary            |
| `CORS_ORIGIN`           | api           | — (permissive)                                | `https://winescellar.net` | No (defaults permissive) |
| `NEXT_PUBLIC_API_URL`   | web           | `http://localhost:3001`                       | Railway API URL           | Yes                      |
| `AUTH_USERNAME`         | api, web      | — (auth skipped)                              | Your chosen username      | No (skips auth if unset) |
| `AUTH_PASSWORD`         | api, web      | — (auth skipped)                              | Your chosen password      | No (skips auth if unset) |
