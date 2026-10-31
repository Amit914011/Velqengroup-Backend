import mongoose, { Schema, Model } from 'mongoose';

export interface IFoEmails {
  _id: string;
  lead?: string | null;
  clientUser?: string | null;
  clientName?: string;
  clientCode?: string;
  fillingOfficer?: string | null;
  fillingOfficerName?: string;
  direction?: string;
  fromAddress?: string;
  toAddress?: string;
  ccAddress?: string;
  subject?: string;
  bodyText?: string;
  bodyHtml?: string;
  attachments?: Record<string, any> | any[] | any;
  files?: string[];
  status?: string;
  deliveryError?: string;
  messageId?: string;
  inReplyTo?: string;
  threadId?: string;
  read?: boolean;
  sentBy?: string | null;
  sentByName?: string;
  sentAt?: string;
  receivedAt?: string;
  signature?: string;
  created?: Date;
  updated?: Date;
}

export const FoEmailsSchema = new Schema<IFoEmails>(
  {
  _id: { type: String, required: true },
  lead: { type: String, ref: 'leads', default: null , index: true},
  clientUser: { type: String, ref: 'users', default: null , index: true},
  clientName: { type: String, default: '' },
  clientCode: { type: String, default: '' },
  fillingOfficer: { type: String, ref: 'users', default: null , index: true},
  fillingOfficerName: { type: String, default: '' },
  direction: { type: String, default: '' , index: true},
  fromAddress: { type: String, default: '' },
  toAddress: { type: String, default: '' },
  ccAddress: { type: String, default: '' },
  subject: { type: String, default: '' },
  bodyText: { type: String, default: '' },
  bodyHtml: { type: String, default: '' },
  attachments: { type: Schema.Types.Mixed, default: {} },
  files: { type: [String], default: [] },
  status: { type: String, default: '' },
  deliveryError: { type: String, default: '' },
  messageId: { type: String, default: '' },
  inReplyTo: { type: String, default: '' },
  threadId: { type: String, default: '' , index: true},
  read: { type: Boolean, default: false },
  sentBy: { type: String, ref: 'users', default: null },
  sentByName: { type: String, default: '' },
  sentAt: { type: String, default: '' },
  receivedAt: { type: String, default: '' },
  signature: { type: String, default: '' , index: true},
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'fo_emails',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const FoEmailsModel = (mongoose.models['fo_emails'] as Model<IFoEmails>) ||
  mongoose.model<IFoEmails>('fo_emails', FoEmailsSchema, 'fo_emails');

export default FoEmailsModel;
