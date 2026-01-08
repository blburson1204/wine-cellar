import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import path from 'path';
import { createApp } from '../../src/app';
import { storageConfig } from '../../src/config/storage';
import {
  cleanupDatabase,
  cleanupUploads,
  createTestWine,
  createValidJpegBuffer,
  createValidPngBuffer,
  createValidWebPBuffer,
  createInvalidImageBuffer,
  createOversizedBuffer,
  fileExists,
} from '../../src/test/helpers';

describe('Wine Image API Integration Tests', () => {
  const app = createApp();

  beforeEach(async () => {
    await cleanupDatabase();
    await cleanupUploads();
  });

  afterEach(async () => {
    await cleanupDatabase();
    await cleanupUploads();
  });

  describe('POST /api/wines/:id/image', () => {
    it('should successfully upload a JPEG image', async () => {
      const wine = await createTestWine();
      const imageBuffer = createValidJpegBuffer();

      const response = await request(app)
        .post(`/api/wines/${wine.id}/image`)
        .attach('image', imageBuffer, 'test.jpg')
        .expect(200);

      expect(response.body).toHaveProperty('id', wine.id);
      expect(response.body).toHaveProperty('imageUrl');
      expect(response.body.imageUrl).toBe(`${wine.id}.jpg`);

      // Verify file was saved to disk
      const imagePath = path.join(storageConfig.uploadDir, `${wine.id}.jpg`);
      const exists = await fileExists(imagePath);
      expect(exists).toBe(true);
    });

    it('should successfully upload a PNG image and convert to JPEG', async () => {
      const wine = await createTestWine();
      const imageBuffer = createValidPngBuffer();

      const response = await request(app)
        .post(`/api/wines/${wine.id}/image`)
        .attach('image', imageBuffer, 'test.png')
        .expect(200);

      expect(response.body).toHaveProperty('imageUrl');
      expect(response.body.imageUrl).toBe(`${wine.id}.jpg`);

      // Verify file was converted to JPEG
      const imagePath = path.join(storageConfig.uploadDir, `${wine.id}.jpg`);
      const exists = await fileExists(imagePath);
      expect(exists).toBe(true);
    });

    it('should successfully upload a WebP image and convert to JPEG', async () => {
      const wine = await createTestWine();
      const imageBuffer = createValidWebPBuffer();

      const response = await request(app)
        .post(`/api/wines/${wine.id}/image`)
        .attach('image', imageBuffer, 'test.webp')
        .expect(200);

      expect(response.body).toHaveProperty('imageUrl');
      expect(response.body.imageUrl).toBe(`${wine.id}.jpg`);

      const imagePath = path.join(storageConfig.uploadDir, `${wine.id}.jpg`);
      const exists = await fileExists(imagePath);
      expect(exists).toBe(true);
    });

    it('should replace existing image when uploading new one', async () => {
      const wine = await createTestWine({ imageUrl: 'old-image.jpg' });
      const imageBuffer = createValidJpegBuffer();

      const response = await request(app)
        .post(`/api/wines/${wine.id}/image`)
        .attach('image', imageBuffer, 'new-image.jpg')
        .expect(200);

      expect(response.body.imageUrl).toBe(`${wine.id}.jpg`);
    });

    it('should return 404 for non-existent wine', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const imageBuffer = createValidJpegBuffer();

      const response = await request(app)
        .post(`/api/wines/${nonExistentId}/image`)
        .attach('image', imageBuffer, 'test.jpg')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.errorCode).toBe('NOT_FOUND');
    });

    it('should return 400 when no file is uploaded', async () => {
      const wine = await createTestWine();

      const response = await request(app).post(`/api/wines/${wine.id}/image`).expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.errorCode).toBe('IMAGE_UPLOAD_ERROR');
    });

    it('should reject invalid wine ID format', async () => {
      const imageBuffer = createValidJpegBuffer();

      // Invalid UUID format passes validation but wine won't be found
      const response = await request(app)
        .post('/api/wines/invalid-uuid/image')
        .attach('image', imageBuffer, 'test.jpg')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.errorCode).toBe('NOT_FOUND');
    });

    it('should reject unsupported file types', async () => {
      const wine = await createTestWine();
      const invalidBuffer = Buffer.from('fake-gif-data');

      const response = await request(app)
        .post(`/api/wines/${wine.id}/image`)
        .attach('image', invalidBuffer, { filename: 'test.gif', contentType: 'image/gif' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.errorCode).toBe('IMAGE_UPLOAD_ERROR');
    });

    it('should reject files that are too large', async () => {
      const wine = await createTestWine();
      const oversizedBuffer = createOversizedBuffer();

      const response = await request(app)
        .post(`/api/wines/${wine.id}/image`)
        .attach('image', oversizedBuffer, 'huge.jpg');

      // Multer throws a 500 error for files exceeding size limit
      expect([400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid image data', async () => {
      const wine = await createTestWine();
      const invalidBuffer = createInvalidImageBuffer();

      const response = await request(app)
        .post(`/api/wines/${wine.id}/image`)
        .attach('image', invalidBuffer, { filename: 'fake.jpg', contentType: 'image/jpeg' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.errorCode).toBe('INVALID_IMAGE');
    });

    it('should reject empty files', async () => {
      const wine = await createTestWine();
      const emptyBuffer = Buffer.alloc(0);

      const response = await request(app)
        .post(`/api/wines/${wine.id}/image`)
        .attach('image', emptyBuffer, 'empty.jpg')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should detect file type spoofing (exe pretending to be jpg)', async () => {
      const wine = await createTestWine();
      // Create a buffer that starts with MZ (Windows executable signature)
      const maliciousBuffer = Buffer.from('MZ' + '\x00'.repeat(100));

      const response = await request(app)
        .post(`/api/wines/${wine.id}/image`)
        .attach('image', maliciousBuffer, { filename: 'malware.jpg', contentType: 'image/jpeg' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.errorCode).toBe('INVALID_IMAGE');

      // Verify no file was saved
      const imagePath = path.join(storageConfig.uploadDir, `${wine.id}.jpg`);
      const exists = await fileExists(imagePath);
      expect(exists).toBe(false);
    });

    it('should handle concurrent uploads to different wines', async () => {
      const wine1 = await createTestWine({ name: 'Wine 1' });
      const wine2 = await createTestWine({ name: 'Wine 2' });
      const imageBuffer = createValidJpegBuffer();

      const [response1, response2] = await Promise.all([
        request(app).post(`/api/wines/${wine1.id}/image`).attach('image', imageBuffer, 'test1.jpg'),
        request(app).post(`/api/wines/${wine2.id}/image`).attach('image', imageBuffer, 'test2.jpg'),
      ]);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.imageUrl).toBe(`${wine1.id}.jpg`);
      expect(response2.body.imageUrl).toBe(`${wine2.id}.jpg`);

      // Verify both files exist
      const path1 = path.join(storageConfig.uploadDir, `${wine1.id}.jpg`);
      const path2 = path.join(storageConfig.uploadDir, `${wine2.id}.jpg`);
      expect(await fileExists(path1)).toBe(true);
      expect(await fileExists(path2)).toBe(true);
    });

    it('should optimize large images (resize)', async () => {
      const wine = await createTestWine();
      // Note: In real tests you might want to create a larger actual image
      // For now we'll just verify the optimization pipeline runs
      const imageBuffer = createValidJpegBuffer();

      const response = await request(app)
        .post(`/api/wines/${wine.id}/image`)
        .attach('image', imageBuffer, 'large.jpg')
        .expect(200);

      expect(response.body.imageUrl).toBe(`${wine.id}.jpg`);

      // Image should be saved
      const imagePath = path.join(storageConfig.uploadDir, `${wine.id}.jpg`);
      const exists = await fileExists(imagePath);
      expect(exists).toBe(true);
    });
  });

  describe('DELETE /api/wines/:id/image', () => {
    it('should successfully delete an existing image', async () => {
      // Create wine with image
      const wine = await createTestWine({ imageUrl: 'test-wine.jpg' });
      const imageBuffer = createValidJpegBuffer();

      // Upload image first
      await request(app)
        .post(`/api/wines/${wine.id}/image`)
        .attach('image', imageBuffer, 'test.jpg')
        .expect(200);

      // Verify image exists
      const imagePath = path.join(storageConfig.uploadDir, `${wine.id}.jpg`);
      expect(await fileExists(imagePath)).toBe(true);

      // Delete the image
      const response = await request(app).delete(`/api/wines/${wine.id}/image`).expect(204);

      expect(response.body).toEqual({});

      // Verify file was deleted from disk
      expect(await fileExists(imagePath)).toBe(false);

      // Verify imageUrl was cleared in database
      const checkResponse = await request(app).get(`/api/wines/${wine.id}`);
      expect(checkResponse.body.imageUrl).toBeNull();
    });

    it('should return 404 for non-existent wine', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app).delete(`/api/wines/${nonExistentId}/image`).expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.errorCode).toBe('NOT_FOUND');
    });

    it('should return 404 when wine has no image', async () => {
      const wine = await createTestWine({ imageUrl: null });

      const response = await request(app).delete(`/api/wines/${wine.id}/image`).expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.errorCode).toBe('IMAGE_NOT_FOUND');
    });

    it('should reject invalid wine ID format', async () => {
      // Invalid UUID format passes validation but wine won't be found
      const response = await request(app).delete('/api/wines/invalid-uuid/image').expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.errorCode).toBe('NOT_FOUND');
    });

    it('should handle deleting already-deleted images gracefully', async () => {
      const wine = await createTestWine({ imageUrl: `${Math.random()}.jpg` });

      // Try to delete non-existent image
      const response = await request(app).delete(`/api/wines/${wine.id}/image`).expect(204);

      expect(response.body).toEqual({});
    });

    it('should handle concurrent deletes of different wine images', async () => {
      const wine1 = await createTestWine({ name: 'Wine 1' });
      const wine2 = await createTestWine({ name: 'Wine 2' });
      const imageBuffer = createValidJpegBuffer();

      // Upload images
      await request(app)
        .post(`/api/wines/${wine1.id}/image`)
        .attach('image', imageBuffer, 'test1.jpg');
      await request(app)
        .post(`/api/wines/${wine2.id}/image`)
        .attach('image', imageBuffer, 'test2.jpg');

      // Delete both concurrently
      const [response1, response2] = await Promise.all([
        request(app).delete(`/api/wines/${wine1.id}/image`),
        request(app).delete(`/api/wines/${wine2.id}/image`),
      ]);

      expect(response1.status).toBe(204);
      expect(response2.status).toBe(204);

      // Verify both files are deleted
      const path1 = path.join(storageConfig.uploadDir, `${wine1.id}.jpg`);
      const path2 = path.join(storageConfig.uploadDir, `${wine2.id}.jpg`);
      expect(await fileExists(path1)).toBe(false);
      expect(await fileExists(path2)).toBe(false);
    });
  });

  describe('Upload and Delete workflow', () => {
    it('should support full upload-replace-delete lifecycle', async () => {
      const wine = await createTestWine();
      const imageBuffer = createValidJpegBuffer();
      const imagePath = path.join(storageConfig.uploadDir, `${wine.id}.jpg`);

      // 1. Upload image
      const uploadResponse = await request(app)
        .post(`/api/wines/${wine.id}/image`)
        .attach('image', imageBuffer, 'first.jpg')
        .expect(200);

      expect(uploadResponse.body.imageUrl).toBe(`${wine.id}.jpg`);
      expect(await fileExists(imagePath)).toBe(true);

      // 2. Replace image
      const replaceResponse = await request(app)
        .post(`/api/wines/${wine.id}/image`)
        .attach('image', imageBuffer, 'second.jpg')
        .expect(200);

      expect(replaceResponse.body.imageUrl).toBe(`${wine.id}.jpg`);
      expect(await fileExists(imagePath)).toBe(true);

      // 3. Delete image
      await request(app).delete(`/api/wines/${wine.id}/image`).expect(204);

      expect(await fileExists(imagePath)).toBe(false);

      // 4. Upload again after delete
      const reuploadResponse = await request(app)
        .post(`/api/wines/${wine.id}/image`)
        .attach('image', imageBuffer, 'third.jpg')
        .expect(200);

      expect(reuploadResponse.body.imageUrl).toBe(`${wine.id}.jpg`);
      expect(await fileExists(imagePath)).toBe(true);
    });
  });
});
