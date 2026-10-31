import mongoose, { Schema, Model } from 'mongoose';

export interface IWaCrmMessages {
  _id: string;
  conversationId?: string | null;
  providerMessageId?: string;
  direction?: string;
  senderWaId?: string;
  recipientWaId?: string;
  type?: string;
  body?: string;
  mediaId?: string;
  mediaUrl?: string;
  mediaMimeType?: string;
  mediaCaption?: string;
  templateName?: string;
  templateLanguage?: string;
  status?: string;
  errorMessage?: string;
  employeeId?: string | null;
  employeeName?: string;
  timestamp?: Date | null;
  created?: Date;
  updated?: Date;
}

export const WaCrmMessagesSchema = new Schema<IWaCrmMessages>(
  {
  _id: { type: String, required: true },
  conversationId: { type: String, ref: 'whatsapp_conversations', default: null , index: true},
  providerMessageId: { type: String, default: '' , index: true},
  direction: { type: String, default: '' },
  senderWaId: { type: String, default: '' },
  recipientWaId: { type: String, default: '' },
  type: { type: String, default: '' },
  body: { type: String, default: '' },
  mediaId: { type: String, default: '' },
  mediaUrl: { type: String, default: '' },
  mediaMimeType: { type: String, default: '' },
  mediaCaption: { type: String, default: '' },
  templateName: { type: String, default: '' },
  templateLanguage: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  errorMessage: { type: String, default: '' },
  employeeId: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  timestamp: { type: Date, default: null },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'wa_crm_messages',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const WaCrmMessagesModel = (mongoose.models['wa_crm_messages'] as Model<IWaCrmMessages>) ||
  mongoose.model<IWaCrmMessages>('wa_crm_messages', WaCrmMessagesSchema, 'wa_crm_messages');

export default WaCrmMessagesModel;
