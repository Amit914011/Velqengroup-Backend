import mongoose, { Schema, Model } from 'mongoose';

export interface ILeads {
  _id: string;
  name?: string;
  phone?: string;
  altPhone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  refusals?: string;
  qualifications?: string;
  travelHistory?: string;
  country?: string;
  leadStatus?: string;
  tat?: string;
  notes?: string;
  visaStage?: string;
  owner?: string | null;
  clientUser?: string | null;
  whatsapp?: string;
  email?: string;
  city?: string;
  state?: string;
  nationality?: string;
  department?: string;
  inquiryType?: string;
  priority?: string;
  source?: string;
  followUpDate?: string;
  followUpTime?: string;
  origin?: string;
  clientCode?: string;
  enrollmentAmount?: number;
  b2bAgentName?: string;
  processingStatus?: string;
  deleted?: boolean;
  deletedAt?: string;
  deletedByName?: string;
  createdByName?: string;
  updatedByName?: string;
  clientStatus?: string;
  editedByManager?: boolean;
  editedByManagerName?: string;
  editedByManagerAt?: string;
  sheetConnection?: string | null;
  sheetRowId?: string;
  fillingOfficer?: string | null;
  fillingOfficerName?: string;
  fillingOfficerAllocatedAt?: string;
  fillingOfficerAllocatedBy?: string | null;
  fillingOfficerAllocatedByName?: string;
  created?: Date;
  updated?: Date;
}

export const LeadsSchema = new Schema<ILeads>(
  {
  _id: { type: String, required: true },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  altPhone: { type: String, default: '' },
  address: { type: String, default: '' },
  dob: { type: String, default: '' },
  gender: { type: String, default: '' },
  refusals: { type: String, default: '' },
  qualifications: { type: String, default: '' },
  travelHistory: { type: String, default: '' },
  country: { type: String, default: '' },
  leadStatus: { type: String, default: '', index: true },
  tat: { type: String, default: '' },
  notes: { type: String, default: '' },
  visaStage: { type: String, default: '' },
  owner: { type: String, ref: 'users', default: null , index: true},
  clientUser: { type: String, ref: 'users', default: null, index: true },
  whatsapp: { type: String, default: '' },
  email: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  nationality: { type: String, default: '' },
  department: { type: String, default: '' },
  inquiryType: { type: String, default: '' },
  priority: { type: String, default: '' },
  source: { type: String, default: '' },
  followUpDate: { type: String, default: '' },
  followUpTime: { type: String, default: '' },
  origin: { type: String, default: '' },
  clientCode: { type: String, default: '' },
  enrollmentAmount: { type: Number, default: 0 },
  b2bAgentName: { type: String, default: '' },
  processingStatus: { type: String, default: '' },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: String, default: '' },
  deletedByName: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  clientStatus: { type: String, default: '' },
  editedByManager: { type: Boolean, default: false },
  editedByManagerName: { type: String, default: '' },
  editedByManagerAt: { type: String, default: '' },
  sheetConnection: { type: String, ref: 'sheet_connections', default: null },
  sheetRowId: { type: String, default: '' },
  fillingOfficer: { type: String, ref: 'users', default: null },
  fillingOfficerName: { type: String, default: '' },
  fillingOfficerAllocatedAt: { type: String, default: '' },
  fillingOfficerAllocatedBy: { type: String, ref: 'users', default: null },
  fillingOfficerAllocatedByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'leads',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LeadsModel = (mongoose.models['leads'] as Model<ILeads>) ||
  mongoose.model<ILeads>('leads', LeadsSchema, 'leads');

export default LeadsModel;
