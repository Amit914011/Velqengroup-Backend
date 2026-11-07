import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import { getManagerData } from '../controllers/hr/managerData.controller.js';

const router = Router();

router.get('/manager/data', requireAuth, getManagerData);

export default router;

