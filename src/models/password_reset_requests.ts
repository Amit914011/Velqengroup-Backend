import mongoose, { Schema, Model } from 'mongoose';

export interface IPasswordResetRequests {
  _id: string;
  email?: string;
  name?: string;
  token?: string;
  status?: string;
  created?: Date;
  updated?: Date;
}

export const PasswordResetRequestsSchema = new Schema<IPasswordResetRequests>(
  {
  _id: { type: String, required: true },
  email: { type: String, default: '' },
  name: { type: String, default: '' },
  token: { type: String, default: '' },
  status: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'password_reset_requests',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const PasswordResetRequestsModel = (mongoose.models['password_reset_requests'] as Model<IPasswordResetRequests>) ||
  mongoose.model<IPasswordResetRequests>('password_reset_requests', PasswordResetRequestsSchema, 'password_reset_requests');

export default PasswordResetRequestsModel;
