import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import {
  punchReceipt,
  getMyReceipts,
  approveReceipt,
} from '../controllers/finance/receipt.controller.js';

const router = Router();

router.post('/manager/punch-receipt', requireAuth, punchReceipt);
router.get('/manager/my-receipts', requireAuth, getMyReceipts);
router.post('/manager/approve-receipt', requireAuth, approveReceipt);

export default router;

