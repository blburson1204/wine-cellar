import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from '@wine-cellar/database';
import { requestIdMiddleware } from './middleware/requestId';
import { httpLogger } from './middleware/httpLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { validate } from './middleware/validate';
import { createWineSchema, updateWineSchema, wineIdSchema } from './schemas/wine.schema';
import { NotFoundError } from './errors/AppError';
import { createLogger } from './utils/logger';

export const createApp = () => {
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
      database: 'unknown'
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
        orderBy: { createdAt: 'desc' }
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
        where: { id }
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

  // Create a new wine
  app.post('/api/wines', validate(createWineSchema), async (req, res, next) => {
    const log = createLogger(req);

    try {
      log.info('Creating new wine', { name: req.body.name, vintage: req.body.vintage });

      const wine = await prisma.wine.create({
        data: req.body
      });

      log.info('Wine created successfully', { wineId: wine.id, name: wine.name });
      res.status(201).json(wine);
    } catch (error) {
      log.error('Error creating wine', error as Error, { name: req.body.name });
      next(error);
    }
  });

  // Update a wine
  app.put('/api/wines/:id', validate(wineIdSchema, 'params'), validate(updateWineSchema), async (req, res, next) => {
    const log = createLogger(req);

    try {
      const { id } = req.params;
      log.info('Updating wine', { wineId: id });

      const wine = await prisma.wine.update({
        where: { id },
        data: req.body
      });

      log.info('Wine updated successfully', { wineId: id });
      res.json(wine);
    } catch (error) {
      log.error('Error updating wine', error as Error, { wineId: req.params.id });
      next(error);
    }
  });

  // Delete a wine
  app.delete('/api/wines/:id', validate(wineIdSchema, 'params'), async (req, res, next) => {
    const log = createLogger(req);

    try {
      const { id } = req.params;
      log.info('Deleting wine', { wineId: id });

      await prisma.wine.delete({
        where: { id }
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
