import mongoose, { Schema, Model } from 'mongoose';

export interface IMarketplaceListings {
  _id: string;
  marketplace?: string;
  category?: string;
  title?: string;
  listingType?: string;
  location?: string;
  price?: string;
  summary?: string;
  details?: Record<string, any> | any[] | any;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  images?: string[];
  status?: string;
  owner?: string | null;
  ownerName?: string;
  ownerRole?: string;
  created?: Date;
  updated?: Date;
}

export const MarketplaceListingsSchema = new Schema<IMarketplaceListings>(
  {
  _id: { type: String, required: true },
  marketplace: { type: String, default: '' , index: true},
  category: { type: String, default: '' },
  title: { type: String, default: '' },
  listingType: { type: String, default: '' },
  location: { type: String, default: '' },
  price: { type: String, default: '' },
  summary: { type: String, default: '' },
  details: { type: Schema.Types.Mixed, default: {} },
  contactName: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  images: { type: [String], default: [] },
  status: { type: String, default: '', index: true },
  owner: { type: String, ref: 'marketplace_users', default: null , index: true},
  ownerName: { type: String, default: '' },
  ownerRole: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'marketplace_listings',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const MarketplaceListingsModel = (mongoose.models['marketplace_listings'] as Model<IMarketplaceListings>) ||
  mongoose.model<IMarketplaceListings>('marketplace_listings', MarketplaceListingsSchema, 'marketplace_listings');

export default MarketplaceListingsModel;
