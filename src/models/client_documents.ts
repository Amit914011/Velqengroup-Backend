import mongoose, { Schema, Model } from 'mongoose';

export interface IClientDocuments {
  _id: string;
  client?: string | null;
  clientName?: string;
  title?: string;
  category?: string;
  file?: string;
  status?: string;
  note?: string;
  uploadedByRole?: string;
  uploadedByName?: string;
  reviewedBy?: string;
  deleted?: boolean;
  deletedAt?: string;
  deletedByName?: string;
  createdByName?: string;
  updatedByName?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  adminRemark?: string;
  rejectionReason?: string;
  clientCode?: string;
  created?: Date;
  updated?: Date;
}

export const ClientDocumentsSchema = new Schema<IClientDocuments>(
  {
  _id: { type: String, required: true },
  client: { type: String, ref: 'users', default: null , index: true},
  clientName: { type: String, default: '' },
  title: { type: String, default: '' },
  category: { type: String, default: '' },
  file: { type: String, default: '' },
  status: { type: String, default: '' },
  note: { type: String, default: '' },
  uploadedByRole: { type: String, default: '', index: true },
  uploadedByName: { type: String, default: '' },
  reviewedBy: { type: String, default: '' },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: String, default: '' },
  deletedByName: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  reviewedByName: { type: String, default: '' },
  reviewedAt: { type: String, default: '' },
  adminRemark: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  clientCode: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'client_documents',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const ClientDocumentsModel = (mongoose.models['client_documents'] as Model<IClientDocuments>) ||
  mongoose.model<IClientDocuments>('client_documents', ClientDocumentsSchema, 'client_documents');

export default ClientDocumentsModel;
