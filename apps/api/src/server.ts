import { createApp } from './app';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3001;
const app = createApp();

app.listen(PORT, () => {
  logger.info(`API server running on http://localhost:${PORT}`, {
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'development',
  });
});
