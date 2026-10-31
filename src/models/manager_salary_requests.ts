import mongoose, { Schema, Model } from 'mongoose';

export interface IManagerSalaryRequests {
  _id: string;
  manager?: string | null;
  managerName?: string;
  employee?: string | null;
  employeeName?: string;
  month?: string;
  year?: string;
  department?: string;
  status?: string;
  slipValues?: Record<string, any> | any[] | any;
  calcValues?: Record<string, any> | any[] | any;
  adjustments?: Record<string, any> | any[] | any;
  adjustmentReason?: string;
  slip?: string | null;
  reviewedBy?: string | null;
  reviewedByName?: string;
  reviewedAt?: string;
  adminNote?: string;
  approvalHistory?: Record<string, any> | any[] | any;
  created?: Date;
  updated?: Date;
}

export const ManagerSalaryRequestsSchema = new Schema<IManagerSalaryRequests>(
  {
  _id: { type: String, required: true },
  manager: { type: String, ref: 'users', default: null , index: true},
  managerName: { type: String, default: '' },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  month: { type: String, default: '' },
  year: { type: String, default: '' },
  department: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  slipValues: { type: Schema.Types.Mixed, default: {} },
  calcValues: { type: Schema.Types.Mixed, default: {} },
  adjustments: { type: Schema.Types.Mixed, default: {} },
  adjustmentReason: { type: String, default: '' },
  slip: { type: String, ref: 'salary_slips', default: null },
  reviewedBy: { type: String, ref: 'users', default: null },
  reviewedByName: { type: String, default: '' },
  reviewedAt: { type: String, default: '' },
  adminNote: { type: String, default: '' },
  approvalHistory: { type: Schema.Types.Mixed, default: {} },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'manager_salary_requests',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const ManagerSalaryRequestsModel = (mongoose.models['manager_salary_requests'] as Model<IManagerSalaryRequests>) ||
  mongoose.model<IManagerSalaryRequests>('manager_salary_requests', ManagerSalaryRequestsSchema, 'manager_salary_requests');

export default ManagerSalaryRequestsModel;
