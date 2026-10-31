import mongoose, { Schema, Model } from 'mongoose';

export interface IWhatsappHistory {
  _id: string;
  employee?: string | null;
  lead?: string | null;
  employeeName?: string;
  customerName?: string;
  customerNumber?: string;
  messageSent?: boolean;
  customerReplied?: string;
  documentsRequested?: boolean;
  voiceCallRequired?: boolean;
  interested?: boolean;
  converted?: boolean;
  notes?: string;
  nextFollowUpDate?: string;
  priority?: string;
  revisionOfId?: string;
  createdByName?: string;
  updatedByName?: string;
  created?: Date;
  updated?: Date;
}

export const WhatsappHistorySchema = new Schema<IWhatsappHistory>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  lead: { type: String, ref: 'leads', default: null },
  employeeName: { type: String, default: '' },
  customerName: { type: String, default: '' },
  customerNumber: { type: String, default: '' },
  messageSent: { type: Boolean, default: false },
  customerReplied: { type: String, default: '' },
  documentsRequested: { type: Boolean, default: false },
  voiceCallRequired: { type: Boolean, default: false },
  interested: { type: Boolean, default: false },
  converted: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  nextFollowUpDate: { type: String, default: '' },
  priority: { type: String, default: '' },
  revisionOfId: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'whatsapp_history',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const WhatsappHistoryModel = (mongoose.models['whatsapp_history'] as Model<IWhatsappHistory>) ||
  mongoose.model<IWhatsappHistory>('whatsapp_history', WhatsappHistorySchema, 'whatsapp_history');

export default WhatsappHistoryModel;
