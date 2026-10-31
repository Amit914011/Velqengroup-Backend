import mongoose, { Schema, Model } from 'mongoose';

export interface IRecruitmentCandidates {
  _id: string;
  fullName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  dob?: string;
  gender?: string;
  city?: string;
  address?: string;
  experience?: string;
  visaImmigrationExperience?: string;
  qualification?: string;
  currentCompany?: string;
  currentSalary?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  preferredLocation?: string;
  positionApplied?: string;
  source?: string;
  campaign?: string;
  remarks?: string;
  status?: string;
  department?: string;
  assignedManager?: string | null;
  assignedManagerName?: string;
  sheetConnection?: string | null;
  sheetRowId?: string;
  sheetRowCreatedTime?: string;
  originalSource?: string;
  convertedEmployeeId?: string;
  convertedAt?: string;
  hireRequest?: string | null;
  createdBy?: string | null;
  createdByName?: string;
  deleted?: boolean;
  deletedBy?: string | null;
  deletedByName?: string;
  deletedAt?: string;
  created?: Date;
  updated?: Date;
}

export const RecruitmentCandidatesSchema = new Schema<IRecruitmentCandidates>(
  {
  _id: { type: String, required: true },
  fullName: { type: String, default: '' },
  phone: { type: String, default: '' , index: true},
  whatsapp: { type: String, default: '' , index: true},
  email: { type: String, default: '' , index: true},
  dob: { type: String, default: '' },
  gender: { type: String, default: '' },
  city: { type: String, default: '' },
  address: { type: String, default: '' },
  experience: { type: String, default: '' },
  visaImmigrationExperience: { type: String, default: '' },
  qualification: { type: String, default: '' },
  currentCompany: { type: String, default: '' },
  currentSalary: { type: String, default: '' },
  expectedSalary: { type: String, default: '' },
  noticePeriod: { type: String, default: '' },
  preferredLocation: { type: String, default: '' },
  positionApplied: { type: String, default: '' },
  source: { type: String, default: '' },
  campaign: { type: String, default: '' },
  remarks: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  department: { type: String, default: '' , index: true},
  assignedManager: { type: String, ref: 'users', default: null , index: true},
  assignedManagerName: { type: String, default: '' },
  sheetConnection: { type: String, ref: 'sheet_connections', default: null , index: true},
  sheetRowId: { type: String, default: '' },
  sheetRowCreatedTime: { type: String, default: '' },
  originalSource: { type: String, default: '' },
  convertedEmployeeId: { type: String, default: '' },
  convertedAt: { type: String, default: '' },
  hireRequest: { type: String, ref: 'recruitment_hire_requests', default: null },
  createdBy: { type: String, ref: 'users', default: null },
  createdByName: { type: String, default: '' },
  deleted: { type: Boolean, default: false, index: true },
  deletedBy: { type: String, ref: 'users', default: null },
  deletedByName: { type: String, default: '' },
  deletedAt: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'recruitment_candidates',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const RecruitmentCandidatesModel = (mongoose.models['recruitment_candidates'] as Model<IRecruitmentCandidates>) ||
  mongoose.model<IRecruitmentCandidates>('recruitment_candidates', RecruitmentCandidatesSchema, 'recruitment_candidates');

export default RecruitmentCandidatesModel;
