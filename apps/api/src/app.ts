import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { prisma } from '@wine-cellar/database';
import { requestIdMiddleware } from './middleware/requestId';
import { httpLogger } from './middleware/httpLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { validate } from './middleware/validate';
import { createWineSchema, updateWineSchema, wineIdSchema } from './schemas/wine.schema';
import { NotFoundError } from './errors/AppError';
import { createLogger } from './utils/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = (): Express => {
  const app = express();

  // Request parsing
  app.use(cors());
  app.use(express.json());

  // Request tracking and logging
  app.use(requestIdMiddleware);
  app.use(httpLogger);

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

      // Construct path to image file
      const imagePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'assets',
        'wine-labels',
        wine.imageUrl
      );

      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        log.error('Image file not found on disk', new Error('Image file not found'), {
          wineId: id,
          imageUrl: wine.imageUrl,
          imagePath,
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

      await prisma.wine.delete({
        where: { id },
      });

      log.info('Wine deleted successfully', { wineId: id });
      res.status(204).send();
    } catch (error) {
      log.error('Error deleting wine', error as Error, { wineId: req.params.id });
      next(error);
    }
  });

  // 404 handler for undefined routes (must be after all routes)
  app.use(notFoundHandler);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};
