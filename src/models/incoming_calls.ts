import mongoose, { Schema, Model } from 'mongoose';

export interface IIncomingCalls {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  callerName?: string;
  callerPhone?: string;
  status?: string;
  notes?: string;
  duration?: number;
  createdByName?: string;
  updatedByName?: string;
  created?: Date;
  updated?: Date;
}

export const IncomingCallsSchema = new Schema<IIncomingCalls>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  callerName: { type: String, default: '' },
  callerPhone: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  notes: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'incoming_calls',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const IncomingCallsModel = (mongoose.models['incoming_calls'] as Model<IIncomingCalls>) ||
  mongoose.model<IIncomingCalls>('incoming_calls', IncomingCallsSchema, 'incoming_calls');

export default IncomingCallsModel;
