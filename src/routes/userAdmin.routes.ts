import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import { setPassword, generateResetLink, requestPasswordReset } from '../controllers/hr/userAdmin.controller.js';

const router = Router();

router.post('/admin/set-password', requireAuth, setPassword);
router.post('/admin/reset-link', requireAuth, generateResetLink);
router.post('/request-reset', requestPasswordReset);

export default router;

