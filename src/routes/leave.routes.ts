import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import { approveLeaveAction, bulkLeaveAction } from '../controllers/hr/leave.controller.js';

const router = Router();

router.post('/manager/approve-leave', requireAuth, approveLeaveAction);
router.post('/manager/bulk-leave', requireAuth, bulkLeaveAction);

export default router;

