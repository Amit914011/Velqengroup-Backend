import mongoose, { Schema, Model } from 'mongoose';

export interface IPayrollSettings {
  _id: string;
  lateDeductionEnabled?: boolean;
  key?: string;
  updatedByName?: string;
  notes?: string;
  created?: Date;
  updated?: Date;
}

export const PayrollSettingsSchema = new Schema<IPayrollSettings>(
  {
  _id: { type: String, required: true },
  lateDeductionEnabled: { type: Boolean, default: false },
  key: { type: String, default: '' , index: true},
  updatedByName: { type: String, default: '' },
  notes: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'payroll_settings',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const PayrollSettingsModel = (mongoose.models['payroll_settings'] as Model<IPayrollSettings>) ||
  mongoose.model<IPayrollSettings>('payroll_settings', PayrollSettingsSchema, 'payroll_settings');

export default PayrollSettingsModel;
