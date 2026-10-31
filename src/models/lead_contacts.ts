import mongoose, { Schema, Model } from 'mongoose';

export interface ILeadContacts {
  _id: string;
  lead?: string | null;
  type?: string;
  value?: string;
  label?: string;
  addedBy?: string | null;
  addedByName?: string;
  createdByName?: string;
  updatedByName?: string;
  created?: Date;
  updated?: Date;
}

export const LeadContactsSchema = new Schema<ILeadContacts>(
  {
  _id: { type: String, required: true },
  lead: { type: String, ref: 'leads', default: null , index: true},
  type: { type: String, default: '' },
  value: { type: String, default: '' },
  label: { type: String, default: '' },
  addedBy: { type: String, ref: 'users', default: null },
  addedByName: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'lead_contacts',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LeadContactsModel = (mongoose.models['lead_contacts'] as Model<ILeadContacts>) ||
  mongoose.model<ILeadContacts>('lead_contacts', LeadContactsSchema, 'lead_contacts');

export default LeadContactsModel;
