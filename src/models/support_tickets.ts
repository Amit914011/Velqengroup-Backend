import mongoose, { Schema, Model } from 'mongoose';

export interface ISupportTickets {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  category?: string;
  subject?: string;
  description?: string;
  priority?: string;
  status?: string;
  adminNote?: string;
  resolvedAt?: string;
  adminViewed?: boolean;
  history?: Record<string, any> | any[] | any;
  createdByName?: string;
  updatedByName?: string;
  created?: Date;
  updated?: Date;
}

export const SupportTicketsSchema = new Schema<ISupportTickets>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  category: { type: String, default: '' },
  subject: { type: String, default: '' },
  description: { type: String, default: '' },
  priority: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  adminNote: { type: String, default: '' },
  resolvedAt: { type: String, default: '' },
  adminViewed: { type: Boolean, default: false },
  history: { type: Schema.Types.Mixed, default: {} },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'support_tickets',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const SupportTicketsModel = (mongoose.models['support_tickets'] as Model<ISupportTickets>) ||
  mongoose.model<ISupportTickets>('support_tickets', SupportTicketsSchema, 'support_tickets');

export default SupportTicketsModel;
