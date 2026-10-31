import mongoose, { Schema, Model } from 'mongoose';

export interface ILeadAllocationRequests {
  _id: string;
  manager?: string | null;
  managerName?: string;
  lead?: string | null;
  leadName?: string;
  leadPhone?: string;
  leadDepartment?: string;
  currentOwner?: string | null;
  currentOwnerName?: string;
  assignTo?: string | null;
  assignToName?: string;
  remarks?: string;
  status?: string;
  adminRemarks?: string;
  reviewedBy?: string | null;
  reviewedByName?: string;
  reviewedAt?: string;
  created?: Date;
  updated?: Date;
}

export const LeadAllocationRequestsSchema = new Schema<ILeadAllocationRequests>(
  {
  _id: { type: String, required: true },
  manager: { type: String, ref: 'users', default: null , index: true},
  managerName: { type: String, default: '' },
  lead: { type: String, ref: 'leads', default: null , index: true},
  leadName: { type: String, default: '' },
  leadPhone: { type: String, default: '' },
  leadDepartment: { type: String, default: '' },
  currentOwner: { type: String, ref: 'users', default: null },
  currentOwnerName: { type: String, default: '' },
  assignTo: { type: String, ref: 'users', default: null },
  assignToName: { type: String, default: '' },
  remarks: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  adminRemarks: { type: String, default: '' },
  reviewedBy: { type: String, ref: 'users', default: null },
  reviewedByName: { type: String, default: '' },
  reviewedAt: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'lead_allocation_requests',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LeadAllocationRequestsModel = (mongoose.models['lead_allocation_requests'] as Model<ILeadAllocationRequests>) ||
  mongoose.model<ILeadAllocationRequests>('lead_allocation_requests', LeadAllocationRequestsSchema, 'lead_allocation_requests');

export default LeadAllocationRequestsModel;
