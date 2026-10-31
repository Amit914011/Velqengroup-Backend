import mongoose, { Schema, Model } from 'mongoose';

export interface IApplicationStatusHistory {
  _id: string;
  client?: string | null;
  clientName?: string;
  clientCode?: string;
  applicationType?: string;
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

export const ApplicationStatusHistorySchema = new Schema<IApplicationStatusHistory>(
  {
  _id: { type: String, required: true },
  client: { type: String, ref: 'leads', default: null , index: true},
  clientName: { type: String, default: '' },
  clientCode: { type: String, default: '' },
  applicationType: { type: String, default: '' },
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
    collection: 'application_status_history',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const ApplicationStatusHistoryModel = (mongoose.models['application_status_history'] as Model<IApplicationStatusHistory>) ||
  mongoose.model<IApplicationStatusHistory>('application_status_history', ApplicationStatusHistorySchema, 'application_status_history');

export default ApplicationStatusHistoryModel;
