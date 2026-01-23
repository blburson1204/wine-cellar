import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
import { prisma } from '@wine-cellar/database';
import { requestIdMiddleware } from './middleware/requestId';
import { httpLogger } from './middleware/httpLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { validate } from './middleware/validate';
import { createWineSchema, updateWineSchema, wineIdSchema } from './schemas/wine.schema';
import { NotFoundError, ImageUploadError } from './errors/AppError';
import { createLogger } from './utils/logger';
import { storageService } from './services/storage';
import { storageConfig } from './config/storage';
import { openApiDocument } from './docs/openapi';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory for processing
  limits: {
    fileSize: storageConfig.maxFileSize, // 5MB max
  },
  fileFilter: (_req, file, cb) => {
    // Basic MIME type check (will be validated more thoroughly in the handler)
    if (storageConfig.allowedMimeTypes.includes(file.mimetype as any)) {
      cb(null, true);
    } else {
      cb(new ImageUploadError(`File type ${file.mimetype} not supported`));
    }
  },
});

export const createApp = (): Express => {
  const app = express();

  // Request parsing
  app.use(cors());
  app.use(express.json());

  // Request tracking and logging
  app.use(requestIdMiddleware);
  app.use(httpLogger);

  // API Documentation (Swagger UI)
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get('/api/docs.json', (_req, res) => res.json(openApiDocument));

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    const log = createLogger(req);

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'unknown',
    };

    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      health.database = 'connected';
      log.info('Health check passed');
    } catch (error) {
      health.database = 'disconnected';
      health.status = 'degraded';
      log.error('Health check failed - database disconnected', error as Error);
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  });

  // Get all wines
  app.get('/api/wines', async (req, res, next) => {
    const log = createLogger(req);

    try {
      log.info('Fetching all wines');

      const wines = await prisma.wine.findMany({
        orderBy: { createdAt: 'desc' },
      });

      log.info('Wines fetched successfully', { count: wines.length });
      res.json(wines);
    } catch (error) {
      log.error('Error fetching wines', error as Error);
      next(error);
    }
  });

  // Get unique wherePurchased values for combobox
  app.get('/api/wines/meta/where-purchased', async (req, res, next) => {
    const log = createLogger(req);

    try {
      log.info('Fetching unique wherePurchased values');

      const results = await prisma.wine.findMany({
        where: {
          wherePurchased: {
            not: null,
          },
        },
        select: {
          wherePurchased: true,
        },
        distinct: ['wherePurchased'],
        orderBy: {
          wherePurchased: 'asc',
        },
      });

      const values = results
        .map((r) => r.wherePurchased)
        .filter((v): v is string => v !== null && v.trim() !== '');

      log.info('Fetched wherePurchased values', { count: values.length });
      res.json(values);
    } catch (error) {
      log.error('Error fetching wherePurchased values', error as Error);
      next(error);
    }
  });

  // Get unique producer values for combobox
  app.get('/api/wines/meta/producers', async (req, res, next) => {
    const log = createLogger(req);

    try {
      const results = await prisma.wine.findMany({
        select: { producer: true },
        distinct: ['producer'],
        orderBy: { producer: 'asc' },
      });

      const values = results
        .map((r) => r.producer)
        .filter((v): v is string => v !== null && v.trim() !== '');

      res.json(values);
    } catch (error) {
      log.error('Error fetching producer values', error as Error);
      next(error);
    }
  });

  // Get unique country values for combobox
  app.get('/api/wines/meta/countries', async (req, res, next) => {
    const log = createLogger(req);

    try {
      const results = await prisma.wine.findMany({
        select: { country: true },
        distinct: ['country'],
        orderBy: { country: 'asc' },
      });

      const values = results
        .map((r) => r.country)
        .filter((v): v is string => v !== null && v.trim() !== '');

      res.json(values);
    } catch (error) {
      log.error('Error fetching country values', error as Error);
      next(error);
    }
  });

  // Get unique region values for combobox
  app.get('/api/wines/meta/regions', async (req, res, next) => {
    const log = createLogger(req);

    try {
      const results = await prisma.wine.findMany({
        where: { region: { not: null } },
        select: { region: true },
        distinct: ['region'],
        orderBy: { region: 'asc' },
      });

      const values = results
        .map((r) => r.region)
        .filter((v): v is string => v !== null && v.trim() !== '');

      res.json(values);
    } catch (error) {
      log.error('Error fetching region values', error as Error);
      next(error);
    }
  });

  // Get unique grape variety values for combobox
  app.get('/api/wines/meta/grape-varieties', async (req, res, next) => {
    const log = createLogger(req);

    try {
      const results = await prisma.wine.findMany({
        where: { grapeVariety: { not: null } },
        select: { grapeVariety: true },
        distinct: ['grapeVariety'],
        orderBy: { grapeVariety: 'asc' },
      });

      const values = results
        .map((r) => r.grapeVariety)
        .filter((v): v is string => v !== null && v.trim() !== '');

      res.json(values);
    } catch (error) {
      log.error('Error fetching grape variety values', error as Error);
      next(error);
    }
  });

  // Get a single wine
  app.get('/api/wines/:id', validate(wineIdSchema, 'params'), async (req, res, next) => {
    const log = createLogger(req);

    try {
      const { id } = req.params;
      log.info('Fetching wine', { wineId: id });

      const wine = await prisma.wine.findUnique({
        where: { id },
      });

      if (!wine) {
        log.warn('Wine not found', { wineId: id });
        throw new NotFoundError('Wine', id);
      }

      log.info('Wine retrieved successfully', { wineId: id });
      res.json(wine);
    } catch (error) {
      next(error);
    }
  });

  // Get wine label image
  app.get('/api/wines/:id/image', validate(wineIdSchema, 'params'), async (req, res, next) => {
    const log = createLogger(req);

    try {
      const { id } = req.params;
      log.info('Fetching wine image', { wineId: id });

      // Find wine by ID
      const wine = await prisma.wine.findUnique({
        where: { id },
      });

      if (!wine) {
        log.warn('Wine not found', { wineId: id });
        throw new NotFoundError('Wine', id);
      }

      // Check if wine has an image
      if (!wine.imageUrl) {
        log.warn('Wine has no image', { wineId: id });
        return res.status(404).json({
          error: 'No image found for this wine',
          errorCode: 'IMAGE_NOT_FOUND',
        });
      }

      // Try uploaded images first (from uploads directory)
      const uploadedImagePath = path.join(__dirname, '..', 'uploads', 'wines', wine.imageUrl);

      // Then try existing images (from assets directory)
      const assetImagePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'assets',
        'wine-labels',
        wine.imageUrl
      );

      let imagePath: string;
      if (fs.existsSync(uploadedImagePath)) {
        imagePath = uploadedImagePath;
      } else if (fs.existsSync(assetImagePath)) {
        imagePath = assetImagePath;
      } else {
        log.error('Image file not found on disk', new Error('Image file not found'), {
          wineId: id,
          imageUrl: wine.imageUrl,
          uploadedImagePath,
          assetImagePath,
        });
        return res.status(404).json({
          error: 'Image file not found',
          errorCode: 'IMAGE_FILE_NOT_FOUND',
        });
      }

      // Determine MIME type from extension
      const ext = path.extname(wine.imageUrl).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
      };
      const mimeType = mimeTypes[ext] || 'image/jpeg';

      // Set caching headers (cache for 1 year since images are immutable)
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

      // Send the file
      log.info('Serving wine image', { wineId: id, imageUrl: wine.imageUrl });
      return res.sendFile(imagePath);
    } catch (error) {
      log.error('Error serving wine image', error as Error);
      next(error);
    }
  });

  // Upload wine label image
  app.post(
    '/api/wines/:id/image',
    validate(wineIdSchema, 'params'),
    upload.single('image'),
    async (req, res, next) => {
      const log = createLogger(req);

      try {
        const { id } = req.params;
        log.info('Uploading wine image', { wineId: id });

        // Check if wine exists
        const wine = await prisma.wine.findUnique({
          where: { id },
        });

        if (!wine) {
          log.warn('Wine not found', { wineId: id });
          throw new NotFoundError('Wine', id);
        }

        // Check if file was uploaded
        if (!req.file) {
          log.warn('No file uploaded', { wineId: id });
          throw new ImageUploadError('No image file provided');
        }

        // Upload image using storage service
        const uploadResult = await storageService.uploadImage(
          id,
          req.file.buffer,
          req.file.mimetype
        );

        log.info('Image uploaded successfully', {
          wineId: id,
          imageUrl: uploadResult.imageUrl,
          fileSize: uploadResult.fileSize,
        });

        // Update wine in database
        const updatedWine = await prisma.wine.update({
          where: { id },
          data: {
            imageUrl: uploadResult.imageUrl,
          },
        });

        res.json(updatedWine);
      } catch (error) {
        log.error('Error uploading wine image', error as Error, { wineId: req.params.id });
        next(error);
      }
    }
  );

  // Delete wine label image
  app.delete('/api/wines/:id/image', validate(wineIdSchema, 'params'), async (req, res, next) => {
    const log = createLogger(req);

    try {
      const { id } = req.params;
      log.info('Deleting wine image', { wineId: id });

      // Check if wine exists
      const wine = await prisma.wine.findUnique({
        where: { id },
      });

      if (!wine) {
        log.warn('Wine not found', { wineId: id });
        throw new NotFoundError('Wine', id);
      }

      // Check if wine has an image
      if (!wine.imageUrl) {
        log.warn('Wine has no image to delete', { wineId: id });
        return res.status(404).json({
          error: 'No image found for this wine',
          errorCode: 'IMAGE_NOT_FOUND',
        });
      }

      // Delete image from storage
      await storageService.deleteImage(id);

      log.info('Image deleted from storage', { wineId: id });

      // Update wine in database
      await prisma.wine.update({
        where: { id },
        data: {
          imageUrl: null,
        },
      });

      log.info('Wine image deleted successfully', { wineId: id });
      return res.status(204).send();
    } catch (error) {
      log.error('Error deleting wine image', error as Error, { wineId: req.params.id });
      return next(error);
    }
  });

  // Create a new wine
  app.post('/api/wines', validate(createWineSchema), async (req, res, next) => {
    const log = createLogger(req);

    try {
      log.info('Creating new wine', { name: req.body.name, vintage: req.body.vintage });

      const wine = await prisma.wine.create({
        data: req.body,
      });

      log.info('Wine created successfully', { wineId: wine.id, name: wine.name });
      res.status(201).json(wine);
    } catch (error) {
      log.error('Error creating wine', error as Error, { name: req.body.name });
      next(error);
    }
  });

  // Update a wine
  app.put(
    '/api/wines/:id',
    validate(wineIdSchema, 'params'),
    validate(updateWineSchema),
    async (req, res, next) => {
      const log = createLogger(req);

      try {
        const { id } = req.params;
        log.info('Updating wine', { wineId: id });

        const wine = await prisma.wine.update({
          where: { id },
          data: req.body,
        });

        log.info('Wine updated successfully', { wineId: id });
        res.json(wine);
      } catch (error) {
        log.error('Error updating wine', error as Error, { wineId: req.params.id });
        next(error);
      }
    }
  );

  // Delete a wine
  app.delete('/api/wines/:id', validate(wineIdSchema, 'params'), async (req, res, next) => {
    const log = createLogger(req);

    try {
      const { id } = req.params;
      log.info('Deleting wine', { wineId: id });

      // Get wine first to check if it has an image
      const wine = await prisma.wine.findUnique({
        where: { id },
      });

      if (!wine) {
        throw new NotFoundError('Wine', id);
      }

      // Delete associated image if it exists
      if (wine.imageUrl) {
        try {
          await storageService.deleteImage(id);
          log.info('Wine image deleted', { wineId: id });
        } catch (error) {
          // Log error but continue with wine deletion
          log.warn('Failed to delete wine image, continuing with wine deletion', {
            wineId: id,
            error: error as Error,
          });
        }
      }

      // Delete the wine from database
      await prisma.wine.delete({
        where: { id },
      });

      log.info('Wine deleted successfully', { wineId: id });
      return res.status(204).send();
    } catch (error) {
      log.error('Error deleting wine', error as Error, { wineId: req.params.id });
      return next(error);
    }
  });

  // 404 handler for undefined routes (must be after all routes)
  app.use(notFoundHandler);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};
