import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import {
  approveBreak,
  warnBreak,
  endBreak,
  unlockMiscBreakLogin,
} from '../controllers/hr/breaks.controller.js';

const router = Router();

router.post('/manager/approve-break', requireAuth, approveBreak);
router.post('/manager/warn-break', requireAuth, warnBreak);
router.post('/manager/end-break', requireAuth, endBreak);
router.post('/manager/unlock-misc-break-login', requireAuth, unlockMiscBreakLogin);

export default router;

