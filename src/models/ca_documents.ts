import mongoose, { Schema, Model } from 'mongoose';

export interface ICaDocuments {
  _id: string;
  title?: string;
  docType?: string;
  note?: string;
  file?: string;
  owner?: string | null;
  created?: Date;
  updated?: Date;
}

export const CaDocumentsSchema = new Schema<ICaDocuments>(
  {
  _id: { type: String, required: true },
  title: { type: String, default: '' },
  docType: { type: String, default: '' },
  note: { type: String, default: '' },
  file: { type: String, default: '' },
  owner: { type: String, ref: 'users', default: null , index: true},
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'ca_documents',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const CaDocumentsModel = (mongoose.models['ca_documents'] as Model<ICaDocuments>) ||
  mongoose.model<ICaDocuments>('ca_documents', CaDocumentsSchema, 'ca_documents');

export default CaDocumentsModel;
