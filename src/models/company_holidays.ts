import mongoose, { Schema, Model } from 'mongoose';

export interface ICompanyHolidays {
  _id: string;
  holidayName?: string;
  holidayDate?: string;
  holidayType?: string;
  description?: string;
  status?: string;
  isWorkingDay?: boolean;
  isPaidHoliday?: boolean;
  applicableLocation?: string;
  applicableDepartment?: string;
  source?: string;
  approvedBy?: string | null;
  approvedByName?: string;
  approvedAt?: string;
  workingStatus?: string;
  payrollTreatment?: string;
  active?: boolean;
  remarks?: string;
  created?: Date;
  updated?: Date;
}

export const CompanyHolidaysSchema = new Schema<ICompanyHolidays>(
  {
  _id: { type: String, required: true },
  holidayName: { type: String, default: '' },
  holidayDate: { type: String, default: '' , index: true},
  holidayType: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  isWorkingDay: { type: Boolean, default: false },
  isPaidHoliday: { type: Boolean, default: false },
  applicableLocation: { type: String, default: '' },
  applicableDepartment: { type: String, default: '' },
  source: { type: String, default: '' },
  approvedBy: { type: String, ref: 'users', default: null },
  approvedByName: { type: String, default: '' },
  approvedAt: { type: String, default: '' },
  workingStatus: { type: String, default: '' },
  payrollTreatment: { type: String, default: '' },
  active: { type: Boolean, default: false },
  remarks: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'company_holidays',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const CompanyHolidaysModel = (mongoose.models['company_holidays'] as Model<ICompanyHolidays>) ||
  mongoose.model<ICompanyHolidays>('company_holidays', CompanyHolidaysSchema, 'company_holidays');

export default CompanyHolidaysModel;
