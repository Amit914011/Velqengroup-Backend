import { Request, Response } from 'express';
import { sendPbError } from '../../views/error.view.js';
import { verifyDocument, recordAiMessage } from '../../services/ai/ai.service.js';

export async function documentVerifyAction(req: Request, res: Response): Promise<void> {
  try {
    const auth = (req as any).auth;
    const userId = auth?._id || auth?.id || '';
    const result = await verifyDocument(req.body || {}, userId);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function integratedAiStreamAction(req: Request, res: Response): Promise<void> {
  const { message } = req.body || {};
  if (!message) return sendPbError(res, 400, 'message is required.');

  try {
    const auth = (req as any).auth;
    const userId = auth?._id || auth?.id || '';
    await recordAiMessage(userId, 'user', { message });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const sampleChunks = [
      'Hello! ',
      'I am Velqen AI Assistant (simulated demo mode). ',
      'How may I help you with your inquiry or application today?',
    ];

    for (const chunk of sampleChunks) {
      res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    sendPbError(res, 500, err.message);
  }
}

