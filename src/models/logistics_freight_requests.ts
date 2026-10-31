import mongoose, { Schema, Model } from 'mongoose';

export interface ILogisticsFreightRequests {
  _id: string;
  owner?: string | null;
  ownerName?: string;
  requestType?: string;
  companyName?: string;
  origin?: string;
  destination?: string;
  pickup?: string;
  delivery?: string;
  commodity?: string;
  weight?: string;
  equipment?: string;
  loadType?: string;
  mcNumber?: string;
  usdotNumber?: string;
  specialRequirements?: string;
  status?: string;
  assignedTo?: string | null;
  created?: Date;
  updated?: Date;
}

export const LogisticsFreightRequestsSchema = new Schema<ILogisticsFreightRequests>(
  {
  _id: { type: String, required: true },
  owner: { type: String, ref: 'logistics_users', default: null, index: true },
  ownerName: { type: String, default: '' },
  requestType: { type: String, default: '' },
  companyName: { type: String, default: '' },
  origin: { type: String, default: '' },
  destination: { type: String, default: '' },
  pickup: { type: String, default: '' },
  delivery: { type: String, default: '' },
  commodity: { type: String, default: '' },
  weight: { type: String, default: '' },
  equipment: { type: String, default: '' },
  loadType: { type: String, default: '' },
  mcNumber: { type: String, default: '' },
  usdotNumber: { type: String, default: '' },
  specialRequirements: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  assignedTo: { type: String, ref: 'users', default: null },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'logistics_freight_requests',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LogisticsFreightRequestsModel = (mongoose.models['logistics_freight_requests'] as Model<ILogisticsFreightRequests>) ||
  mongoose.model<ILogisticsFreightRequests>('logistics_freight_requests', LogisticsFreightRequestsSchema, 'logistics_freight_requests');

export default LogisticsFreightRequestsModel;
