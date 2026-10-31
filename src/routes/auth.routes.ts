import { Router } from 'express';
import {
  authWithPassword,
  authRefresh,
  requestPasswordReset,
  confirmPasswordReset,
} from '../controllers/auth.controller.js';
import { authRateLimiter } from '../middlewares/rateLimit.middleware.js';

export const authRouter = Router({ mergeParams: true });

authRouter.post('/auth-with-password', authRateLimiter, authWithPassword);
authRouter.post('/auth-refresh', authRefresh);
authRouter.post('/request-password-reset', authRateLimiter, requestPasswordReset);
authRouter.post('/confirm-password-reset', authRateLimiter, confirmPasswordReset);

