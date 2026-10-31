import mongoose, { Schema, Model } from 'mongoose';

export interface IPhoneOtps {
  _id: string;
  phone?: string;
  code?: string;
  token?: string;
  expiresAt?: number;
  attempts?: number;
  verified?: boolean;
  consumed?: boolean;
  ip?: string;
  created?: Date;
  updated?: Date;
}

export const PhoneOtpsSchema = new Schema<IPhoneOtps>(
  {
  _id: { type: String, required: true },
  phone: { type: String, default: '' , index: true},
  code: { type: String, default: '' },
  token: { type: String, default: '' },
  expiresAt: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  consumed: { type: Boolean, default: false },
  ip: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'phone_otps',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const PhoneOtpsModel = (mongoose.models['phone_otps'] as Model<IPhoneOtps>) ||
  mongoose.model<IPhoneOtps>('phone_otps', PhoneOtpsSchema, 'phone_otps');

export default PhoneOtpsModel;
