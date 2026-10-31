import mongoose, { Schema, Model } from 'mongoose';

export interface IClientStatusHistory {
  _id: string;
  client?: string | null;
  clientName?: string;
  clientCode?: string;
  previousStatus?: string;
  newStatus?: string;
  changedBy?: string | null;
  changedByName?: string;
  remarks?: string;
  changedByRole?: string;
  signature?: string;
  created?: Date;
  updated?: Date;
}

export const ClientStatusHistorySchema = new Schema<IClientStatusHistory>(
  {
  _id: { type: String, required: true },
  client: { type: String, ref: 'leads', default: null , index: true},
  clientName: { type: String, default: '' },
  clientCode: { type: String, default: '' },
  previousStatus: { type: String, default: '' },
  newStatus: { type: String, default: '' },
  changedBy: { type: String, ref: 'users', default: null , index: true},
  changedByName: { type: String, default: '' },
  remarks: { type: String, default: '' },
  changedByRole: { type: String, default: '' },
  signature: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'client_status_history',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const ClientStatusHistoryModel = (mongoose.models['client_status_history'] as Model<IClientStatusHistory>) ||
  mongoose.model<IClientStatusHistory>('client_status_history', ClientStatusHistorySchema, 'client_status_history');

export default ClientStatusHistoryModel;
