import { Router } from 'express';
import { getStatusAction, submitReferenceAction } from '../controllers/payments/quickPay.controller.js';

const router = Router();

router.get('/quick-pay/status', getStatusAction);
router.post('/quick-pay/reference', submitReferenceAction);

export default router;

