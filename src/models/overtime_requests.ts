import mongoose, { Schema, Model } from 'mongoose';

export interface IOvertimeRequests {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  department?: string;
  manager?: string | null;
  managerName?: string;
  requestDate?: string;
  days?: Record<string, any> | any[] | any;
  status?: string;
  currentApproverRole?: string;
  approvalLog?: Record<string, any> | any[] | any;
  totalClaimedHours?: number;
  totalVerifiedHours?: number;
  totalApprovedHours?: number;
  otAmount?: number;
  payrollTransactionRef?: string;
  postedToPayroll?: boolean;
  attachment?: string;
  createdBy?: string | null;
  createdByName?: string;
  created?: Date;
  updated?: Date;
}

export const OvertimeRequestsSchema = new Schema<IOvertimeRequests>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null, index: true },
  employeeName: { type: String, default: '' },
  department: { type: String, default: '' },
  manager: { type: String, ref: 'users', default: null },
  managerName: { type: String, default: '' },
  requestDate: { type: String, default: '' , index: true},
  days: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, default: '' , index: true},
  currentApproverRole: { type: String, default: '' },
  approvalLog: { type: Schema.Types.Mixed, default: {} },
  totalClaimedHours: { type: Number, default: 0 },
  totalVerifiedHours: { type: Number, default: 0 },
  totalApprovedHours: { type: Number, default: 0 },
  otAmount: { type: Number, default: 0 },
  payrollTransactionRef: { type: String, default: '' },
  postedToPayroll: { type: Boolean, default: false },
  attachment: { type: String, default: '' },
  createdBy: { type: String, ref: 'users', default: null },
  createdByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'overtime_requests',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const OvertimeRequestsModel = (mongoose.models['overtime_requests'] as Model<IOvertimeRequests>) ||
  mongoose.model<IOvertimeRequests>('overtime_requests', OvertimeRequestsSchema, 'overtime_requests');

export default OvertimeRequestsModel;
