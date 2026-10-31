import mongoose, { Schema, Model } from 'mongoose';

export interface IRecruitmentHireRequests {
  _id: string;
  candidate?: string | null;
  candidateName?: string;
  department?: string;
  designation?: string;
  positionApplied?: string;
  submittedBy?: string | null;
  submittedByName?: string;
  fullName?: string;
  personalEmail?: string;
  phone?: string;
  whatsapp?: string;
  dob?: string;
  gender?: string;
  address?: string;
  city?: string;
  emergencyContact?: string;
  joiningDate?: string;
  manager?: string | null;
  managerName?: string;
  shiftStart?: string;
  shiftEnd?: string;
  salaryCtc?: string;
  employmentType?: string;
  probationPeriod?: string;
  idProofType?: string;
  idProofNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  documents?: Record<string, any> | any[] | any;
  status?: string;
  adminNote?: string;
  officialEmail?: string;
  officialPassword?: string;
  convertedEmployeeId?: string;
  convertedAt?: string;
  reviewedBy?: string | null;
  reviewedByName?: string;
  reviewedAt?: string;
  created?: Date;
  updated?: Date;
}

export const RecruitmentHireRequestsSchema = new Schema<IRecruitmentHireRequests>(
  {
  _id: { type: String, required: true },
  candidate: { type: String, ref: 'recruitment_candidates', default: null , index: true},
  candidateName: { type: String, default: '' },
  department: { type: String, default: '' },
  designation: { type: String, default: '' },
  positionApplied: { type: String, default: '' },
  submittedBy: { type: String, ref: 'users', default: null , index: true},
  submittedByName: { type: String, default: '' },
  fullName: { type: String, default: '' },
  personalEmail: { type: String, default: '' },
  phone: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  dob: { type: String, default: '' },
  gender: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  joiningDate: { type: String, default: '' },
  manager: { type: String, ref: 'users', default: null },
  managerName: { type: String, default: '' },
  shiftStart: { type: String, default: '' },
  shiftEnd: { type: String, default: '' },
  salaryCtc: { type: String, default: '' },
  employmentType: { type: String, default: '' },
  probationPeriod: { type: String, default: '' },
  idProofType: { type: String, default: '' },
  idProofNumber: { type: String, default: '' },
  bankName: { type: String, default: '' },
  bankAccountNumber: { type: String, default: '' },
  bankIfsc: { type: String, default: '' },
  bankBranch: { type: String, default: '' },
  documents: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, default: '', index: true },
  adminNote: { type: String, default: '' },
  officialEmail: { type: String, default: '' },
  officialPassword: { type: String, default: '' },
  convertedEmployeeId: { type: String, default: '' },
  convertedAt: { type: String, default: '' },
  reviewedBy: { type: String, ref: 'users', default: null },
  reviewedByName: { type: String, default: '' },
  reviewedAt: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'recruitment_hire_requests',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const RecruitmentHireRequestsModel = (mongoose.models['recruitment_hire_requests'] as Model<IRecruitmentHireRequests>) ||
  mongoose.model<IRecruitmentHireRequests>('recruitment_hire_requests', RecruitmentHireRequestsSchema, 'recruitment_hire_requests');

export default RecruitmentHireRequestsModel;
