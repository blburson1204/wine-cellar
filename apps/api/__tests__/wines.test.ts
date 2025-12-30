import 'dotenv/config';
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

// Clean up database before each test
beforeEach(async () => {
  await prisma.wine.deleteMany();
});

// Disconnect after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

describe('Wine API', () => {
  describe('GET /api/health', () => {
    it('returns healthy status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.database).toBe('connected');
    });
  });

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

    it('returns 404 when wine not found', async () => {
      const response = await request(app).get('/api/wines/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Wine');
      expect(response.body.error).toContain('not found');
      expect(response.body.errorCode).toBe('NOT_FOUND');
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

    it('returns error when wine not found', async () => {
      const response = await request(app).put('/api/wines/nonexistent-id').send({ quantity: 5 });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
      expect(response.body.errorCode).toBe('NOT_FOUND');
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

    it('returns error when wine not found', async () => {
      const response = await request(app).delete('/api/wines/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
      expect(response.body.errorCode).toBe('NOT_FOUND');
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
});
