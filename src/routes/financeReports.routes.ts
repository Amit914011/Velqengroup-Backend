import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import { getLedgerSummary } from '../controllers/finance/financeReports.controller.js';

const router = Router();

router.get('/finance/ledger-summary', requireAuth, getLedgerSummary);

export default router;

