import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  registry,
  WineSchema,
  CreateWineSchema,
  UpdateWineSchema,
  WineIdParamSchema,
  ErrorResponseSchema,
  HealthResponseSchema,
} from '../schemas/openapi';

// Register API paths

// Health check
registry.registerPath({
  method: 'get',
  path: '/api/health',
  tags: ['Health'],
  summary: 'Health check',
  description: 'Check API and database health status',
  responses: {
    200: {
      description: 'API is healthy',
      content: {
        'application/json': {
          schema: HealthResponseSchema,
        },
      },
    },
    503: {
      description: 'API is degraded (database disconnected)',
      content: {
        'application/json': {
          schema: HealthResponseSchema,
        },
      },
    },
  },
});

// Get all wines
registry.registerPath({
  method: 'get',
  path: '/api/wines',
  tags: ['Wines'],
  summary: 'Get all wines',
  description: 'Retrieve all wines in the cellar, ordered by creation date (newest first)',
  responses: {
    200: {
      description: 'List of wines',
      content: {
        'application/json': {
          schema: z.array(WineSchema),
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Get single wine
registry.registerPath({
  method: 'get',
  path: '/api/wines/{id}',
  tags: ['Wines'],
  summary: 'Get a wine by ID',
  description: 'Retrieve a single wine by its unique identifier',
  request: {
    params: WineIdParamSchema,
  },
  responses: {
    200: {
      description: 'Wine details',
      content: {
        'application/json': {
          schema: WineSchema,
        },
      },
    },
    404: {
      description: 'Wine not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Create wine
registry.registerPath({
  method: 'post',
  path: '/api/wines',
  tags: ['Wines'],
  summary: 'Create a new wine',
  description: 'Add a new wine to the cellar',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateWineSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Wine created successfully',
      content: {
        'application/json': {
          schema: WineSchema,
        },
      },
    },
    400: {
      description: 'Validation error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Update wine
registry.registerPath({
  method: 'put',
  path: '/api/wines/{id}',
  tags: ['Wines'],
  summary: 'Update a wine',
  description: 'Update an existing wine. Only provided fields will be updated.',
  request: {
    params: WineIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: UpdateWineSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Wine updated successfully',
      content: {
        'application/json': {
          schema: WineSchema,
        },
      },
    },
    400: {
      description: 'Validation error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Wine not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Delete wine
registry.registerPath({
  method: 'delete',
  path: '/api/wines/{id}',
  tags: ['Wines'],
  summary: 'Delete a wine',
  description: 'Delete a wine from the cellar. Also deletes any associated image.',
  request: {
    params: WineIdParamSchema,
  },
  responses: {
    204: {
      description: 'Wine deleted successfully',
    },
    404: {
      description: 'Wine not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Get wine image
registry.registerPath({
  method: 'get',
  path: '/api/wines/{id}/image',
  tags: ['Wine Images'],
  summary: 'Get wine label image',
  description:
    'Retrieve the wine label image. Returns the image file with appropriate content-type header.',
  request: {
    params: WineIdParamSchema,
  },
  responses: {
    200: {
      description: 'Wine label image',
      content: {
        'image/jpeg': {
          schema: {
            type: 'string',
            format: 'binary',
          },
        },
        'image/png': {
          schema: {
            type: 'string',
            format: 'binary',
          },
        },
        'image/webp': {
          schema: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
    404: {
      description: 'Wine or image not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Upload wine image
registry.registerPath({
  method: 'post',
  path: '/api/wines/{id}/image',
  tags: ['Wine Images'],
  summary: 'Upload wine label image',
  description:
    'Upload a wine label image. Accepts JPEG, PNG, or WebP. Images are automatically optimized and converted to JPEG. Maximum file size is 5MB.',
  request: {
    params: WineIdParamSchema,
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            image: z.any().openapi({
              type: 'string',
              format: 'binary',
              description: 'Image file (JPEG, PNG, or WebP)',
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Image uploaded successfully',
      content: {
        'application/json': {
          schema: WineSchema,
        },
      },
    },
    400: {
      description: 'Invalid image or upload error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Wine not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Delete wine image
registry.registerPath({
  method: 'delete',
  path: '/api/wines/{id}/image',
  tags: ['Wine Images'],
  summary: 'Delete wine label image',
  description: 'Delete the wine label image from the wine record and storage.',
  request: {
    params: WineIdParamSchema,
  },
  responses: {
    204: {
      description: 'Image deleted successfully',
    },
    404: {
      description: 'Wine or image not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// String array schema for metadata endpoints
const StringArraySchema = z.array(z.string()).openapi({
  description: 'Array of unique values',
  example: ['Château Margaux', 'Opus One', 'Penfolds'],
});

// Get unique producers
registry.registerPath({
  method: 'get',
  path: '/api/wines/meta/producers',
  tags: ['Wine Metadata'],
  summary: 'Get unique producers',
  description: 'Retrieve a list of unique producer/winery names for autocomplete dropdowns.',
  responses: {
    200: {
      description: 'List of unique producer names',
      content: {
        'application/json': {
          schema: StringArraySchema,
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Get unique countries
registry.registerPath({
  method: 'get',
  path: '/api/wines/meta/countries',
  tags: ['Wine Metadata'],
  summary: 'Get unique countries',
  description: 'Retrieve a list of unique countries for autocomplete dropdowns.',
  responses: {
    200: {
      description: 'List of unique country names',
      content: {
        'application/json': {
          schema: StringArraySchema,
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Get unique regions
registry.registerPath({
  method: 'get',
  path: '/api/wines/meta/regions',
  tags: ['Wine Metadata'],
  summary: 'Get unique regions',
  description: 'Retrieve a list of unique wine regions for autocomplete dropdowns.',
  responses: {
    200: {
      description: 'List of unique region names',
      content: {
        'application/json': {
          schema: StringArraySchema,
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Get unique grape varieties
registry.registerPath({
  method: 'get',
  path: '/api/wines/meta/grape-varieties',
  tags: ['Wine Metadata'],
  summary: 'Get unique grape varieties',
  description: 'Retrieve a list of unique grape varieties for autocomplete dropdowns.',
  responses: {
    200: {
      description: 'List of unique grape variety names',
      content: {
        'application/json': {
          schema: StringArraySchema,
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Get unique where purchased values
registry.registerPath({
  method: 'get',
  path: '/api/wines/meta/where-purchased',
  tags: ['Wine Metadata'],
  summary: 'Get unique purchase locations',
  description: 'Retrieve a list of unique purchase locations for autocomplete dropdowns.',
  responses: {
    200: {
      description: 'List of unique purchase location names',
      content: {
        'application/json': {
          schema: StringArraySchema,
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Generate OpenAPI document
const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: '3.0.3',
  info: {
    title: 'Wine Cellar API',
    version: '1.0.0',
    description: `
## Overview

The Wine Cellar API allows you to manage your personal wine collection.
Track wines, upload label images, and organize your cellar.

## Authentication

Currently, this API does not require authentication as it's designed for personal use.

## Error Handling

All errors return a consistent JSON format:
\`\`\`json
{
  "error": "Error message",
  "errorCode": "ERROR_CODE",
  "requestId": "tracking-id"
}
\`\`\`

## Wine Colors

Valid wine colors are:
- \`RED\` - Red wines
- \`WHITE\` - White wines
- \`ROSE\` - Rosé wines
- \`SPARKLING\` - Sparkling wines (Champagne, Prosecco, etc.)
- \`DESSERT\` - Dessert wines (Sauternes, Port-style, etc.)
- \`FORTIFIED\` - Fortified wines (Port, Sherry, Madeira, etc.)
    `,
    contact: {
      name: 'Wine Cellar Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'API health monitoring',
    },
    {
      name: 'Wines',
      description: 'Wine CRUD operations',
    },
    {
      name: 'Wine Images',
      description: 'Wine label image management',
    },
    {
      name: 'Wine Metadata',
      description: 'Unique values for autocomplete dropdowns',
    },
  ],
});
