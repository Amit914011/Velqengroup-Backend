import { Router } from 'express';
import { checkIntegrationAllowed } from '../utils/integrationGate.js';
import {
  getStatusAction,
  createOrderAction,
  captureOrderAction,
  getOrderAction,
  webhookAction,
} from '../controllers/payments/cardPay.controller.js';

const router = Router();

router.get('/card-pay/status', getStatusAction);

router.use('/card-pay', (req, res, next) => {
  if (req.method === 'GET') return next();
  const check = checkIntegrationAllowed('PayPal');
  if (!check.allowed) {
    return res.status(check.errorResponse?.code || 503).json(check.errorResponse);
  }
  next();
});

router.post('/card-pay/create-order', createOrderAction);
router.post('/card-pay/capture/:orderId', captureOrderAction);
router.get('/card-pay/order/:orderId', getOrderAction);
router.post('/card-pay/webhook', webhookAction);

export default router;

