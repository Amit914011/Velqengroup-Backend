import mongoose, { Schema, Model } from 'mongoose';

export interface IWhatsappWebhookEvents {
  _id: string;
  providerEventId?: string;
  eventType?: string;
  messageId?: string;
  conversationId?: string | null;
  status?: string;
  rawPayload?: Record<string, any> | any[] | any;
  timestamp?: Date | null;
  processedAt?: Date | null;
  created?: Date;
  updated?: Date;
}

export const WhatsappWebhookEventsSchema = new Schema<IWhatsappWebhookEvents>(
  {
  _id: { type: String, required: true },
  providerEventId: { type: String, default: '' , index: true},
  eventType: { type: String, default: '' },
  messageId: { type: String, default: '' , index: true},
  conversationId: { type: String, ref: 'whatsapp_conversations', default: null },
  status: { type: String, default: '' },
  rawPayload: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: null },
  processedAt: { type: Date, default: null },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'whatsapp_webhook_events',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const WhatsappWebhookEventsModel = (mongoose.models['whatsapp_webhook_events'] as Model<IWhatsappWebhookEvents>) ||
  mongoose.model<IWhatsappWebhookEvents>('whatsapp_webhook_events', WhatsappWebhookEventsSchema, 'whatsapp_webhook_events');

export default WhatsappWebhookEventsModel;
