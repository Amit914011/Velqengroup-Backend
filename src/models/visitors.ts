import mongoose, { Schema, Model } from 'mongoose';

export interface IVisitors {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
  purpose?: string;
  membersCount?: number;
  referredEmployee?: string | null;
  referredEmployeeName?: string;
  linkedClient?: string | null;
  linkedClientCode?: string;
  linkedClientName?: string;
  isUnique?: boolean;
  submittedBy?: string | null;
  submittedByName?: string;
  createdByName?: string;
  updatedByName?: string;
  company?: string;
  checkInAt?: string;
  checkOutAt?: string;
  visitStatus?: string;
  notes?: string;
  linkedLeadId?: string;
  leadStatus?: string;
  service?: string;
  clientStatus?: string;
  created?: Date;
  updated?: Date;
}

export const VisitorsSchema = new Schema<IVisitors>(
  {
  _id: { type: String, required: true },
  name: { type: String, default: '' },
  phone: { type: String, default: '' , index: true},
  email: { type: String, default: '' },
  purpose: { type: String, default: '' },
  membersCount: { type: Number, default: 0 },
  referredEmployee: { type: String, ref: 'users', default: null , index: true},
  referredEmployeeName: { type: String, default: '' },
  linkedClient: { type: String, ref: 'users', default: null },
  linkedClientCode: { type: String, default: '' },
  linkedClientName: { type: String, default: '' },
  isUnique: { type: Boolean, default: false },
  submittedBy: { type: String, ref: 'users', default: null },
  submittedByName: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  company: { type: String, default: '' },
  checkInAt: { type: String, default: '' },
  checkOutAt: { type: String, default: '' },
  visitStatus: { type: String, default: '' },
  notes: { type: String, default: '' },
  linkedLeadId: { type: String, default: '' },
  leadStatus: { type: String, default: '' },
  service: { type: String, default: '' },
  clientStatus: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'visitors',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const VisitorsModel = (mongoose.models['visitors'] as Model<IVisitors>) ||
  mongoose.model<IVisitors>('visitors', VisitorsSchema, 'visitors');

export default VisitorsModel;
