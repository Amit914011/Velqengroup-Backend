import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import { enrollLeadAction, editLeadAction } from '../controllers/crm/crmLeads.controller.js';

const router = Router();

router.post('/enroll-lead', requireAuth, enrollLeadAction);
router.post('/manager/edit-lead', requireAuth, editLeadAction);

export default router;

