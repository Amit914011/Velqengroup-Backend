import mongoose, { Schema, Model } from 'mongoose';

export interface ICallLogs {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  clientName?: string;
  clientPhone?: string;
  direction?: string;
  duration?: number;
  notes?: string;
  callTime?: Date | null;
  createdByName?: string;
  updatedByName?: string;
  created?: Date;
  updated?: Date;
}

export const CallLogsSchema = new Schema<ICallLogs>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null, index: true },
  employeeName: { type: String, default: '' },
  clientName: { type: String, default: '' },
  clientPhone: { type: String, default: '' },
  direction: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  callTime: { type: Date, default: null },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'call_logs',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const CallLogsModel = (mongoose.models['call_logs'] as Model<ICallLogs>) ||
  mongoose.model<ICallLogs>('call_logs', CallLogsSchema, 'call_logs');

export default CallLogsModel;
