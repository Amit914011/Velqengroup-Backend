import mongoose, { Schema, Model } from 'mongoose';

export interface IFinancialTransactions {
  _id: string;
  transaction_type?: string;
  source_module?: string;
  source_record_id?: string;
  department?: string;
  employee_id?: string;
  manager_id?: string;
  client_id?: string;
  receipt_id?: string;
  expense_id?: string;
  salary_id?: string;
  amount?: number;
  tax_amount?: number;
  grand_total?: number;
  payment_method?: string;
  status?: string;
  description?: string;
  reference_number?: string;
  transaction_date?: string;
  created_by?: string;
  created_by_name?: string;
  approved_by?: string;
  approved_by_name?: string;
  is_deleted?: boolean;
  is_duplicate_suppressed?: boolean;
  created?: Date;
  updated?: Date;
}

export const FinancialTransactionsSchema = new Schema<IFinancialTransactions>(
  {
  _id: { type: String, required: true },
  transaction_type: { type: String, default: '' , index: true},
  source_module: { type: String, default: '' },
  source_record_id: { type: String, default: '' },
  department: { type: String, default: '' , index: true},
  employee_id: { type: String, default: '' },
  manager_id: { type: String, default: '' },
  client_id: { type: String, default: '' },
  receipt_id: { type: String, default: '' },
  expense_id: { type: String, default: '' },
  salary_id: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  tax_amount: { type: Number, default: 0 },
  grand_total: { type: Number, default: 0 },
  payment_method: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  description: { type: String, default: '' },
  reference_number: { type: String, default: '' },
  transaction_date: { type: String, default: '' , index: true},
  created_by: { type: String, default: '' },
  created_by_name: { type: String, default: '' },
  approved_by: { type: String, default: '' },
  approved_by_name: { type: String, default: '' },
  is_deleted: { type: Boolean, default: false },
  is_duplicate_suppressed: { type: Boolean, default: false },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'financial_transactions',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

FinancialTransactionsSchema.index({"source_module":1,"source_record_id":1});

export const FinancialTransactionsModel = (mongoose.models['financial_transactions'] as Model<IFinancialTransactions>) ||
  mongoose.model<IFinancialTransactions>('financial_transactions', FinancialTransactionsSchema, 'financial_transactions');

export default FinancialTransactionsModel;
