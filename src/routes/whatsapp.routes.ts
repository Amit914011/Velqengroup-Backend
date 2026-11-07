import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import { checkIntegrationAllowed } from '../utils/integrationGate.js';
import {
  getStatusAction,
  getConfigAction,
  getConversationsAction,
  getMessagesAction,
  markReadAction,
  assignAction,
  sendMessageAction,
  getTemplatesAction,
  createAccountAction,
  webhookVerificationAction,
  webhookEventHandlerAction,
} from '../controllers/crm/whatsapp.controller.js';

const router = Router();

router.use((_req, res, next) => {
  const check = checkIntegrationAllowed('whatsapp');
  if (!check.allowed) {
    return res.status(check.errorResponse?.code || 503).json(check.errorResponse);
  }
  next();
});

router.get('/whatsapp/status', requireAuth, getStatusAction);
router.get('/whatsapp/config', requireAuth, getConfigAction);
router.get('/whatsapp/conversations', requireAuth, getConversationsAction);
router.get('/whatsapp/messages/:conversationId', requireAuth, getMessagesAction);
router.post('/whatsapp/mark-read', requireAuth, markReadAction);
router.post('/whatsapp/assign', requireAuth, assignAction);
router.post('/whatsapp/send', requireAuth, sendMessageAction);
router.get('/whatsapp/templates', requireAuth, getTemplatesAction);
router.post('/whatsapp/accounts', requireAuth, createAccountAction);
router.get('/whatsapp/webhook', webhookVerificationAction);
router.post('/whatsapp/webhook', webhookEventHandlerAction);

export default router;
