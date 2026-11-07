import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import {
  manualCandidateAction,
  bulkAllocateAction,
  diagnoseAction,
} from '../controllers/recruitment/recruitment.controller.js';

const router = Router();

router.post('/recruitment/manual-candidate', requireAuth, manualCandidateAction);
router.post('/recruitment/bulk-allocate', requireAuth, bulkAllocateAction);
router.get('/recruitment/diagnose', diagnoseAction);

export default router;

