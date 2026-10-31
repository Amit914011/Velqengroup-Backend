import mongoose, { Schema, Model } from 'mongoose';

export interface ISecuritySessions {
  _id: string;
  user?: string | null;
  verifiedAt?: string;
  expiresAt?: string;
  ip?: string;
  userAgent?: string;
  purpose?: string;
  created?: Date;
  updated?: Date;
}

export const SecuritySessionsSchema = new Schema<ISecuritySessions>(
  {
  _id: { type: String, required: true },
  user: { type: String, ref: 'users', default: null , index: true},
  verifiedAt: { type: String, default: '' },
  expiresAt: { type: String, default: '' , index: true},
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  purpose: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'security_sessions',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const SecuritySessionsModel = (mongoose.models['security_sessions'] as Model<ISecuritySessions>) ||
  mongoose.model<ISecuritySessions>('security_sessions', SecuritySessionsSchema, 'security_sessions');

export default SecuritySessionsModel;
