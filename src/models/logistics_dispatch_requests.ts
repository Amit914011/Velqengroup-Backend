import mongoose, { Schema, Model } from 'mongoose';

export interface ILogisticsDispatchRequests {
  _id: string;
  owner?: string | null;
  ownerName?: string;
  companyName?: string;
  equipmentType?: string;
  truckCount?: number;
  preferredLanes?: string;
  homeLocation?: string;
  operatingRadius?: string;
  availability?: string;
  mcNumber?: string;
  usdotNumber?: string;
  specialRequirements?: string;
  status?: string;
  assignedTo?: string | null;
  created?: Date;
  updated?: Date;
}

export const LogisticsDispatchRequestsSchema = new Schema<ILogisticsDispatchRequests>(
  {
  _id: { type: String, required: true },
  owner: { type: String, ref: 'logistics_users', default: null, index: true },
  ownerName: { type: String, default: '' },
  companyName: { type: String, default: '' },
  equipmentType: { type: String, default: '' },
  truckCount: { type: Number, default: 0 },
  preferredLanes: { type: String, default: '' },
  homeLocation: { type: String, default: '' },
  operatingRadius: { type: String, default: '' },
  availability: { type: String, default: '' },
  mcNumber: { type: String, default: '' },
  usdotNumber: { type: String, default: '' },
  specialRequirements: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  assignedTo: { type: String, ref: 'users', default: null },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'logistics_dispatch_requests',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LogisticsDispatchRequestsModel = (mongoose.models['logistics_dispatch_requests'] as Model<ILogisticsDispatchRequests>) ||
  mongoose.model<ILogisticsDispatchRequests>('logistics_dispatch_requests', LogisticsDispatchRequestsSchema, 'logistics_dispatch_requests');

export default LogisticsDispatchRequestsModel;
