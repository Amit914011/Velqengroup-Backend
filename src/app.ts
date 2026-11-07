import express, { Express } from 'express';
import cors from 'cors';
import { authContextMiddleware } from './middlewares/authContext.middleware.js';
import { securityMiddleware } from './middlewares/security.middleware.js';
import { globalRateLimiter } from './middlewares/rateLimit.middleware.js';
import { apiRouter } from './routes/index.js';
import { healthCheck } from './controllers/health.controller.js';
import { CORS_ORIGINS, TRUST_PROXY } from './config/environment.js';
import { registerAllHrHooks } from './services/hr/registerHrHooks.js';
import { registerFinanceHooks } from './services/finance/registerFinanceHooks.js';

export function createApp(): Express {
  const app = express();

  if (TRUST_PROXY === 'true') {
    app.set('trust proxy', true);
  } else if (TRUST_PROXY !== 'false') {
    app.set('trust proxy', TRUST_PROXY);
  }

  app.disable('x-powered-by');

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      if (!origin || !CORS_ORIGINS) return callback(null, true);
      const allowed = CORS_ORIGINS.split(',').map((s) => s.trim().toLowerCase());
      if (allowed.includes(origin.toLowerCase())) {
        return callback(null, true);
      }
      callback(new Error('CORS request rejected by origin policy.'));
    },
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(globalRateLimiter);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use(authContextMiddleware);
  app.use(securityMiddleware);

  registerAllHrHooks();
  registerFinanceHooks();

  app.get('/health', healthCheck);
  app.use('/api', apiRouter);

  return app;
}
