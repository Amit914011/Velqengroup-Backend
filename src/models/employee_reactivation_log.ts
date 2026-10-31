import mongoose, { Schema, Model } from 'mongoose';

export interface IEmployeeReactivationLog {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  employeeId?: string;
  previousStatus?: string;
  newStatus?: string;
  reactivatedBy?: string | null;
  reactivatedByName?: string;
  reactivatedAt?: string;
  previousExitDate?: string;
  previousReason?: string;
  remarks?: string;
  created?: Date;
  updated?: Date;
}

export const EmployeeReactivationLogSchema = new Schema<IEmployeeReactivationLog>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  employeeId: { type: String, default: '' },
  previousStatus: { type: String, default: '' },
  newStatus: { type: String, default: '' },
  reactivatedBy: { type: String, ref: 'users', default: null },
  reactivatedByName: { type: String, default: '' },
  reactivatedAt: { type: String, default: '' },
  previousExitDate: { type: String, default: '' },
  previousReason: { type: String, default: '' },
  remarks: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'employee_reactivation_log',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const EmployeeReactivationLogModel = (mongoose.models['employee_reactivation_log'] as Model<IEmployeeReactivationLog>) ||
  mongoose.model<IEmployeeReactivationLog>('employee_reactivation_log', EmployeeReactivationLogSchema, 'employee_reactivation_log');

export default EmployeeReactivationLogModel;
