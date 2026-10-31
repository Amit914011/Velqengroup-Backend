import mongoose, { Schema, Model } from 'mongoose';

export interface IPayrollSettingsAudit {
  _id: string;
  setting?: string;
  oldValue?: string;
  newValue?: string;
  actor?: string;
  summary?: string;
  created?: Date;
  updated?: Date;
}

export const PayrollSettingsAuditSchema = new Schema<IPayrollSettingsAudit>(
  {
  _id: { type: String, required: true },
  setting: { type: String, default: '' },
  oldValue: { type: String, default: '' },
  newValue: { type: String, default: '' },
  actor: { type: String, default: '' },
  summary: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'payroll_settings_audit',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const PayrollSettingsAuditModel = (mongoose.models['payroll_settings_audit'] as Model<IPayrollSettingsAudit>) ||
  mongoose.model<IPayrollSettingsAudit>('payroll_settings_audit', PayrollSettingsAuditSchema, 'payroll_settings_audit');

export default PayrollSettingsAuditModel;
