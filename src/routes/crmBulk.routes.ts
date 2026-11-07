import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import {
  bulkStatusAction,
  bulkDeleteAction,
  bulkAssignAction,
  bulkNoteAction,
} from '../controllers/crm/crmBulk.controller.js';

const router = Router();

router.post('/admin/leads/bulk-status', requireAuth, bulkStatusAction);
router.post('/admin/leads/bulk-delete', requireAuth, bulkDeleteAction);
router.post('/admin/leads/bulk-assign', requireAuth, bulkAssignAction);
router.post('/admin/leads/bulk-note', requireAuth, bulkNoteAction);

export default router;

