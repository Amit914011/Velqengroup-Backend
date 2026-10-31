import mongoose, { Schema, Model } from 'mongoose';

export interface ILogisticsDrayageRequests {
  _id: string;
  owner?: string | null;
  ownerName?: string;
  portRailRamp?: string;
  containerNumber?: string;
  containerSize?: string;
  pickup?: string;
  delivery?: string;
  availableDate?: string;
  lastFreeDay?: string;
  appointment?: string;
  chassisRequired?: boolean;
  overweight?: boolean;
  hazmat?: boolean;
  emptyReturnLocation?: string;
  specialInstructions?: string;
  status?: string;
  assignedTo?: string | null;
  created?: Date;
  updated?: Date;
}

export const LogisticsDrayageRequestsSchema = new Schema<ILogisticsDrayageRequests>(
  {
  _id: { type: String, required: true },
  owner: { type: String, ref: 'logistics_users', default: null, index: true },
  ownerName: { type: String, default: '' },
  portRailRamp: { type: String, default: '' },
  containerNumber: { type: String, default: '' },
  containerSize: { type: String, default: '' },
  pickup: { type: String, default: '' },
  delivery: { type: String, default: '' },
  availableDate: { type: String, default: '' },
  lastFreeDay: { type: String, default: '' },
  appointment: { type: String, default: '' },
  chassisRequired: { type: Boolean, default: false },
  overweight: { type: Boolean, default: false },
  hazmat: { type: Boolean, default: false },
  emptyReturnLocation: { type: String, default: '' },
  specialInstructions: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  assignedTo: { type: String, ref: 'users', default: null },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'logistics_drayage_requests',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LogisticsDrayageRequestsModel = (mongoose.models['logistics_drayage_requests'] as Model<ILogisticsDrayageRequests>) ||
  mongoose.model<ILogisticsDrayageRequests>('logistics_drayage_requests', LogisticsDrayageRequestsSchema, 'logistics_drayage_requests');

export default LogisticsDrayageRequestsModel;
