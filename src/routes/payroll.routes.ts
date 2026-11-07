import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import { calculateSalaryAction } from '../controllers/finance/payroll.controller.js';

const router = Router();

router.post('/finance/calculate-salary', requireAuth, calculateSalaryAction);

export default router;

