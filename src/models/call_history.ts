import mongoose, { Schema, Model } from 'mongoose';

export interface ICallHistory {
  _id: string;
  employee?: string | null;
  lead?: string | null;
  employeeName?: string;
  customerName?: string;
  customerNumber?: string;
  callStatus?: string;
  durationSeconds?: number;
  notes?: string;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
  priority?: string;
  documentRequested?: boolean;
  appointmentFixed?: boolean;
  meetingDate?: string;
  meetingTime?: string;
  expectedClosingValue?: number;
  leadStage?: string;
  browserInfo?: string;
  osInfo?: string;
  ipAddress?: string;
  latitude?: number;
  longitude?: number;
  callDate?: string;
  callTime?: string;
  revisionOfId?: string;
  createdByName?: string;
  updatedByName?: string;
  created?: Date;
  updated?: Date;
}

export const CallHistorySchema = new Schema<ICallHistory>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  lead: { type: String, ref: 'leads', default: null },
  employeeName: { type: String, default: '' },
  customerName: { type: String, default: '' },
  customerNumber: { type: String, default: '' },
  callStatus: { type: String, default: '' },
  durationSeconds: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  nextFollowUpDate: { type: String, default: '' },
  nextFollowUpTime: { type: String, default: '' },
  priority: { type: String, default: '' },
  documentRequested: { type: Boolean, default: false },
  appointmentFixed: { type: Boolean, default: false },
  meetingDate: { type: String, default: '' },
  meetingTime: { type: String, default: '' },
  expectedClosingValue: { type: Number, default: 0 },
  leadStage: { type: String, default: '' },
  browserInfo: { type: String, default: '' },
  osInfo: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  callDate: { type: String, default: '' },
  callTime: { type: String, default: '' },
  revisionOfId: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'call_history',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const CallHistoryModel = (mongoose.models['call_history'] as Model<ICallHistory>) ||
  mongoose.model<ICallHistory>('call_history', CallHistorySchema, 'call_history');

export default CallHistoryModel;
