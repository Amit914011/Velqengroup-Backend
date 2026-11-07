import { Router } from 'express';
import { checkIntegrationAllowed } from '../utils/integrationGate.js';
import {
  receiveWebhookAction,
  webhookHealthAction,
} from '../controllers/recruitment/sheetsWebhook.controller.js';

const router = Router();

router.get('/sheets/webhook', webhookHealthAction);

router.post('/sheets/webhook', (_req, res, next) => {
  const check = checkIntegrationAllowed('GoogleSheets');
  if (!check.allowed) {
    return res.status(check.errorResponse?.code || 503).json(check.errorResponse);
  }
  next();
}, receiveWebhookAction);

export default router;
