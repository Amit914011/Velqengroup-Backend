import mongoose, { Schema, Model } from 'mongoose';

export interface ISalaryRecords {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  amount?: number;
  month?: string;
  dueDate?: string;
  status?: string;
  notes?: string;
  adminRemarks?: string;
  approvedByName?: string;
  approvedAt?: string;
  paidAt?: string;
  createdByName?: string;
  updatedByName?: string;
  created?: Date;
  updated?: Date;
}

export const SalaryRecordsSchema = new Schema<ISalaryRecords>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  month: { type: String, default: '' , index: true},
  dueDate: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  notes: { type: String, default: '' },
  adminRemarks: { type: String, default: '' },
  approvedByName: { type: String, default: '' },
  approvedAt: { type: String, default: '' },
  paidAt: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'salary_records',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const SalaryRecordsModel = (mongoose.models['salary_records'] as Model<ISalaryRecords>) ||
  mongoose.model<ISalaryRecords>('salary_records', SalaryRecordsSchema, 'salary_records');

export default SalaryRecordsModel;
