import mongoose, { Schema, Model } from 'mongoose';

export interface IBroadcasts {
  _id: string;
  title?: string;
  message?: string;
  category?: string;
  audience?: string;
  targetUser?: string | null;
  senderName?: string;
  link?: string;
  created?: Date;
  updated?: Date;
}

export const BroadcastsSchema = new Schema<IBroadcasts>(
  {
  _id: { type: String, required: true },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  category: { type: String, default: '' },
  audience: { type: String, default: '' },
  targetUser: { type: String, ref: 'users', default: null },
  senderName: { type: String, default: '' },
  link: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'broadcasts',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);



export const BroadcastsModel = (mongoose.models['broadcasts'] as Model<IBroadcasts>) ||
  mongoose.model<IBroadcasts>('broadcasts', BroadcastsSchema, 'broadcasts');

export default BroadcastsModel;
