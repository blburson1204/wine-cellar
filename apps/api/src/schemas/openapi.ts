import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { WineColor } from '@prisma/client';

// Extend Zod with OpenAPI support
extendZodWithOpenApi(z);

// Create OpenAPI registry
export const registry = new OpenAPIRegistry();

// Wine color enum schema with OpenAPI metadata
const wineColorSchema = z.nativeEnum(WineColor).openapi({
  description: 'The color/type of wine',
  example: 'RED',
});

// Wine response schema (what the API returns)
export const WineSchema = z
  .object({
    id: z
      .string()
      .openapi({ description: 'Unique identifier', example: 'cmk4u1sk80000muozbct8f3u3' }),
    name: z.string().openapi({ description: 'Wine name', example: 'Château Margaux 2015' }),
    vintage: z.number().int().openapi({ description: 'Vintage year', example: 2015 }),
    producer: z
      .string()
      .openapi({ description: 'Wine producer/winery', example: 'Château Margaux' }),
    region: z.string().nullable().openapi({ description: 'Wine region', example: 'Margaux' }),
    country: z.string().openapi({ description: 'Country of origin', example: 'France' }),
    grapeVariety: z
      .string()
      .nullable()
      .openapi({ description: 'Primary grape variety', example: 'Cabernet Sauvignon' }),
    blendDetail: z.string().nullable().openapi({
      description: 'Blend composition details',
      example: '75% Cabernet Sauvignon, 25% Merlot',
    }),
    color: wineColorSchema,
    quantity: z.number().int().openapi({ description: 'Number of bottles in cellar', example: 6 }),
    purchasePrice: z
      .number()
      .nullable()
      .openapi({ description: 'Purchase price per bottle', example: 89.99 }),
    purchaseDate: z
      .string()
      .datetime()
      .nullable()
      .openapi({ description: 'Date of purchase (ISO 8601)', example: '2023-06-15T00:00:00.000Z' }),
    drinkByDate: z.string().datetime().nullable().openapi({
      description: 'Recommended drink-by date (ISO 8601)',
      example: '2035-12-31T00:00:00.000Z',
    }),
    rating: z
      .number()
      .nullable()
      .openapi({ description: 'Personal rating (1.0-5.0)', example: 4.5 }),
    expertRatings: z.string().nullable().openapi({
      description: 'Expert ratings (e.g., Wine Spectator, Robert Parker)',
      example: 'WS 95, RP 97',
    }),
    wherePurchased: z.string().nullable().openapi({
      description: 'Where the wine was purchased',
      example: 'Total Wine & More',
    }),
    notes: z.string().nullable().openapi({
      description: 'Tasting notes or comments',
      example: 'Elegant with notes of blackcurrant',
    }),
    wineLink: z.string().url().nullable().openapi({
      description: 'Link to wine information',
      example: 'https://www.vivino.com/wines/123',
    }),
    imageUrl: z.string().nullable().openapi({
      description: 'Wine label image filename',
      example: 'cmk4u1sk80000muozbct8f3u3.jpg',
    }),
    favorite: z
      .boolean()
      .openapi({ description: 'Whether wine is marked as favorite', example: true }),
    createdAt: z
      .string()
      .datetime()
      .openapi({ description: 'Record creation timestamp', example: '2023-06-15T10:30:00.000Z' }),
    updatedAt: z.string().datetime().openapi({
      description: 'Record last update timestamp',
      example: '2023-06-15T10:30:00.000Z',
    }),
  })
  .openapi('Wine');

