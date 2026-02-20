import request from 'supertest';
import { prisma, WineColor } from '@wine-cellar/database';
import { createApp } from '../src/app';

const app = createApp();

// Test data factory
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createValidWineData = (overrides: any = {}): any => ({
  name: 'Test Wine',
  vintage: 2020,
  producer: 'Test Producer',
  country: 'France',
  color: WineColor.RED,
  quantity: 1,
  ...overrides,
});

// Safety: verify we're connected to a test database before wiping data
function assertTestDatabase(): void {
  const url = process.env.DATABASE_URL || '';
  if (!url.includes('_test')) {
    throw new Error(
      `SAFETY: Refusing to deleteMany() against non-test database: ${url}\n` +
        'Tests must run against a database with "_test" in the URL.'
    );
  }
}

// Clean up database before each test
beforeEach(async () => {
  assertTestDatabase();
  await prisma.wine.deleteMany();
});

// Disconnect after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

describe('Error Handling and Validation', () => {
  describe('Validation Errors (400)', () => {
    it('returns 400 for missing required field: name', async () => {
      const invalidData = {
        vintage: 2020,
        producer: 'Test',
        country: 'France',
        color: WineColor.RED,
      };

      const response = await request(app).post('/api/wines').send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
      expect(response.body.fields?.name).toBeDefined();
      expect(response.body.requestId).toBeDefined();
    });

    it('returns 400 for missing required field: vintage', async () => {
      const invalidData = {
        name: 'Test Wine',
        producer: 'Test',
        country: 'France',
        color: WineColor.RED,
      };

      const response = await request(app).post('/api/wines').send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
      expect(response.body.fields?.vintage).toBeDefined();
    });

    it('returns 400 for vintage too old', async () => {
      const response = await request(app)
        .post('/api/wines')
        .send(createValidWineData({ vintage: 1899 }));

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
      expect(response.body.fields?.vintage).toContain('Vintage must be 1900 or later');
    });

    it('returns 400 for vintage in the future', async () => {
      const futureYear = new Date().getFullYear() + 1;

      const response = await request(app)
        .post('/api/wines')
        .send(createValidWineData({ vintage: futureYear }));

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
      expect(response.body.fields?.vintage).toContain('Vintage cannot be in the future');
    });

    it('returns 400 for invalid wine color', async () => {
      const response = await request(app)
        .post('/api/wines')
        .send({ ...createValidWineData(), color: 'PURPLE' });

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
      expect(response.body.fields?.color).toBeDefined();
    });

    it('returns 400 for negative quantity', async () => {
      const response = await request(app)
        .post('/api/wines')
        .send(createValidWineData({ quantity: -1 }));

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
      expect(response.body.fields?.quantity).toContain('Quantity cannot be negative');
    });

    it('returns 400 for rating out of range (too low)', async () => {
      const response = await request(app)
        .post('/api/wines')
        .send(createValidWineData({ rating: 0.5 }));

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
      expect(response.body.fields?.rating).toBeDefined();
    });

    it('returns 400 for rating out of range (too high)', async () => {
      const response = await request(app)
        .post('/api/wines')
        .send(createValidWineData({ rating: 5.5 }));

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
      expect(response.body.fields?.rating).toBeDefined();
    });

    it('returns 400 for name too long', async () => {
      const longName = 'A'.repeat(201);

      const response = await request(app)
        .post('/api/wines')
        .send(createValidWineData({ name: longName }));

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
      expect(response.body.fields?.name).toContain('Name must be less than 200 characters');
    });

    it('returns 400 for notes too long', async () => {
      const longNotes = 'A'.repeat(2001);

      const response = await request(app)
        .post('/api/wines')
        .send(createValidWineData({ notes: longNotes }));

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
      expect(response.body.fields?.notes).toContain('Notes must be less than 2000 characters');
    });

    it('returns 400 for multiple validation errors', async () => {
      const invalidData = {
        name: '', // Empty name
        vintage: 1800, // Too old
        producer: 'Test',
        country: 'France',
        color: 'INVALID', // Invalid color
        quantity: -5, // Negative quantity
      };

      const response = await request(app).post('/api/wines').send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
      expect(response.body.fields).toBeDefined();
      expect(Object.keys(response.body.fields).length).toBeGreaterThan(1);
    });

    it('rejects unknown fields in update', async () => {
      const wine = await prisma.wine.create({
        data: createValidWineData(),
      });

      const response = await request(app).put(`/api/wines/${wine.id}`).send({
        quantity: 5,
        unknownField: 'should be rejected',
      });

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });
  });

  describe('Not Found Errors (404)', () => {
    it('returns 404 when getting non-existent wine', async () => {
      const response = await request(app).get('/api/wines/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Wine');
      expect(response.body.error).toContain('not found');
      expect(response.body.errorCode).toBe('NOT_FOUND');
      expect(response.body.requestId).toBeDefined();
    });

    it('returns 404 when updating non-existent wine', async () => {
      const response = await request(app).put('/api/wines/nonexistent-id').send({ quantity: 5 });

      expect(response.status).toBe(404);
      expect(response.body.errorCode).toBe('NOT_FOUND');
    });

    it('returns 404 when deleting non-existent wine', async () => {
      const response = await request(app).delete('/api/wines/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body.errorCode).toBe('NOT_FOUND');
    });

    it('returns 404 for undefined routes', async () => {
      const response = await request(app).get('/api/undefined-route');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Cannot GET /api/undefined-route');
      expect(response.body.errorCode).toBe('ROUTE_NOT_FOUND');
      expect(response.body.requestId).toBeDefined();
    });
  });

  describe('Request ID Tracking', () => {
    it('includes request ID in successful response headers', async () => {
      const response = await request(app).get('/api/wines');

      expect(response.headers['x-request-id']).toBeDefined();
    });

    it('accepts and uses custom request ID from header', async () => {
      const customRequestId = 'custom-test-request-id-123';

      const response = await request(app).get('/api/wines').set('X-Request-ID', customRequestId);

      expect(response.headers['x-request-id']).toBe(customRequestId);
    });
  });

  describe('Error Response Format', () => {
    it('includes field-specific errors for validation failures', async () => {
      const response = await request(app).post('/api/wines').send({
        name: '',
        vintage: 1800,
        producer: 'Test',
        country: 'France',
        color: WineColor.RED,
      });

      expect(response.body).toHaveProperty('fields');
      expect(typeof response.body.fields).toBe('object');
      expect(response.body.fields.name).toBeDefined();
      expect(response.body.fields.vintage).toBeDefined();
    });
  });

  describe('Health Check Endpoint', () => {
    it('returns 200 when healthy', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.database).toBe('connected');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeGreaterThan(0);
      expect(response.body.environment).toBeDefined();
    });
  });

  describe('Data Type Validation', () => {
    it('returns 400 for vintage as string', async () => {
      const response = await request(app)
        .post('/api/wines')
        .send({ ...createValidWineData(), vintage: 'not-a-number' });

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for quantity as string', async () => {
      const response = await request(app)
        .post('/api/wines')
        .send({ ...createValidWineData(), quantity: 'five' });

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for rating with invalid increment', async () => {
      const response = await request(app)
        .post('/api/wines')
        .send(createValidWineData({ rating: 4.75 }));

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
      expect(response.body.fields?.rating).toBeDefined();
      expect(response.body.fields?.rating[0]).toContain('0.1 increments');
    });
  });

  describe('String Trimming and Sanitization', () => {
    it('trims whitespace from string fields', async () => {
      const response = await request(app)
        .post('/api/wines')
        .send(
          createValidWineData({
            name: '  Test Wine  ',
            producer: '  Test Producer  ',
            country: '  France  ',
          })
        );

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Wine');
      expect(response.body.producer).toBe('Test Producer');
      expect(response.body.country).toBe('France');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty object in POST request', async () => {
      const response = await request(app).post('/api/wines').send({});

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
      expect(response.body.fields).toBeDefined();
    });

    it('handles null values correctly', async () => {
      const response = await request(app)
        .post('/api/wines')
        .send(
          createValidWineData({
            region: null,
            grapeVariety: null,
            notes: null,
            rating: null,
          })
        );

      expect(response.status).toBe(201);
      expect(response.body.region).toBeNull();
      expect(response.body.grapeVariety).toBeNull();
      expect(response.body.notes).toBeNull();
      expect(response.body.rating).toBeNull();
    });

    it('validates ID parameter in GET request', async () => {
      const response = await request(app).get('/api/wines/');

      // Should match GET /api/wines instead
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
