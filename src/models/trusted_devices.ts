import mongoose, { Schema, Model } from 'mongoose';

export interface ITrustedDevices {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  deviceId?: string;
  label?: string;
  browser?: string;
  os?: string;
  ip?: string;
  location?: string;
  lastUsedAt?: string;
  created?: Date;
  updated?: Date;
}

export const TrustedDevicesSchema = new Schema<ITrustedDevices>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  deviceId: { type: String, default: '' },
  label: { type: String, default: '' },
  browser: { type: String, default: '' },
  os: { type: String, default: '' },
  ip: { type: String, default: '' },
  location: { type: String, default: '' },
  lastUsedAt: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'trusted_devices',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

TrustedDevicesSchema.index({"employee":1,"deviceId":1});

export const TrustedDevicesModel = (mongoose.models['trusted_devices'] as Model<ITrustedDevices>) ||
  mongoose.model<ITrustedDevices>('trusted_devices', TrustedDevicesSchema, 'trusted_devices');

export default TrustedDevicesModel;
