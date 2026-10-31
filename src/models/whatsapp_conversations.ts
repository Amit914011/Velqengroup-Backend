import mongoose, { Schema, Model } from 'mongoose';

export interface IWhatsappConversations {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  clientId?: string | null;
  clientName?: string;
  waId?: string;
  phoneNumber?: string;
  whatsappAccountId?: string | null;
  status?: string;
  lastMessageAt?: Date | null;
  lastMessagePreview?: string;
  lastMessageDirection?: string;
  unreadCount?: number;
  created?: Date;
  updated?: Date;
}

export const WhatsappConversationsSchema = new Schema<IWhatsappConversations>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  clientId: { type: String, ref: 'leads', default: null },
  clientName: { type: String, default: '' },
  waId: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  whatsappAccountId: { type: String, ref: 'whatsapp_accounts', default: null },
  status: { type: String, default: '' , index: true},
  lastMessageAt: { type: Date, default: null },
  lastMessagePreview: { type: String, default: '' },
  lastMessageDirection: { type: String, default: '' },
  unreadCount: { type: Number, default: 0 },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'whatsapp_conversations',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

WhatsappConversationsSchema.index({"employee":1,"waId":1});

export const WhatsappConversationsModel = (mongoose.models['whatsapp_conversations'] as Model<IWhatsappConversations>) ||
  mongoose.model<IWhatsappConversations>('whatsapp_conversations', WhatsappConversationsSchema, 'whatsapp_conversations');

export default WhatsappConversationsModel;
