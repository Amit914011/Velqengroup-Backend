import mongoose, { Schema, Model } from 'mongoose';

export interface IOtps {
  _id: string;
  collectionRef?: string;
  recordRef?: string;
  password?: string;
  sentTo?: string;
  created?: Date;
  updated?: Date;
}

export const OtpsSchema = new Schema<IOtps>(
  {
  _id: { type: String, required: true },
  collectionRef: { type: String, default: '' },
  recordRef: { type: String, default: '' },
  password: { type: String, default: '' },
  sentTo: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: '_otps',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

OtpsSchema.index({"collectionRef":1,"recordRef":1});

export const OtpsModel = (mongoose.models['_otps'] as Model<IOtps>) ||
  mongoose.model<IOtps>('_otps', OtpsSchema, '_otps');

export default OtpsModel;
