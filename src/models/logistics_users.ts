import mongoose, { Schema, Model } from 'mongoose';

export interface ILogisticsUsers {
  _id: string;
  fullName?: string;
  companyName?: string;
  accountType?: string;
  mobile?: string;
  whatsapp?: string;
  country?: string;
  state?: string;
  city?: string;
  consent?: boolean;
  status?: string;
  password?: string;
  tokenKey?: string;
  email?: string;
  emailVisibility?: boolean;
  verified?: boolean;
  created?: Date;
  updated?: Date;
}

export const LogisticsUsersSchema = new Schema<ILogisticsUsers>(
  {
  _id: { type: String, required: true },
  fullName: { type: String, default: '' },
  companyName: { type: String, default: '' },
  accountType: { type: String, default: '' },
  mobile: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  country: { type: String, default: '' },
  state: { type: String, default: '' },
  city: { type: String, default: '' },
  consent: { type: Boolean, default: false },
  status: { type: String, default: '' },
  password: { type: String, default: '' },
  tokenKey: { type: String, default: '' , index: true},
  email: { type: String, default: '' , index: true},
  emailVisibility: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'logistics_users',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LogisticsUsersModel = (mongoose.models['logistics_users'] as Model<ILogisticsUsers>) ||
  mongoose.model<ILogisticsUsers>('logistics_users', LogisticsUsersSchema, 'logistics_users');

export default LogisticsUsersModel;
