import { Request, Response } from 'express';
import { trackView, trackClick } from '../../services/public/webUpdates.service.js';

export async function trackViewAction(req: Request, res: Response): Promise<void> {
  await trackView(req.params.id);
  res.json({ ok: true });
}

export async function trackClickAction(req: Request, res: Response): Promise<void> {
  await trackClick(req.params.id);
  res.json({ ok: true });
}

