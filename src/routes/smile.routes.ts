import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import {
  submitSmileInquiryAction,
  logSmileDonorAction,
  submitHelpRequestAction,
  registerVolunteerAction,
  reviewVolunteerAction,
} from '../controllers/public/smile.controller.js';

const router = Router();

router.post('/smile/inquiry', submitSmileInquiryAction);
router.post('/smile/donor', logSmileDonorAction);
router.post('/smile/help-request', submitHelpRequestAction);
router.post('/smile/volunteer-register', registerVolunteerAction);
router.post('/smile/volunteer/:id/review', requireAuth, reviewVolunteerAction);

export default router;

