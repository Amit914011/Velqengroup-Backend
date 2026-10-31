import mongoose, { Schema, Model } from 'mongoose';

export interface IIntegratedAiImages {
  _id: string;
  file?: string;
  created?: Date;
  updated?: Date;
}

export const IntegratedAiImagesSchema = new Schema<IIntegratedAiImages>(
  {
  _id: { type: String, required: true },
  file: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: '_integratedAiImages',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);



export const IntegratedAiImagesModel = (mongoose.models['_integratedAiImages'] as Model<IIntegratedAiImages>) ||
  mongoose.model<IIntegratedAiImages>('_integratedAiImages', IntegratedAiImagesSchema, '_integratedAiImages');

export default IntegratedAiImagesModel;
