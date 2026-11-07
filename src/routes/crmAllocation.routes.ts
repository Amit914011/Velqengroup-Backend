import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import {
  getAllocatableLeadsAction,
  allocationRequestAction,
  bulkAllocateAction,
  getAdminAllocationRequestsAction,
  reviewAllocationRequestAction,
} from '../controllers/crm/crmAllocation.controller.js';

const router = Router();

router.get('/manager/allocatable-leads', requireAuth, getAllocatableLeadsAction);
router.post('/manager/allocation-request', requireAuth, allocationRequestAction);
router.post('/manager/bulk-allocate', requireAuth, bulkAllocateAction);
router.get('/admin/allocation-requests', requireAuth, getAdminAllocationRequestsAction);
router.post('/admin/allocation-request/review', requireAuth, reviewAllocationRequestAction);

export default router;

