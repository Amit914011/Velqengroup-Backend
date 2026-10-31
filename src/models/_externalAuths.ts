import mongoose, { Schema, Model } from 'mongoose';

export interface IExternalAuths {
  _id: string;
  collectionRef?: string;
  recordRef?: string;
  provider?: string;
  providerId?: string;
  created?: Date;
  updated?: Date;
}

export const ExternalAuthsSchema = new Schema<IExternalAuths>(
  {
  _id: { type: String, required: true },
  collectionRef: { type: String, default: '' },
  recordRef: { type: String, default: '' },
  provider: { type: String, default: '' },
  providerId: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: '_externalAuths',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

ExternalAuthsSchema.index({"collectionRef":1,"recordRef":1,"provider":1});
ExternalAuthsSchema.index({"collectionRef":1,"provider":1,"providerId":1});

export const ExternalAuthsModel = (mongoose.models['_externalAuths'] as Model<IExternalAuths>) ||
  mongoose.model<IExternalAuths>('_externalAuths', ExternalAuthsSchema, '_externalAuths');

export default ExternalAuthsModel;
