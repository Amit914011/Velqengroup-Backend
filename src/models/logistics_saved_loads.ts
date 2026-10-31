import mongoose, { Schema, Model } from 'mongoose';

export interface ILogisticsSavedLoads {
  _id: string;
  owner?: string | null;
  load?: string | null;
  created?: Date;
  updated?: Date;
}

export const LogisticsSavedLoadsSchema = new Schema<ILogisticsSavedLoads>(
  {
  _id: { type: String, required: true },
  owner: { type: String, ref: 'logistics_users', default: null, index: true },
  load: { type: String, ref: 'logistics_loads', default: null },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'logistics_saved_loads',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LogisticsSavedLoadsModel = (mongoose.models['logistics_saved_loads'] as Model<ILogisticsSavedLoads>) ||
  mongoose.model<ILogisticsSavedLoads>('logistics_saved_loads', LogisticsSavedLoadsSchema, 'logistics_saved_loads');

export default LogisticsSavedLoadsModel;