// Create wine request schema
export const CreateWineSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(200)
      .openapi({ description: 'Wine name (required)', example: 'Château Margaux 2015' }),
    vintage: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear())
      .openapi({ description: 'Vintage year (required)', example: 2015 }),
    producer: z
      .string()
      .min(1)
      .max(200)
      .openapi({ description: 'Wine producer/winery (required)', example: 'Château Margaux' }),
    region: z
      .string()
      .max(200)
      .optional()
      .nullable()
      .openapi({ description: 'Wine region', example: 'Margaux' }),
    country: z
      .string()
      .min(1)
      .max(100)
      .openapi({ description: 'Country of origin (required)', example: 'France' }),
    grapeVariety: z
      .string()
      .max(200)
      .optional()
      .nullable()
      .openapi({ description: 'Primary grape variety', example: 'Cabernet Sauvignon' }),
    blendDetail: z.string().max(500).optional().nullable().openapi({
      description: 'Blend composition details',
      example: '75% Cabernet Sauvignon, 25% Merlot',
    }),
    color: wineColorSchema.openapi({ description: 'Wine color/type (required)' }),
    quantity: z
      .number()
      .int()
      .min(0)
      .default(1)
      .openapi({ description: 'Number of bottles', example: 6 }),
    purchasePrice: z
      .number()
      .positive()
      .optional()
      .nullable()
      .openapi({ description: 'Purchase price per bottle', example: 89.99 }),
    purchaseDate: z
      .union([z.string().datetime(), z.date()])
      .optional()
      .nullable()
      .openapi({ description: 'Date of purchase (ISO 8601)', example: '2023-06-15T00:00:00.000Z' }),
    drinkByDate: z.union([z.string().datetime(), z.date()]).optional().nullable().openapi({
      description: 'Recommended drink-by date (ISO 8601)',
      example: '2035-12-31T00:00:00.000Z',
    }),
    rating: z
      .number()
      .min(1)
      .max(5)
      .multipleOf(0.1)
      .optional()
      .nullable()
      .openapi({ description: 'Personal rating (1.0-5.0 in 0.1 increments)', example: 4.5 }),
    expertRatings: z.string().max(500).optional().nullable().openapi({
      description: 'Expert ratings (e.g., Wine Spectator, Robert Parker)',
      example: 'WS 95, RP 97',
    }),
    wherePurchased: z.string().max(200).optional().nullable().openapi({
      description: 'Where the wine was purchased',
      example: 'Total Wine & More',
    }),
    notes: z.string().max(2000).optional().nullable().openapi({
      description: 'Tasting notes or comments',
      example: 'Elegant with notes of blackcurrant',
    }),
    wineLink: z.string().url().optional().nullable().openapi({
      description: 'Link to wine information',
      example: 'https://www.vivino.com/wines/123',
    }),
    imageUrl: z
      .string()
      .optional()
      .nullable()
      .openapi({ description: 'Wine label image filename' }),
    favorite: z
      .boolean()
      .default(false)
      .openapi({ description: 'Mark as favorite', example: false }),
  })
  .openapi('CreateWineRequest');

