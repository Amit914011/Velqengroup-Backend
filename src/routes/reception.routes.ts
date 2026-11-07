import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import {
  directUploadAction,
  getVisitorsAction,
  getVisitorDetailsAction,
  getFeedbackAction,
  addFeedbackAction,
  updateFeedbackAction,
  deleteFeedbackAction,
} from '../controllers/crm/reception.controller.js';

const router = Router();

router.post('/reception/direct-upload', requireAuth, directUploadAction);
router.get('/manager/visitors', requireAuth, getVisitorsAction);
router.get('/manager/visitors/:id', requireAuth, getVisitorDetailsAction);
router.get('/manager/visitors/:id/feedback', requireAuth, getFeedbackAction);
router.post('/manager/visitors/:id/feedback', requireAuth, addFeedbackAction);
router.put('/manager/visitor-feedback/:fid', requireAuth, updateFeedbackAction);
router.delete('/manager/visitor-feedback/:fid', requireAuth, deleteFeedbackAction);

export default router;

