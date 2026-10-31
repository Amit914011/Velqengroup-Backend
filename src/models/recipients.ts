import mongoose, { Schema, Model } from 'mongoose';

export interface IRecipients {
  _id: string;
  name?: string;
  type?: string;
  phone?: string;
  email?: string;
  address?: string;
  bankDetails?: string;
  notes?: string;
  deleted?: boolean;
  deletedAt?: string;
  deletedByName?: string;
  employeeId?: string | null;
  employeeCode?: string;
  created?: Date;
  updated?: Date;
}

export const RecipientsSchema = new Schema<IRecipients>(
  {
  _id: { type: String, required: true },
  name: { type: String, default: '' },
  type: { type: String, default: '' , index: true},
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  bankDetails: { type: String, default: '' },
  notes: { type: String, default: '' },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: String, default: '' },
  deletedByName: { type: String, default: '' },
  employeeId: { type: String, ref: 'users', default: null },
  employeeCode: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'recipients',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const RecipientsModel = (mongoose.models['recipients'] as Model<IRecipients>) ||
  mongoose.model<IRecipients>('recipients', RecipientsSchema, 'recipients');

export default RecipientsModel;
