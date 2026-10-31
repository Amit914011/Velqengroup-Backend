import mongoose, { Schema, Model } from 'mongoose';

export interface IPaymentReceipts {
  _id: string;
  receiptNumber?: string;
  employee?: string | null;
  employeeName?: string;
  amount?: number;
  paymentDate?: string;
  paymentMethod?: string;
  reference?: string;
  salarySlip?: string | null;
  receivedBy?: string;
  remarks?: string;
  department?: string;
  subCategory?: string;
  clientName?: string;
  clientIdProofType?: string;
  approvalStatus?: string;
  approvedBy?: string;
  approvedAt?: string;
  clientIdProofNumber?: string;
  idProofFile?: string;
  createdByName?: string;
  createdByEmail?: string;
  auditLog?: Record<string, any> | any[] | any;
  paymentScreenshot?: string;
  paymentMethodOther?: string;
  gstNumber?: string;
  deleted?: boolean;
  deletedAt?: string;
  deletedByName?: string;
  updatedByName?: string;
  paymentType?: string;
  linkedClientId?: string | null;
  clientPhone?: string;
  clientEmail?: string;
  clientCode?: string;
  linkedExpense?: string | null;
  tax_applicable?: boolean;
  tax_rate?: number;
  tax_treatment?: string;
  taxable_amount?: number;
  tax_amount?: number;
  round_off?: number;
  grand_total?: number;
  amount_paid?: number;
  balance_due?: number;
  pos_applicable?: boolean;
  pos_mdr_rate?: number;
  pos_mdr_gst_rate?: number;
  pos_mdr_amount?: number;
  pos_mdr_gst_amount?: number;
  pos_total_charges?: number;
  pos_net_settlement?: number;
  approvedById?: string | null;
  approvedByRole?: string;
  approvedByEmail?: string;
  created?: Date;
  updated?: Date;
}

export const PaymentReceiptsSchema = new Schema<IPaymentReceipts>(
  {
  _id: { type: String, required: true },
  receiptNumber: { type: String, default: '' , index: true},
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  paymentDate: { type: String, default: '' },
  paymentMethod: { type: String, default: '' },
  reference: { type: String, default: '' },
  salarySlip: { type: String, ref: 'salary_slips', default: null },
  receivedBy: { type: String, default: '' },
  remarks: { type: String, default: '' },
  department: { type: String, default: '' },
  subCategory: { type: String, default: '' },
  clientName: { type: String, default: '' },
  clientIdProofType: { type: String, default: '' },
  approvalStatus: { type: String, default: '' },
  approvedBy: { type: String, default: '' },
  approvedAt: { type: String, default: '' },
  clientIdProofNumber: { type: String, default: '' },
  idProofFile: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  createdByEmail: { type: String, default: '' },
  auditLog: { type: Schema.Types.Mixed, default: {} },
  paymentScreenshot: { type: String, default: '' },
  paymentMethodOther: { type: String, default: '' },
  gstNumber: { type: String, default: '' },
  deleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: String, default: '' },
  deletedByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  paymentType: { type: String, default: '' },
  linkedClientId: { type: String, ref: 'users', default: null },
  clientPhone: { type: String, default: '' },
  clientEmail: { type: String, default: '' },
  clientCode: { type: String, default: '' },
  linkedExpense: { type: String, ref: 'company_expenses', default: null },
  tax_applicable: { type: Boolean, default: false },
  tax_rate: { type: Number, default: 0 },
  tax_treatment: { type: String, default: '' },
  taxable_amount: { type: Number, default: 0 },
  tax_amount: { type: Number, default: 0 },
  round_off: { type: Number, default: 0 },
  grand_total: { type: Number, default: 0 },
  amount_paid: { type: Number, default: 0 },
  balance_due: { type: Number, default: 0 },
  pos_applicable: { type: Boolean, default: false },
  pos_mdr_rate: { type: Number, default: 0 },
  pos_mdr_gst_rate: { type: Number, default: 0 },
  pos_mdr_amount: { type: Number, default: 0 },
  pos_mdr_gst_amount: { type: Number, default: 0 },
  pos_total_charges: { type: Number, default: 0 },
  pos_net_settlement: { type: Number, default: 0 },
  approvedById: { type: String, ref: 'users', default: null },
  approvedByRole: { type: String, default: '' },
  approvedByEmail: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'payment_receipts',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const PaymentReceiptsModel = (mongoose.models['payment_receipts'] as Model<IPaymentReceipts>) ||
  mongoose.model<IPaymentReceipts>('payment_receipts', PaymentReceiptsSchema, 'payment_receipts');

export default PaymentReceiptsModel;
