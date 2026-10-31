import mongoose, { Schema, Model } from 'mongoose';

export interface IEmployeeAdvances {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  amount?: number;
  deductedAmount?: number;
  advanceDate?: string;
  status?: string;
  note?: string;
  history?: Record<string, any> | any[] | any;
  paymentMethod?: string;
  paymentMethodOther?: string;
  deleted?: boolean;
  deletedAt?: string;
  deletedByName?: string;
  createdByName?: string;
  updatedByName?: string;
  created?: Date;
  updated?: Date;
}

export const EmployeeAdvancesSchema = new Schema<IEmployeeAdvances>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  deductedAmount: { type: Number, default: 0 },
  advanceDate: { type: String, default: '' },
  status: { type: String, default: '' },
  note: { type: String, default: '' },
  history: { type: Schema.Types.Mixed, default: {} },
  paymentMethod: { type: String, default: '' },
  paymentMethodOther: { type: String, default: '' },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: String, default: '' },
  deletedByName: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'employee_advances',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const EmployeeAdvancesModel = (mongoose.models['employee_advances'] as Model<IEmployeeAdvances>) ||
  mongoose.model<IEmployeeAdvances>('employee_advances', EmployeeAdvancesSchema, 'employee_advances');

export default EmployeeAdvancesModel;
