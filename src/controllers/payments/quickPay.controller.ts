import { Request, Response } from 'express';
import { sendPbError } from '../../views/error.view.js';
import { getQuickPayStatus, submitPaymentReference } from '../../services/payments/quickPay.service.js';

export function getStatusAction(_req: Request, res: Response): void {
  res.json(getQuickPayStatus());
}

export async function submitReferenceAction(req: Request, res: Response): Promise<void> {
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '';
  const userAgent = req.headers['user-agent'] || '';
  try {
    const result = await submitPaymentReference(req.body || {}, ip, userAgent);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

