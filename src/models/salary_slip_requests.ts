import mongoose, { Schema, Model } from 'mongoose';

export interface ISalarySlipRequests {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  month?: string;
  year?: string;
  fromDate?: string;
  toDate?: string;
  note?: string;
  status?: string;
  slip?: string | null;
  adminNote?: string;
  manager?: string | null;
  requestType?: string;
  reviewedBy?: string | null;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewComment?: string;
  created?: Date;
  updated?: Date;
}

export const SalarySlipRequestsSchema = new Schema<ISalarySlipRequests>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null, index: true },
  employeeName: { type: String, default: '' },
  month: { type: String, default: '' },
  year: { type: String, default: '' },
  fromDate: { type: String, default: '' },
  toDate: { type: String, default: '' },
  note: { type: String, default: '' },
  status: { type: String, default: '' },
  slip: { type: String, ref: 'salary_slips', default: null },
  adminNote: { type: String, default: '' },
  manager: { type: String, ref: 'users', default: null },
  requestType: { type: String, default: '' },
  reviewedBy: { type: String, ref: 'users', default: null },
  reviewedByName: { type: String, default: '' },
  reviewedAt: { type: String, default: '' },
  reviewComment: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'salary_slip_requests',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const SalarySlipRequestsModel = (mongoose.models['salary_slip_requests'] as Model<ISalarySlipRequests>) ||
  mongoose.model<ISalarySlipRequests>('salary_slip_requests', SalarySlipRequestsSchema, 'salary_slip_requests');

export default SalarySlipRequestsModel;
