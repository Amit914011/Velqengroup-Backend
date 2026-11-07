import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import { getExpenseOptions, punchExpense } from '../controllers/finance/expense.controller.js';

const router = Router();

router.get('/manager/expense-options', requireAuth, getExpenseOptions);
router.post('/manager/punch-expense', requireAuth, punchExpense);

export default router;

