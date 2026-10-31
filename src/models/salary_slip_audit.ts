import mongoose, { Schema, Model } from 'mongoose';

export interface ISalarySlipAudit {
  _id: string;
  slip?: string | null;
  employee?: string | null;
  employeeName?: string;
  month?: string;
  year?: string;
  trigger?: string;
  actor?: string;
  discrepancyCount?: number;
  changes?: Record<string, any> | any[] | any;
  summary?: string;
  created?: Date;
  updated?: Date;
}

export const SalarySlipAuditSchema = new Schema<ISalarySlipAudit>(
  {
  _id: { type: String, required: true },
  slip: { type: String, ref: 'salary_slips', default: null , index: true},
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  month: { type: String, default: '' },
  year: { type: String, default: '' },
  trigger: { type: String, default: '' },
  actor: { type: String, default: '' },
  discrepancyCount: { type: Number, default: 0 },
  changes: { type: Schema.Types.Mixed, default: {} },
  summary: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'salary_slip_audit',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const SalarySlipAuditModel = (mongoose.models['salary_slip_audit'] as Model<ISalarySlipAudit>) ||
  mongoose.model<ISalarySlipAudit>('salary_slip_audit', SalarySlipAuditSchema, 'salary_slip_audit');

export default SalarySlipAuditModel;
