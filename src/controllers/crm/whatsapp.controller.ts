import { Request, Response } from 'express';
import { sendPbError } from '../../views/error.view.js';
import {
  getWhatsappStatus,
  getWhatsappConversations,
  getConversationMessages,
  markConversationRead,
  reassignConversation,
  sendWhatsappMessage,
} from '../../services/crm/whatsapp.service.js';
import { WhatsappAccountsModel } from '../../models/whatsapp_accounts.js';
import { WhatsappTemplatesModel } from '../../models/whatsapp_templates.js';
import { generatePbId } from '../../utils/idGenerator.js';

export async function getStatusAction(_req: Request, res: Response): Promise<void> {
  try {
    const status = await getWhatsappStatus();
    res.json(status);
  } catch (err: any) {
    sendPbError(res, 500, err.message);
  }
}

export async function getConfigAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth || (auth.role !== 'admin' && !auth.isSuperuser)) {
    return sendPbError(res, 403, 'Admin access required.');
  }
  const accounts = await WhatsappAccountsModel.find().lean();
  res.json({ accounts });
}

export async function getConversationsAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  try {
    const conversations = await getWhatsappConversations(auth);
    res.json({ conversations });
  } catch (err: any) {
    sendPbError(res, 500, err.message);
  }
}

export async function getMessagesAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  try {
    const messages = await getConversationMessages(req.params.conversationId);
    res.json({ messages });
  } catch (err: any) {
    sendPbError(res, 500, err.message);
  }
}

export async function markReadAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const { conversationId } = req.body || {};
  if (!conversationId) return sendPbError(res, 400, 'conversationId is required.');
  try {
    const result = await markConversationRead(conversationId);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function assignAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const { conversationId, employeeId } = req.body || {};
  if (!conversationId || !employeeId) return sendPbError(res, 400, 'conversationId and employeeId required.');
  try {
    const result = await reassignConversation(auth, conversationId, employeeId);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function sendMessageAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const { conversationId, waId, body } = req.body || {};
  if (!body && !req.body?.templateName) return sendPbError(res, 422, 'Message body is required.');
  if (!conversationId && !waId) return sendPbError(res, 400, 'conversationId or waId is required.');

  try {
    const result = await sendWhatsappMessage(auth, req.body);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function getTemplatesAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const templates = await WhatsappTemplatesModel.find().lean();
  res.json({ templates });
}

export async function createAccountAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth || (auth.role !== 'admin' && !auth.isSuperuser)) {
    return sendPbError(res, 403, 'Admin access required.');
  }
  const body = req.body || {};
  const doc = new WhatsappAccountsModel({
    _id: generatePbId(),
    phoneNumberId: body.phoneNumberId || '',
    businessPhoneNumber: body.businessPhoneNumber || body.displayPhoneNumber || '',
    connectionStatus: 'active',
  });
  await doc.save();
  res.json({ success: true, account: doc });
}

export async function webhookVerificationAction(req: Request, res: Response): Promise<void> {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
}

export async function webhookEventHandlerAction(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ status: 'received' });
}
