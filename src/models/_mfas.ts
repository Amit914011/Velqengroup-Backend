import mongoose, { Schema, Model } from 'mongoose';

export interface IMfas {
  _id: string;
  collectionRef?: string;
  recordRef?: string;
  method?: string;
  created?: Date;
  updated?: Date;
}

export const MfasSchema = new Schema<IMfas>(
  {
  _id: { type: String, required: true },
  collectionRef: { type: String, default: '' },
  recordRef: { type: String, default: '' },
  method: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: '_mfas',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

MfasSchema.index({"collectionRef":1,"recordRef":1});

export const MfasModel = (mongoose.models['_mfas'] as Model<IMfas>) ||
  mongoose.model<IMfas>('_mfas', MfasSchema, '_mfas');

export default MfasModel;
