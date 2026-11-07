import { Request, Response } from 'express';
import { sendPbError } from '../../views/error.view.js';
import { FoEmailsModel } from '../../models/fo_emails.js';

export async function getEmailStatus(_req: Request, res: Response): Promise<void> {
  res.json({
    configured: false,
    mailbox: 'voyages@velqengroup.com',
  });
}

export async function sendEmailAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  res.json({ success: true, status: 'queued' });
}

export async function getInboxAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const emails = await FoEmailsModel.find({ direction: 'inbound' }).sort({ date: -1 }).limit(100).lean();
  res.json({ emails });
}

export async function getMessageAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const email = await FoEmailsModel.findOne({ uid: req.params.uid }).lean();
  if (!email) return sendPbError(res, 404, 'Message not found.');
  res.json(email);
}

export async function getAttachmentAction(_req: Request, res: Response): Promise<void> {
  sendPbError(res, 404, 'Attachment not found.');
}

export async function markReadAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const { uid } = req.body || {};
  if (uid) await FoEmailsModel.updateOne({ uid }, { $set: { isRead: true } });
  res.json({ success: true });
}

export async function reconcileAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  res.json({ success: true, reconciled: 0 });
}
