import { z } from 'zod';
import { WineColor } from '@prisma/client';

/**
 * Schema for creating a new wine
 */
export const createWineSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),

  vintage: z
    .number()
    .int('Vintage must be a whole number')
    .min(1900, 'Vintage must be 1900 or later')
    .max(new Date().getFullYear(), 'Vintage cannot be in the future'),

  producer: z
    .string()
    .min(1, 'Producer is required')
    .max(200, 'Producer must be less than 200 characters'),

  region: z.string().max(200, 'Region must be less than 200 characters').optional().nullable(),

  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country must be less than 100 characters'),

  grapeVariety: z
    .string()
    .max(200, 'Grape variety must be less than 200 characters')
    .optional()
    .nullable(),

  blendDetail: z
    .string()
    .max(500, 'Blend detail must be less than 500 characters')
    .optional()
    .nullable(),

  color: z.nativeEnum(WineColor, {
    message: 'Invalid wine color. Must be one of: RED, WHITE, ROSE, SPARKLING, DESSERT, FORTIFIED',
  }),

  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .default(1),

  purchasePrice: z.number().positive('Purchase price must be positive').optional().nullable(),

  purchaseDate: z.union([z.string().datetime(), z.date()]).optional().nullable(),

  drinkByDate: z.union([z.string().datetime(), z.date()]).optional().nullable(),

  rating: z
    .number()
    .min(1, 'Rating must be between 1.0 and 5.0')
    .max(5, 'Rating must be between 1.0 and 5.0')
    .multipleOf(0.1, 'Rating must be in 0.1 increments')
    .optional()
    .nullable(),

  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional().nullable(),

  wineLink: z.string().url('Wine link must be a valid URL').optional().nullable(),

  imageUrl: z.string().optional().nullable(),

  favorite: z.boolean().default(false),
});

/**
 * Schema for updating a wine (all fields optional)
 */
export const updateWineSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .max(200, 'Name must be less than 200 characters')
      .optional(),

    vintage: z
      .number()
      .int('Vintage must be a whole number')
      .min(1900, 'Vintage must be 1900 or later')
      .max(new Date().getFullYear(), 'Vintage cannot be in the future')
      .optional(),

    producer: z
      .string()
      .min(1, 'Producer cannot be empty')
      .max(200, 'Producer must be less than 200 characters')
      .optional(),

    region: z.string().max(200, 'Region must be less than 200 characters').optional().nullable(),

    country: z
      .string()
      .min(1, 'Country cannot be empty')
      .max(100, 'Country must be less than 100 characters')
      .optional(),

    grapeVariety: z
      .string()
      .max(200, 'Grape variety must be less than 200 characters')
      .optional()
      .nullable(),

    blendDetail: z
      .string()
      .max(500, 'Blend detail must be less than 500 characters')
      .optional()
      .nullable(),

    color: z
      .nativeEnum(WineColor, {
        message:
          'Invalid wine color. Must be one of: RED, WHITE, ROSE, SPARKLING, DESSERT, FORTIFIED',
      })
      .optional(),

    quantity: z
      .number()
      .int('Quantity must be a whole number')
      .min(0, 'Quantity cannot be negative')
      .optional(),

    purchasePrice: z.number().positive('Purchase price must be positive').optional().nullable(),

    purchaseDate: z.union([z.string().datetime(), z.date()]).optional().nullable(),

    drinkByDate: z.union([z.string().datetime(), z.date()]).optional().nullable(),

    rating: z
      .number()
      .min(1, 'Rating must be between 1.0 and 5.0')
      .max(5, 'Rating must be between 1.0 and 5.0')
      .multipleOf(0.1, 'Rating must be in 0.1 increments')
      .optional()
      .nullable(),

    notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional().nullable(),

    wineLink: z.string().url('Wine link must be a valid URL').optional().nullable(),

    imageUrl: z.string().optional().nullable(),

    favorite: z.boolean().optional(),
  })
  .strict(); // Reject unknown fields

/**
 * ID parameter validation
 */
export const wineIdSchema = z.object({
  id: z.string().min(1, 'Wine ID is required'),
});

// Type exports
export type CreateWineInput = z.infer<typeof createWineSchema>;
export type UpdateWineInput = z.infer<typeof updateWineSchema>;
