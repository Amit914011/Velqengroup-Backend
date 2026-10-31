import mongoose, { Schema, Model } from 'mongoose';

export interface IClientDocumentRequests {
  _id: string;
  client?: string | null;
  clientName?: string;
  clientEmail?: string;
  clientCode?: string;
  lead?: string | null;
  title?: string;
  category?: string;
  message?: string;
  status?: string;
  requestedBy?: string | null;
  requestedByName?: string;
  requestedByRole?: string;
  signature?: string;
  emailSent?: boolean;
  emailError?: string;
  emailSentAt?: string;
  notificationId?: string;
  fulfilledAt?: string;
  created?: Date;
  updated?: Date;
}

export const ClientDocumentRequestsSchema = new Schema<IClientDocumentRequests>(
  {
  _id: { type: String, required: true },
  client: { type: String, ref: 'users', default: null , index: true},
  clientName: { type: String, default: '' },
  clientEmail: { type: String, default: '' },
  clientCode: { type: String, default: '' },
  lead: { type: String, ref: 'leads', default: null },
  title: { type: String, default: '' },
  category: { type: String, default: '' },
  message: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  requestedBy: { type: String, ref: 'users', default: null , index: true},
  requestedByName: { type: String, default: '' },
  requestedByRole: { type: String, default: '' },
  signature: { type: String, default: '' , index: true},
  emailSent: { type: Boolean, default: false },
  emailError: { type: String, default: '' },
  emailSentAt: { type: String, default: '' },
  notificationId: { type: String, default: '' },
  fulfilledAt: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'client_document_requests',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const ClientDocumentRequestsModel = (mongoose.models['client_document_requests'] as Model<IClientDocumentRequests>) ||
  mongoose.model<IClientDocumentRequests>('client_document_requests', ClientDocumentRequestsSchema, 'client_document_requests');

export default ClientDocumentRequestsModel;
