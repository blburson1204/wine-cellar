import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from '@wine-cellar/database';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all wines
app.get('/api/wines', async (req, res) => {
  try {
    const wines = await prisma.wine.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(wines);
  } catch (error) {
    console.error('Error fetching wines:', error);
    res.status(500).json({ error: 'Failed to fetch wines' });
  }
});

// Get a single wine
app.get('/api/wines/:id', async (req, res) => {
  try {
    const wine = await prisma.wine.findUnique({
      where: { id: req.params.id }
    });
    if (!wine) {
      return res.status(404).json({ error: 'Wine not found' });
    }
    res.json(wine);
  } catch (error) {
    console.error('Error fetching wine:', error);
    res.status(500).json({ error: 'Failed to fetch wine' });
  }
});

// Create a new wine
app.post('/api/wines', async (req, res) => {
  try {
    const wine = await prisma.wine.create({
      data: req.body
    });
    res.status(201).json(wine);
  } catch (error) {
    console.error('Error creating wine:', error);
    res.status(500).json({ error: 'Failed to create wine' });
  }
});

// Update a wine
app.put('/api/wines/:id', async (req, res) => {
  try {
    const wine = await prisma.wine.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(wine);
  } catch (error) {
    console.error('Error updating wine:', error);
    res.status(500).json({ error: 'Failed to update wine' });
  }
});

// Delete a wine
app.delete('/api/wines/:id', async (req, res) => {
  try {
    await prisma.wine.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting wine:', error);
    res.status(500).json({ error: 'Failed to delete wine' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
