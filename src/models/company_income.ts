import mongoose, { Schema, Model } from 'mongoose';

export interface ICompanyIncome {
  _id: string;
  title?: string;
  source?: string;
  category?: string;
  incomeDate?: string;
  amount?: number;
  note?: string;
  history?: Record<string, any> | any[] | any;
  department?: string;
  linkedLead?: string;
  paymentMethod?: string;
  paymentMethodOther?: string;
  submittedBy?: string | null;
  submittedByName?: string;
  deleted?: boolean;
  deletedAt?: string;
  deletedByName?: string;
  clientId?: string | null;
  clientCode?: string;
  clientName?: string;
  attachment?: string;
  recipientId?: string | null;
  recipientName?: string;
  createdByName?: string;
  updatedByName?: string;
  created?: Date;
  updated?: Date;
}

export const CompanyIncomeSchema = new Schema<ICompanyIncome>(
  {
  _id: { type: String, required: true },
  title: { type: String, default: '' },
  source: { type: String, default: '' },
  category: { type: String, default: '' },
  incomeDate: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  note: { type: String, default: '' },
  history: { type: Schema.Types.Mixed, default: {} },
  department: { type: String, default: '' },
  linkedLead: { type: String, default: '' },
  paymentMethod: { type: String, default: '' },
  paymentMethodOther: { type: String, default: '' },
  submittedBy: { type: String, ref: 'users', default: null },
  submittedByName: { type: String, default: '' },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: String, default: '' },
  deletedByName: { type: String, default: '' },
  clientId: { type: String, ref: 'users', default: null },
  clientCode: { type: String, default: '' },
  clientName: { type: String, default: '' },
  attachment: { type: String, default: '' },
  recipientId: { type: String, ref: 'recipients', default: null },
  recipientName: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'company_income',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);



export const CompanyIncomeModel = (mongoose.models['company_income'] as Model<ICompanyIncome>) ||
  mongoose.model<ICompanyIncome>('company_income', CompanyIncomeSchema, 'company_income');

export default CompanyIncomeModel;
