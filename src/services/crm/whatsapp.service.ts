import { WhatsappAccountsModel } from '../../models/whatsapp_accounts.js';
import { WhatsappConversationsModel } from '../../models/whatsapp_conversations.js';
import { WaCrmMessagesModel } from '../../models/wa_crm_messages.js';
import { LeadsModel } from '../../models/leads.js';
import { UsersModel } from '../../models/users.js';
import { generatePbId } from '../../utils/idGenerator.js';

export function normalizeWaId(raw: string | null | undefined): string {
  if (!raw) return '';
  let p = String(raw).trim().replace(/[\s\-()]/g, '');
  if (/^\d{10}$/.test(p)) p = '91' + p;
  if (/^\+/.test(p)) p = p.slice(1);
  return p.replace(/\D/g, '');
}

export async function getWhatsappStatus() {
  const account = await WhatsappAccountsModel.findOne({ connectionStatus: 'active' }).lean();
  return {
    configured: !!account,
    callingEnabled: false,
    activePhone: account ? account.businessPhoneNumber : '',
  };
}

export async function getWhatsappConversations(auth: any) {
  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  let filter: any = {};

  if (!isAdmin) {
    if (auth.role === 'manager') {
      const team = await UsersModel.find({ role: 'employee', manager: auth._id || auth.id }, { _id: 1 }).lean();
      const teamIds = [auth._id || auth.id, ...team.map((u) => u._id)];
      filter = { employee: { $in: teamIds } };
    } else {
      filter = { employee: auth._id || auth.id };
    }
  }

  return WhatsappConversationsModel.find(filter).sort({ lastMessageAt: -1 }).limit(500).lean();
}

export async function getConversationMessages(conversationId: string) {
  return WaCrmMessagesModel.find({ conversation: conversationId }).sort({ timestamp: 1 }).limit(1000).lean();
}

export async function findOrCreateConversation(auth: any, waId: string, clientName = '') {
  const cleanWa = normalizeWaId(waId);
  if (!cleanWa) throw new Error('A valid client WhatsApp number is required.');

  let conv = await WhatsappConversationsModel.findOne({
    employee: auth._id || auth.id,
    waId: cleanWa,
  });

  if (!conv) {
    const lead = await LeadsModel.findOne({
      owner: auth._id || auth.id,
      phone: { $regex: cleanWa.slice(-10) },
      deleted: { $ne: true },
    }).lean();

    conv = new WhatsappConversationsModel({
      _id: generatePbId(),
      employee: auth._id || auth.id,
      employeeName: auth.name || auth.email || 'Agent',
      waId: cleanWa,
      clientName: clientName || (lead ? lead.name : cleanWa),
      lead: lead ? lead._id : null,
      unreadCount: 0,
      lastMessageAt: new Date(),
    });
    await conv.save();
  }

  return conv.toObject();
}

export async function markConversationRead(conversationId: string) {
  const conv = await WhatsappConversationsModel.findById(conversationId);
  if (!conv) throw new Error('Conversation not found.');
  conv.unreadCount = 0;
  conv.updated = new Date();
  await conv.save();
  await WaCrmMessagesModel.updateMany({ conversation: conversationId, direction: 'inbound', status: { $ne: 'read' } }, { $set: { status: 'read' } });
  return { success: true };
}

export async function reassignConversation(_auth: any, conversationId: string, newEmployeeId: string) {
  const emp = await UsersModel.findById(newEmployeeId).lean();
  if (!emp) throw new Error('Target employee not found.');

  const conv = await WhatsappConversationsModel.findById(conversationId);
  if (!conv) throw new Error('Conversation not found.');

  conv.employee = newEmployeeId;
  conv.employeeName = emp.name || emp.email || '';
  conv.updated = new Date();
  await conv.save();
  return { success: true, employeeName: conv.employeeName };
}

export async function sendWhatsappMessage(auth: any, data: any) {
  let conv: any = null;
  if (data.conversationId) {
    conv = await WhatsappConversationsModel.findById(data.conversationId);
  } else if (data.waId) {
    conv = await findOrCreateConversation(auth, data.waId, data.clientName || '');
  }
  if (!conv) throw new Error('Conversation not found.');

  const bodyText = String(data.body || data.text || '').trim();
  const msg = new WaCrmMessagesModel({
    _id: generatePbId(),
    conversation: conv._id,
    direction: 'outbound',
    body: bodyText,
    sender: auth._id || auth.id,
    senderName: auth.name || auth.email || 'Agent',
    status: 'sent',
    timestamp: new Date().toISOString(),
  });
  await msg.save();

  conv.lastMessage = bodyText || 'Template message';
  conv.lastMessageAt = new Date();
  await conv.save();

  return { success: true, message: msg };
}
