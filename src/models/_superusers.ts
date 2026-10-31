import mongoose, { Schema, Model } from 'mongoose';

export interface ISuperusers {
  _id: string;
  password?: string;
  tokenKey?: string;
  email?: string;
  emailVisibility?: boolean;
  verified?: boolean;
  created?: Date;
  updated?: Date;
}

export const SuperusersSchema = new Schema<ISuperusers>(
  {
  _id: { type: String, required: true },
  password: { type: String, default: '' },
  tokenKey: { type: String, default: '' , index: true},
  email: { type: String, default: '' , index: true},
  emailVisibility: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: '_superusers',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const SuperusersModel = (mongoose.models['_superusers'] as Model<ISuperusers>) ||
  mongoose.model<ISuperusers>('_superusers', SuperusersSchema, '_superusers');

export default SuperusersModel;
