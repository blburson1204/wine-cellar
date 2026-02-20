import request from 'supertest';
import { prisma, WineColor } from '@wine-cellar/database';
import { createApp } from '../src/app';

const app = createApp();

// Test data factory
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createWineData = (overrides: any = {}): any => ({
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

describe('Wine API', () => {
  describe('POST /api/wines', () => {
    it('creates a new wine with valid data', async () => {
      const wineData = createWineData({
        name: 'Chateau Margaux',
        vintage: 2015,
      });

      const response = await request(app).post('/api/wines').send(wineData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(wineData);
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    it('creates wine with all optional fields', async () => {
      const wineData = createWineData({
        region: 'Bordeaux',
        grapeVariety: 'Cabernet Sauvignon',
        rating: 4.8,
        notes: 'Excellent vintage',
      });

      const response = await request(app).post('/api/wines').send(wineData);

      expect(response.status).toBe(201);
      expect(response.body.region).toBe('Bordeaux');
      expect(response.body.grapeVariety).toBe('Cabernet Sauvignon');
      expect(response.body.rating).toBe(4.8);
    });

    it('creates wine with different colors', async () => {
      const colors = [
        WineColor.RED,
        WineColor.WHITE,
        WineColor.ROSE,
        WineColor.SPARKLING,
        WineColor.DESSERT,
        WineColor.FORTIFIED,
      ];

      for (const color of colors) {
        const response = await request(app)
          .post('/api/wines')
          .send(createWineData({ name: `${color} Wine`, color }));

        expect(response.status).toBe(201);
        expect(response.body.color).toBe(color);
      }
    });
  });

  describe('GET /api/wines', () => {
    it('returns empty array when no wines exist', async () => {
      const response = await request(app).get('/api/wines');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('returns all wines', async () => {
      // Create test wines
      await prisma.wine.create({ data: createWineData({ name: 'Wine 1' }) });
      await prisma.wine.create({ data: createWineData({ name: 'Wine 2' }) });
      await prisma.wine.create({ data: createWineData({ name: 'Wine 3' }) });

      const response = await request(app).get('/api/wines');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      expect(response.body[0].name).toBeDefined();
    });

    it('returns wines in descending order by creation date', async () => {
      await prisma.wine.create({
        data: createWineData({ name: 'First Wine' }),
      });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      await prisma.wine.create({
        data: createWineData({ name: 'Second Wine' }),
      });

      const response = await request(app).get('/api/wines');

      expect(response.status).toBe(200);
      expect(response.body[0].name).toBe('Second Wine'); // Most recent first
      expect(response.body[1].name).toBe('First Wine');
    });
  });

  describe('GET /api/wines/:id', () => {
    it('returns a wine by ID', async () => {
      const wine = await prisma.wine.create({
        data: createWineData({ name: 'Specific Wine' }),
      });

      const response = await request(app).get(`/api/wines/${wine.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(wine.id);
      expect(response.body.name).toBe('Specific Wine');
    });
  });

  describe('PUT /api/wines/:id', () => {
    it('updates a wine', async () => {
      const wine = await prisma.wine.create({
        data: createWineData({ quantity: 1 }),
      });

      const response = await request(app).put(`/api/wines/${wine.id}`).send({ quantity: 5 });

      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(5);
      expect(response.body.id).toBe(wine.id);
    });

    it('updates multiple fields', async () => {
      const wine = await prisma.wine.create({
        data: createWineData(),
      });

      const updates = {
        quantity: 10,
        rating: 4.9,
        notes: 'Updated notes',
      };

      const response = await request(app).put(`/api/wines/${wine.id}`).send(updates);

      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(10);
      expect(response.body.rating).toBe(4.9);
      expect(response.body.notes).toBe('Updated notes');
    });
  });

  describe('DELETE /api/wines/:id', () => {
    it('deletes a wine', async () => {
      const wine = await prisma.wine.create({
        data: createWineData(),
      });

      const response = await request(app).delete(`/api/wines/${wine.id}`);

      expect(response.status).toBe(204);

      // Verify wine is deleted
      const wines = await prisma.wine.findMany();
      expect(wines).toHaveLength(0);
    });
  });

  describe('Integration: Full Wine Lifecycle', () => {
    it('completes create → read → update → delete flow', async () => {
      // Create
      const createResponse = await request(app)
        .post('/api/wines')
        .send(createWineData({ name: 'Lifecycle Wine' }));

      expect(createResponse.status).toBe(201);
      const wineId = createResponse.body.id;

      // Read (single)
      const getResponse = await request(app).get(`/api/wines/${wineId}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.name).toBe('Lifecycle Wine');

      // Read (list)
      const listResponse = await request(app).get('/api/wines');
      expect(listResponse.status).toBe(200);
      expect(listResponse.body).toHaveLength(1);

      // Update
      const updateResponse = await request(app)
        .put(`/api/wines/${wineId}`)
        .send({ quantity: 3, rating: 4.5 });
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.quantity).toBe(3);

      // Delete
      const deleteResponse = await request(app).delete(`/api/wines/${wineId}`);
      expect(deleteResponse.status).toBe(204);

      // Verify deleted
      const finalListResponse = await request(app).get('/api/wines');
      expect(finalListResponse.body).toHaveLength(0);
    });
  });

  describe('Data Validation', () => {
    it('handles special characters in wine names', async () => {
      const wineData = createWineData({
        name: "Château d'Yquem - Sauternes (1er Cru)",
      });

      const response = await request(app).post('/api/wines').send(wineData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("Château d'Yquem - Sauternes (1er Cru)");
    });

    it('handles very old vintages', async () => {
      const response = await request(app)
        .post('/api/wines')
        .send(createWineData({ vintage: 1900 }));

      expect(response.status).toBe(201);
      expect(response.body.vintage).toBe(1900);
    });

    it('handles large quantities', async () => {
      const response = await request(app)
        .post('/api/wines')
        .send(createWineData({ quantity: 1000 }));

      expect(response.status).toBe(201);
      expect(response.body.quantity).toBe(1000);
    });
  });

  describe('GET /api/wines/:id/image', () => {
    it('returns 404 when wine does not exist', async () => {
      const response = await request(app).get('/api/wines/nonexistent-id/image');

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
      expect(response.body.errorCode).toBe('NOT_FOUND');
    });

    it('returns 404 when wine has no imageUrl', async () => {
      const wine = await prisma.wine.create({
        data: createWineData({ imageUrl: null }),
      });

      const response = await request(app).get(`/api/wines/${wine.id}/image`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No image found for this wine');
      expect(response.body.errorCode).toBe('IMAGE_NOT_FOUND');
    });

    it('returns 404 when image file does not exist on disk', async () => {
      const wine = await prisma.wine.create({
        data: createWineData({ imageUrl: 'nonexistent-image.jpg' }),
      });

      const response = await request(app).get(`/api/wines/${wine.id}/image`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Image file not found');
      expect(response.body.errorCode).toBe('IMAGE_FILE_NOT_FOUND');
    });
  });

  describe('Expert Ratings and Where Purchased Fields', () => {
    it('creates wine with expertRatings and wherePurchased', async () => {
      const wineData = createWineData({
        expertRatings: 'WS 92, RP 94',
        wherePurchased: 'Total Wine',
      });

      const response = await request(app).post('/api/wines').send(wineData);

      expect(response.status).toBe(201);
      expect(response.body.expertRatings).toBe('WS 92, RP 94');
      expect(response.body.wherePurchased).toBe('Total Wine');
    });

    it('updates wine with expertRatings and wherePurchased', async () => {
      const wine = await prisma.wine.create({
        data: createWineData(),
      });

      const response = await request(app).put(`/api/wines/${wine.id}`).send({
        expertRatings: 'JD 95, WE 93',
        wherePurchased: 'Wine.com',
      });

      expect(response.status).toBe(200);
      expect(response.body.expertRatings).toBe('JD 95, WE 93');
      expect(response.body.wherePurchased).toBe('Wine.com');
    });

    it('allows null values for expertRatings and wherePurchased', async () => {
      const wine = await prisma.wine.create({
        data: createWineData({
          expertRatings: 'WS 90',
          wherePurchased: 'Local Store',
        }),
      });

      const response = await request(app).put(`/api/wines/${wine.id}`).send({
        expertRatings: null,
        wherePurchased: null,
      });

      expect(response.status).toBe(200);
      expect(response.body.expertRatings).toBeNull();
      expect(response.body.wherePurchased).toBeNull();
    });

    it('validates expertRatings max length (500 chars)', async () => {
      const longString = 'a'.repeat(501);
      const response = await request(app)
        .post('/api/wines')
        .send(createWineData({ expertRatings: longString }));

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('validates wherePurchased max length (200 chars)', async () => {
      const longString = 'a'.repeat(201);
      const response = await request(app)
        .post('/api/wines')
        .send(createWineData({ wherePurchased: longString }));

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('Meta Endpoints for Comboboxes', () => {
    describe('GET /api/wines/meta/where-purchased', () => {
      it('returns empty array when no wines exist', async () => {
        const response = await request(app).get('/api/wines/meta/where-purchased');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
      });

      it('returns unique wherePurchased values', async () => {
        await prisma.wine.createMany({
          data: [
            createWineData({ name: 'Wine 1', wherePurchased: 'Total Wine' }),
            createWineData({ name: 'Wine 2', wherePurchased: 'Wine.com' }),
            createWineData({ name: 'Wine 3', wherePurchased: 'Total Wine' }), // duplicate
            createWineData({ name: 'Wine 4', wherePurchased: null }), // null should be excluded
          ],
        });

        const response = await request(app).get('/api/wines/meta/where-purchased');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body).toContain('Total Wine');
        expect(response.body).toContain('Wine.com');
      });

      it('returns values sorted alphabetically', async () => {
        await prisma.wine.createMany({
          data: [
            createWineData({ name: 'Wine 1', wherePurchased: 'Costco' }),
            createWineData({ name: 'Wine 2', wherePurchased: 'Total Wine' }),
            createWineData({ name: 'Wine 3', wherePurchased: 'ABC Liquor' }),
          ],
        });

        const response = await request(app).get('/api/wines/meta/where-purchased');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(['ABC Liquor', 'Costco', 'Total Wine']);
      });
    });

    describe('GET /api/wines/meta/producers', () => {
      it('returns unique producer values sorted alphabetically', async () => {
        await prisma.wine.createMany({
          data: [
            createWineData({ name: 'Wine 1', producer: 'Chateau Margaux' }),
            createWineData({ name: 'Wine 2', producer: 'Opus One' }),
            createWineData({ name: 'Wine 3', producer: 'Chateau Margaux' }), // duplicate
          ],
        });

        const response = await request(app).get('/api/wines/meta/producers');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(['Chateau Margaux', 'Opus One']);
      });
    });

    describe('GET /api/wines/meta/countries', () => {
      it('returns unique country values sorted alphabetically', async () => {
        await prisma.wine.createMany({
          data: [
            createWineData({ name: 'Wine 1', country: 'France' }),
            createWineData({ name: 'Wine 2', country: 'Italy' }),
            createWineData({ name: 'Wine 3', country: 'USA' }),
            createWineData({ name: 'Wine 4', country: 'France' }), // duplicate
          ],
        });

        const response = await request(app).get('/api/wines/meta/countries');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(['France', 'Italy', 'USA']);
      });
    });

    describe('GET /api/wines/meta/regions', () => {
      it('returns unique region values excluding nulls', async () => {
        await prisma.wine.createMany({
          data: [
            createWineData({ name: 'Wine 1', region: 'Bordeaux' }),
            createWineData({ name: 'Wine 2', region: 'Napa Valley' }),
            createWineData({ name: 'Wine 3', region: null }), // null should be excluded
          ],
        });

        const response = await request(app).get('/api/wines/meta/regions');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body).toContain('Bordeaux');
        expect(response.body).toContain('Napa Valley');
      });
    });

    describe('GET /api/wines/meta/grape-varieties', () => {
      it('returns unique grape variety values excluding nulls', async () => {
        await prisma.wine.createMany({
          data: [
            createWineData({ name: 'Wine 1', grapeVariety: 'Cabernet Sauvignon' }),
            createWineData({ name: 'Wine 2', grapeVariety: 'Pinot Noir' }),
            createWineData({ name: 'Wine 3', grapeVariety: 'Cabernet Sauvignon' }), // duplicate
            createWineData({ name: 'Wine 4', grapeVariety: null }), // null should be excluded
          ],
        });

        const response = await request(app).get('/api/wines/meta/grape-varieties');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(['Cabernet Sauvignon', 'Pinot Noir']);
      });
    });
  });
});
