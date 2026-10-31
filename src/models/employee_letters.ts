import mongoose, { Schema, Model } from 'mongoose';

export interface IEmployeeLetters {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  letterType?: string;
  status?: string;
  eligibleDate?: string;
  generatedAt?: string;
  generatedBy?: string | null;
  generatedByName?: string;
  version?: number;
  previousVersionId?: string;
  snapshot?: Record<string, any> | any[] | any;
  letterHtml?: string;
  reviewReason?: string;
  relievingDate?: string;
  lastWorkingDay?: string;
  validationIssues?: Record<string, any> | any[] | any;
  created?: Date;
  updated?: Date;
}

export const EmployeeLettersSchema = new Schema<IEmployeeLetters>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  employeeId: { type: String, default: '' },
  department: { type: String, default: '' , index: true},
  designation: { type: String, default: '' },
  letterType: { type: String, default: '' , index: true},
  status: { type: String, default: '' , index: true},
  eligibleDate: { type: String, default: '' },
  generatedAt: { type: String, default: '' },
  generatedBy: { type: String, ref: 'users', default: null },
  generatedByName: { type: String, default: '' },
  version: { type: Number, default: 0 },
  previousVersionId: { type: String, default: '' },
  snapshot: { type: Schema.Types.Mixed, default: {} },
  letterHtml: { type: String, default: '' },
  reviewReason: { type: String, default: '' },
  relievingDate: { type: String, default: '' },
  lastWorkingDay: { type: String, default: '' },
  validationIssues: { type: Schema.Types.Mixed, default: {} },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'employee_letters',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const EmployeeLettersModel = (mongoose.models['employee_letters'] as Model<IEmployeeLetters>) ||
  mongoose.model<IEmployeeLetters>('employee_letters', EmployeeLettersSchema, 'employee_letters');

export default EmployeeLettersModel;
