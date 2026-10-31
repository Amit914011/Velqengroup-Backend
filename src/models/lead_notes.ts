import mongoose, { Schema, Model } from 'mongoose';

export interface ILeadNotes {
  _id: string;
  lead?: string | null;
  author?: string | null;
  authorName?: string;
  content?: string;
  kind?: string;
  deleted?: boolean;
  deletedAt?: string;
  deletedByName?: string;
  createdByName?: string;
  updatedByName?: string;
  callDuration?: string;
  callType?: string;
  callStatus?: string;
  created?: Date;
  updated?: Date;
}

export const LeadNotesSchema = new Schema<ILeadNotes>(
  {
  _id: { type: String, required: true },
  lead: { type: String, ref: 'leads', default: null , index: true},
  author: { type: String, ref: 'users', default: null },
  authorName: { type: String, default: '' },
  content: { type: String, default: '' },
  kind: { type: String, default: '' },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: String, default: '' },
  deletedByName: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  callDuration: { type: String, default: '' },
  callType: { type: String, default: '' },
  callStatus: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'lead_notes',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LeadNotesModel = (mongoose.models['lead_notes'] as Model<ILeadNotes>) ||
  mongoose.model<ILeadNotes>('lead_notes', LeadNotesSchema, 'lead_notes');

export default LeadNotesModel;
