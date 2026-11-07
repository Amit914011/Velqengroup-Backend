import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import {
  getTodayAttendance,
  recordManagerLocation,
  getManagerLocations,
  getLateApologies,
  reviewLateApology,
} from '../controllers/hr/attendance.controller.js';

const router = Router();

router.get('/attendance/today', requireAuth, getTodayAttendance);
router.post('/manager-log/location', requireAuth, recordManagerLocation);
router.get('/manager-log/locations', requireAuth, getManagerLocations);
router.get('/manager/late-apologies', requireAuth, getLateApologies);
router.post('/manager/review-apology', requireAuth, reviewLateApology);

export default router;

