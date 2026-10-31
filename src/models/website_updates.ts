import mongoose, { Schema, Model } from 'mongoose';

export interface IWebsiteUpdates {
  _id: string;
  title?: string;
  category?: string;
  description?: string;
  fullDescription?: string;
  featuredImage?: string;
  additionalImages?: string[];
  ctaText?: string;
  ctaUrl?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  priority?: string;
  status?: string;
  assignedPages?: string[];
  createdBy?: string | null;
  createdByName?: string;
  views?: number;
  ctaClicks?: number;
  sortOrder?: number;
  created?: Date;
  updated?: Date;
}

export const WebsiteUpdatesSchema = new Schema<IWebsiteUpdates>(
  {
  _id: { type: String, required: true },
  title: { type: String, default: '' },
  category: { type: String, default: '' },
  description: { type: String, default: '' },
  fullDescription: { type: String, default: '' },
  featuredImage: { type: String, default: '' },
  additionalImages: { type: [String], default: [] },
  ctaText: { type: String, default: '' },
  ctaUrl: { type: String, default: '' },
  startDate: { type: Date, default: null , index: true},
  endDate: { type: Date, default: null , index: true},
  priority: { type: String, default: '' , index: true},
  status: { type: String, default: '' , index: true},
  assignedPages: { type: [String], default: [] },
  createdBy: { type: String, ref: 'users', default: null },
  createdByName: { type: String, default: '' },
  views: { type: Number, default: 0 },
  ctaClicks: { type: Number, default: 0 },
  sortOrder: { type: Number, default: 0 },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'website_updates',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const WebsiteUpdatesModel = (mongoose.models['website_updates'] as Model<IWebsiteUpdates>) ||
  mongoose.model<IWebsiteUpdates>('website_updates', WebsiteUpdatesSchema, 'website_updates');

export default WebsiteUpdatesModel;
