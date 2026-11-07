import { Request, Response } from 'express';
import { sendPbError } from '../../views/error.view.js';
import { processSheetsWebhook } from '../../services/recruitment/sheetsSync.service.js';

export async function receiveWebhookAction(req: Request, res: Response): Promise<void> {
  try {
    const result = await processSheetsWebhook(req.body || {});
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export function webhookHealthAction(_req: Request, res: Response): void {
  res.json({ ok: true, service: 'sheets-webhook' });
}

