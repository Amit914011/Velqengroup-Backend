import mongoose, { Schema, Model } from 'mongoose';

export interface IEmailOtps {
  _id: string;
  email?: string;
  code?: string;
  expiresAt?: number;
  attempts?: number;
  verified?: boolean;
  consumed?: boolean;
  token?: string;
  ip?: string;
  created?: Date;
  updated?: Date;
}

export const EmailOtpsSchema = new Schema<IEmailOtps>(
  {
  _id: { type: String, required: true },
  email: { type: String, default: '' , index: true},
  code: { type: String, default: '' },
  expiresAt: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  consumed: { type: Boolean, default: false },
  token: { type: String, default: '' },
  ip: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'email_otps',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const EmailOtpsModel = (mongoose.models['email_otps'] as Model<IEmailOtps>) ||
  mongoose.model<IEmailOtps>('email_otps', EmailOtpsSchema, 'email_otps');

export default EmailOtpsModel;
