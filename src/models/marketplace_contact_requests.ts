import mongoose, { Schema, Model } from 'mongoose';

export interface IMarketplaceContactRequests {
  _id: string;
  marketplace?: string;
  listingTitle?: string;
  listingId?: string;
  requesterName?: string;
  requesterEmail?: string;
  requesterPhone?: string;
  message?: string;
  status?: string;
  created?: Date;
  updated?: Date;
}

export const MarketplaceContactRequestsSchema = new Schema<IMarketplaceContactRequests>(
  {
  _id: { type: String, required: true },
  marketplace: { type: String, default: '' },
  listingTitle: { type: String, default: '' },
  listingId: { type: String, default: '' },
  requesterName: { type: String, default: '' },
  requesterEmail: { type: String, default: '' },
  requesterPhone: { type: String, default: '' },
  message: { type: String, default: '' },
  status: { type: String, default: '', index: true },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'marketplace_contact_requests',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);



export const MarketplaceContactRequestsModel = (mongoose.models['marketplace_contact_requests'] as Model<IMarketplaceContactRequests>) ||
  mongoose.model<IMarketplaceContactRequests>('marketplace_contact_requests', MarketplaceContactRequestsSchema, 'marketplace_contact_requests');

export default MarketplaceContactRequestsModel;