// Update wine request schema (all fields optional)
export const UpdateWineSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(200)
      .optional()
      .openapi({ description: 'Wine name', example: 'Château Margaux 2015' }),
    vintage: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear())
      .optional()
      .openapi({ description: 'Vintage year', example: 2015 }),
    producer: z
      .string()
      .min(1)
      .max(200)
      .optional()
      .openapi({ description: 'Wine producer/winery', example: 'Château Margaux' }),
    region: z
      .string()
      .max(200)
      .optional()
      .nullable()
      .openapi({ description: 'Wine region', example: 'Margaux' }),
    country: z
      .string()
      .min(1)
      .max(100)
      .optional()
      .openapi({ description: 'Country of origin', example: 'France' }),
    grapeVariety: z
      .string()
      .max(200)
      .optional()
      .nullable()
      .openapi({ description: 'Primary grape variety', example: 'Cabernet Sauvignon' }),
    blendDetail: z.string().max(500).optional().nullable().openapi({
      description: 'Blend composition details',
      example: '75% Cabernet Sauvignon, 25% Merlot',
    }),
    color: wineColorSchema.optional().openapi({ description: 'Wine color/type' }),
    quantity: z
      .number()
      .int()
      .min(0)
      .optional()
      .openapi({ description: 'Number of bottles', example: 6 }),
    purchasePrice: z
      .number()
      .positive()
      .optional()
      .nullable()
      .openapi({ description: 'Purchase price per bottle', example: 89.99 }),
    purchaseDate: z
      .union([z.string().datetime(), z.date()])
      .optional()
      .nullable()
      .openapi({ description: 'Date of purchase (ISO 8601)', example: '2023-06-15T00:00:00.000Z' }),
    drinkByDate: z.union([z.string().datetime(), z.date()]).optional().nullable().openapi({
      description: 'Recommended drink-by date (ISO 8601)',
      example: '2035-12-31T00:00:00.000Z',
    }),
    rating: z
      .number()
      .min(1)
      .max(5)
      .multipleOf(0.1)
      .optional()
      .nullable()
      .openapi({ description: 'Personal rating (1.0-5.0 in 0.1 increments)', example: 4.5 }),
    expertRatings: z.string().max(500).optional().nullable().openapi({
      description: 'Expert ratings (e.g., Wine Spectator, Robert Parker)',
      example: 'WS 95, RP 97',
    }),
    wherePurchased: z.string().max(200).optional().nullable().openapi({
      description: 'Where the wine was purchased',
      example: 'Total Wine & More',
    }),
    notes: z.string().max(2000).optional().nullable().openapi({
      description: 'Tasting notes or comments',
      example: 'Elegant with notes of blackcurrant',
    }),
    wineLink: z.string().url().optional().nullable().openapi({
      description: 'Link to wine information',
      example: 'https://www.vivino.com/wines/123',
    }),
    imageUrl: z
      .string()
      .optional()
      .nullable()
      .openapi({ description: 'Wine label image filename' }),
    favorite: z.boolean().optional().openapi({ description: 'Mark as favorite', example: true }),
  })
  .openapi('UpdateWineRequest');

// Wine ID parameter schema
export const WineIdParamSchema = z
  .object({
    id: z.string().min(1).openapi({ description: 'Wine ID', example: 'cmk4u1sk80000muozbct8f3u3' }),
  })
  .openapi('WineIdParam');

// Error response schema
export const ErrorResponseSchema = z
  .object({
    error: z.string().openapi({ description: 'Error message', example: 'Wine not found' }),
    errorCode: z.string().optional().openapi({ description: 'Error code', example: 'NOT_FOUND' }),
    requestId: z
      .string()
      .optional()
      .openapi({ description: 'Request tracking ID', example: 'abc123-def456' }),
    fields: z
      .record(z.array(z.string()))
      .optional()
      .openapi({
        description: 'Field-level validation errors',
        example: { name: ['Name is required'] },
      }),
  })
  .openapi('ErrorResponse');

// Health check response schema
export const HealthResponseSchema = z
  .object({
    status: z
      .enum(['ok', 'degraded'])
      .openapi({ description: 'Overall health status', example: 'ok' }),
    timestamp: z
      .string()
      .datetime()
      .openapi({ description: 'Current server time', example: '2023-06-15T10:30:00.000Z' }),
    uptime: z.number().openapi({ description: 'Server uptime in seconds', example: 3600 }),
    environment: z.string().openapi({ description: 'Current environment', example: 'development' }),
    database: z
      .enum(['connected', 'disconnected', 'unknown'])
      .openapi({ description: 'Database connection status', example: 'connected' }),
  })
  .openapi('HealthResponse');

// Image upload response (same as Wine)
export const ImageUploadResponseSchema = WineSchema.openapi('ImageUploadResponse');

// Register schemas
registry.register('Wine', WineSchema);
registry.register('CreateWineRequest', CreateWineSchema);
registry.register('UpdateWineRequest', UpdateWineSchema);
registry.register('ErrorResponse', ErrorResponseSchema);
registry.register('HealthResponse', HealthResponseSchema);
