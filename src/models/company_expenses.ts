import mongoose, { Schema, Model } from 'mongoose';

export interface ICompanyExpenses {
  _id: string;
  title?: string;
  category?: string;
  expenseDate?: string;
  amount?: number;
  paymentStatus?: string;
  note?: string;
  history?: Record<string, any> | any[] | any;
  attachment?: string;
  submittedBy?: string | null;
  submittedByEmail?: string;
  linkedEmployee?: string | null;
  linkedEmployeeName?: string;
  paymentType?: string;
  paymentMethod?: string;
  paymentMethodOther?: string;
  reason?: string;
  advanceEmployeeName?: string;
  advanceEmployee?: string;
  deleted?: boolean;
  deletedAt?: string;
  deletedByName?: string;
  recipientId?: string | null;
  recipientName?: string;
  createdByName?: string;
  updatedByName?: string;
  linkedReceipt?: string | null;
  refundReceiptNumber?: string;
  created?: Date;
  updated?: Date;
}

export const CompanyExpensesSchema = new Schema<ICompanyExpenses>(
  {
  _id: { type: String, required: true },
  title: { type: String, default: '' },
  category: { type: String, default: '' },
  expenseDate: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  paymentStatus: { type: String, default: '' },
  note: { type: String, default: '' },
  history: { type: Schema.Types.Mixed, default: {} },
  attachment: { type: String, default: '' },
  submittedBy: { type: String, ref: 'users', default: null },
  submittedByEmail: { type: String, default: '' },
  linkedEmployee: { type: String, ref: 'users', default: null },
  linkedEmployeeName: { type: String, default: '' },
  paymentType: { type: String, default: '' },
  paymentMethod: { type: String, default: '' },
  paymentMethodOther: { type: String, default: '' },
  reason: { type: String, default: '' },
  advanceEmployeeName: { type: String, default: '' },
  advanceEmployee: { type: String, default: '' },
  deleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: String, default: '' },
  deletedByName: { type: String, default: '' },
  recipientId: { type: String, ref: 'recipients', default: null },
  recipientName: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  linkedReceipt: { type: String, ref: 'payment_receipts', default: null },
  refundReceiptNumber: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'company_expenses',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);



export const CompanyExpensesModel = (mongoose.models['company_expenses'] as Model<ICompanyExpenses>) ||
  mongoose.model<ICompanyExpenses>('company_expenses', CompanyExpensesSchema, 'company_expenses');

export default CompanyExpensesModel;
