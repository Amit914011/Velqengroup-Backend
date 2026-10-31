import mongoose, { Schema, Model } from 'mongoose';

export interface ILogisticsLoads {
  _id: string;
  owner?: string | null;
  ownerName?: string;
  referenceNumber?: string;
  pickupLocation?: string;
  pickupDate?: string;
  pickupTime?: string;
  deliveryLocation?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  equipment?: string;
  loadType?: string;
  weight?: string;
  commodity?: string;
  miles?: number;
  stops?: number;
  rateType?: string;
  rate?: string;
  contactPerson?: string;
  contactMethod?: string;
  specialInstructions?: string;
  pickupNumber?: string;
  deliveryNumber?: string;
  status?: string;
  assignedTo?: string | null;
  created?: Date;
  updated?: Date;
}

export const LogisticsLoadsSchema = new Schema<ILogisticsLoads>(
  {
  _id: { type: String, required: true },
  owner: { type: String, ref: 'logistics_users', default: null, index: true },
  ownerName: { type: String, default: '' },
  referenceNumber: { type: String, default: '' },
  pickupLocation: { type: String, default: '' },
  pickupDate: { type: String, default: '' },
  pickupTime: { type: String, default: '' },
  deliveryLocation: { type: String, default: '' },
  deliveryDate: { type: String, default: '' },
  deliveryTime: { type: String, default: '' },
  equipment: { type: String, default: '' },
  loadType: { type: String, default: '' },
  weight: { type: String, default: '' },
  commodity: { type: String, default: '' },
  miles: { type: Number, default: 0 },
  stops: { type: Number, default: 0 },
  rateType: { type: String, default: '' },
  rate: { type: String, default: '' },
  contactPerson: { type: String, default: '' },
  contactMethod: { type: String, default: '' },
  specialInstructions: { type: String, default: '' },
  pickupNumber: { type: String, default: '' },
  deliveryNumber: { type: String, default: '' },
  status: { type: String, default: '', index: true },
  assignedTo: { type: String, ref: 'users', default: null },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'logistics_loads',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LogisticsLoadsModel = (mongoose.models['logistics_loads'] as Model<ILogisticsLoads>) ||
  mongoose.model<ILogisticsLoads>('logistics_loads', LogisticsLoadsSchema, 'logistics_loads');

export default LogisticsLoadsModel;
