import { Request, Response } from 'express';
import { sendPbError } from '../../views/error.view.js';
import {
  getCardPayStatus,
  createCardOrder,
  captureCardOrder,
  getCardOrder,
  handleCardWebhook,
} from '../../services/payments/paypal.service.js';

export function getStatusAction(_req: Request, res: Response): void {
  res.json(getCardPayStatus());
}

export async function createOrderAction(req: Request, res: Response): Promise<void> {
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '';
  const userAgent = req.headers['user-agent'] || '';
  try {
    const result = await createCardOrder(req.body || {}, ip, userAgent);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function captureOrderAction(req: Request, res: Response): Promise<void> {
  const { orderId } = req.params;
  try {
    const result = await captureCardOrder(orderId, req.body || {});
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function getOrderAction(req: Request, res: Response): Promise<void> {
  const { orderId } = req.params;
  try {
    const result = await getCardOrder(orderId);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 404, err.message);
  }
}

export async function webhookAction(req: Request, res: Response): Promise<void> {
  try {
    const result = await handleCardWebhook(req.headers, req.body || {});
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

