import mongoose, { Schema, Model } from 'mongoose';

export interface IAuthOrigins {
  _id: string;
  collectionRef?: string;
  recordRef?: string;
  fingerprint?: string;
  created?: Date;
  updated?: Date;
}

export const AuthOriginsSchema = new Schema<IAuthOrigins>(
  {
  _id: { type: String, required: true },
  collectionRef: { type: String, default: '' },
  recordRef: { type: String, default: '' },
  fingerprint: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: '_authOrigins',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

AuthOriginsSchema.index({"collectionRef":1,"recordRef":1,"fingerprint":1});

export const AuthOriginsModel = (mongoose.models['_authOrigins'] as Model<IAuthOrigins>) ||
  mongoose.model<IAuthOrigins>('_authOrigins', AuthOriginsSchema, '_authOrigins');

export default AuthOriginsModel;
