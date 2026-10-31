import mongoose, { Schema, Model } from 'mongoose';

export interface IEmployeeChangeRequests {
  _id: string;
  requestType?: string;
  manager?: string | null;
  managerName?: string;
  employee?: string | null;
  employeeName?: string;
  employeeIdRef?: string;
  oldValues?: Record<string, any> | any[] | any;
  newValues?: Record<string, any> | any[] | any;
  changedFields?: Record<string, any> | any[] | any;
  status?: string;
  adminComments?: string;
  reviewedBy?: string | null;
  reviewedByName?: string;
  reviewedAt?: string;
  applied?: boolean;
  appliedAt?: string;
  created?: Date;
  updated?: Date;
}

export const EmployeeChangeRequestsSchema = new Schema<IEmployeeChangeRequests>(
  {
  _id: { type: String, required: true },
  requestType: { type: String, default: '' },
  manager: { type: String, ref: 'users', default: null , index: true},
  managerName: { type: String, default: '' },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  employeeIdRef: { type: String, default: '' },
  oldValues: { type: Schema.Types.Mixed, default: {} },
  newValues: { type: Schema.Types.Mixed, default: {} },
  changedFields: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, default: '' , index: true},
  adminComments: { type: String, default: '' },
  reviewedBy: { type: String, ref: 'users', default: null },
  reviewedByName: { type: String, default: '' },
  reviewedAt: { type: String, default: '' },
  applied: { type: Boolean, default: false },
  appliedAt: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'employee_change_requests',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const EmployeeChangeRequestsModel = (mongoose.models['employee_change_requests'] as Model<IEmployeeChangeRequests>) ||
  mongoose.model<IEmployeeChangeRequests>('employee_change_requests', EmployeeChangeRequestsSchema, 'employee_change_requests');

export default EmployeeChangeRequestsModel;
