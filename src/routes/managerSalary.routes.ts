import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import {
  createSalaryRequestAction,
  getManagerSalaryRequests,
  getTeamSalarySlips,
  getAdminSalaryRequests,
  approveSalaryRequestAction,
  rejectSalaryRequestAction,
  requestChangesAction,
  getSlipRequests,
  reviewSlipRequest,
} from '../controllers/finance/managerSalary.controller.js';

const router = Router();

router.post('/manager/salary-request', requireAuth, createSalaryRequestAction);
router.get('/manager/salary-requests', requireAuth, getManagerSalaryRequests);
router.get('/manager/team-salary-slips', requireAuth, getTeamSalarySlips);
router.get('/admin/salary-requests', requireAuth, getAdminSalaryRequests);
router.post('/admin/salary-request/approve', requireAuth, approveSalaryRequestAction);
router.post('/admin/salary-request/reject', requireAuth, rejectSalaryRequestAction);
router.post('/admin/salary-request/request-changes', requireAuth, requestChangesAction);
router.get('/manager/slip-requests', requireAuth, getSlipRequests);
router.post('/manager/slip-requests/:id/review', requireAuth, reviewSlipRequest);

export default router;

