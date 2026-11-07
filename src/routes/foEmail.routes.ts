import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import { checkIntegrationAllowed } from '../utils/integrationGate.js';
import {
  getEmailStatus,
  sendEmailAction,
  getInboxAction,
  getMessageAction,
  getAttachmentAction,
  markReadAction,
  reconcileAction,
} from '../controllers/crm/foEmail.controller.js';

const router = Router();

const checkGate = (_req: any, res: any, next: any) => {
  const check = checkIntegrationAllowed('fo_email');
  if (!check.allowed) {
    return res.status(check.errorResponse?.code || 503).json(check.errorResponse);
  }
  next();
};

router.use('/fo-email', checkGate);
router.use('/filling-officer/email', checkGate);

router.get('/fo-email/status', requireAuth, getEmailStatus);
router.post('/fo-email/send', requireAuth, sendEmailAction);
router.get('/fo-email/inbox', requireAuth, getInboxAction);
router.get('/fo-email/message/:uid', requireAuth, getMessageAction);
router.get('/fo-email/attachment/:uid/:idx', requireAuth, getAttachmentAction);
router.post('/fo-email/mark-read', requireAuth, markReadAction);
router.post('/fo-email/reconcile', requireAuth, reconcileAction);

// Filling Officer email aliases for web-next parity
router.get('/filling-officer/email/status', requireAuth, getEmailStatus);
router.post('/filling-officer/email/send', requireAuth, sendEmailAction);
router.get('/filling-officer/email/inbox', requireAuth, getInboxAction);
router.get('/filling-officer/email/message/:uid', requireAuth, getMessageAction);
router.get('/filling-officer/email/attachment/:uid/:idx', requireAuth, getAttachmentAction);
router.post('/filling-officer/email/mark-read', requireAuth, markReadAction);

export default router;
