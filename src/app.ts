import express, { Express } from 'express';
import cors from 'cors';
import { authContextMiddleware } from './middlewares/authContext.middleware.js';
import { securityMiddleware } from './middlewares/security.middleware.js';
import { apiRouter } from './routes/index.js';
import { healthCheck } from './controllers/health.controller.js';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  app.use(authContextMiddleware);
  app.use(securityMiddleware);

  app.get('/health', healthCheck);
  app.use('/api', apiRouter);

  return app;
}

