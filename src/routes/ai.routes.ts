import { Router } from 'express';
import { checkIntegrationAllowed } from '../utils/integrationGate.js';
import { documentVerifyAction, integratedAiStreamAction } from '../controllers/ai/ai.controller.js';

const router = Router();

router.post('/document-verify', (_req, res, next) => {
  const check = checkIntegrationAllowed('OCR');
  if (!check.allowed) {
    return res.status(check.errorResponse?.code || 503).json(check.errorResponse);
  }
  next();
}, documentVerifyAction);

router.post('/integrated-ai/stream', (_req, res, next) => {
  const check = checkIntegrationAllowed('AI');
  if (!check.allowed) {
    return res.status(check.errorResponse?.code || 503).json(check.errorResponse);
  }
  next();
}, integratedAiStreamAction);

export default router;
