import { Request, Response } from 'express';
import {
  generateRealtimeClientId,
  registerClient,
  unregisterClient,
  updateClientSubscriptions,
} from '../utils/realtimeHub.js';
import { sendPbError } from '../views/error.view.js';

// GET /api/realtime - Establish Server-Sent Events connection
export function connectRealtime(req: Request, res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  const clientId = generateRealtimeClientId();
  const auth = (req as any).auth || null;
  registerClient(clientId, res, auth);

  res.write(`id:${clientId}\nevent:PB_CONNECT\ndata:{"clientId":"${clientId}"}\n\n`);

  req.on('close', () => {
    unregisterClient(clientId);
  });
}

// POST /api/realtime - Submit subscription list and update client session
export function updateSubscriptions(req: Request, res: Response): void {
  const { clientId, subscriptions } = req.body || {};
  if (!clientId || typeof clientId !== 'string') {
    sendPbError(res, 400, 'clientId is required.');
    return;
  }
  const subs = Array.isArray(subscriptions) ? subscriptions : [];
  const auth = (req as any).auth || undefined;
  const ok = updateClientSubscriptions(clientId, subs, auth);
  if (!ok) {
    sendPbError(res, 400, 'Invalid or expired realtime client connection.');
    return;
  }
  res.status(204).end();
}

