import mongoose, { Schema, Model } from 'mongoose';

export interface IMarketplaceUsers {
  _id: string;
  name?: string;
  phone?: string;
  marketplace?: string;
  role?: string;
  company?: string;
  password?: string;
  tokenKey?: string;
  email?: string;
  emailVisibility?: boolean;
  verified?: boolean;
  created?: Date;
  updated?: Date;
}

export const MarketplaceUsersSchema = new Schema<IMarketplaceUsers>(
  {
  _id: { type: String, required: true },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  marketplace: { type: String, default: '' },
  role: { type: String, default: '' },
  company: { type: String, default: '' },
  password: { type: String, default: '' },
  tokenKey: { type: String, default: '' , index: true},
  email: { type: String, default: '' , index: true},
  emailVisibility: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
    created: { type: Date, default: Date.now, index: true },
    updated: { type: Date, default: Date.now },
  },
  {
    collection: 'marketplace_users',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const MarketplaceUsersModel = (mongoose.models['marketplace_users'] as Model<IMarketplaceUsers>) ||
  mongoose.model<IMarketplaceUsers>('marketplace_users', MarketplaceUsersSchema, 'marketplace_users');

export default MarketplaceUsersModel;
