import mongoose, { Schema, Model } from 'mongoose';

export interface ILogisticsLoadResponses {
  _id: string;
  owner?: string | null;
  ownerName?: string;
  load?: string | null;
  message?: string;
  contactInfo?: string;
  responseType?: string;
  status?: string;
  created?: Date;
  updated?: Date;
}

export const LogisticsLoadResponsesSchema = new Schema<ILogisticsLoadResponses>(
  {
  _id: { type: String, required: true },
  owner: { type: String, ref: 'logistics_users', default: null , index: true},
  ownerName: { type: String, default: '' },
  load: { type: String, ref: 'logistics_loads', default: null , index: true},
  message: { type: String, default: '' },
  contactInfo: { type: String, default: '' },
  responseType: { type: String, default: '' },
  status: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'logistics_load_responses',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LogisticsLoadResponsesModel = (mongoose.models['logistics_load_responses'] as Model<ILogisticsLoadResponses>) ||
  mongoose.model<ILogisticsLoadResponses>('logistics_load_responses', LogisticsLoadResponsesSchema, 'logistics_load_responses');

export default LogisticsLoadResponsesModel;
