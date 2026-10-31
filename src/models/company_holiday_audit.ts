import mongoose, { Schema, Model } from 'mongoose';

export interface ICompanyHolidayAudit {
  _id: string;
  holiday?: string | null;
  holidayName?: string;
  holidayDate?: string;
  oldStatus?: string;
  newStatus?: string;
  action?: string;
  changedBy?: string | null;
  changedByName?: string;
  changedAt?: string;
  note?: string;
  created?: Date;
  updated?: Date;
}

export const CompanyHolidayAuditSchema = new Schema<ICompanyHolidayAudit>(
  {
  _id: { type: String, required: true },
  holiday: { type: String, ref: 'company_holidays', default: null , index: true},
  holidayName: { type: String, default: '' },
  holidayDate: { type: String, default: '' , index: true},
  oldStatus: { type: String, default: '' },
  newStatus: { type: String, default: '' },
  action: { type: String, default: '' },
  changedBy: { type: String, ref: 'users', default: null },
  changedByName: { type: String, default: '' },
  changedAt: { type: String, default: '', index: true },
  note: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'company_holiday_audit',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const CompanyHolidayAuditModel = (mongoose.models['company_holiday_audit'] as Model<ICompanyHolidayAudit>) ||
  mongoose.model<ICompanyHolidayAudit>('company_holiday_audit', CompanyHolidayAuditSchema, 'company_holiday_audit');

export default CompanyHolidayAuditModel;
