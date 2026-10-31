import mongoose, { Schema, Model } from 'mongoose';

export interface IPaymentReferences {
  _id: string;
  clientName?: string;
  clientCode?: string;
  phone?: string;
  amountPaid?: number;
  paymentMethod?: string;
  transactionRef?: string;
  paymentDate?: string;
  screenshot?: string;
  status?: string;
  notes?: string;
  ip?: string;
  userAgent?: string;
  created?: Date;
  updated?: Date;
}

export const PaymentReferencesSchema = new Schema<IPaymentReferences>(
  {
  _id: { type: String, required: true },
  clientName: { type: String, default: '' },
  clientCode: { type: String, default: '' },
  phone: { type: String, default: '' },
  amountPaid: { type: Number, default: 0 },
  paymentMethod: { type: String, default: '' },
  transactionRef: { type: String, default: '' , index: true},
  paymentDate: { type: String, default: '' },
  screenshot: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  notes: { type: String, default: '' },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'payment_references',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const PaymentReferencesModel = (mongoose.models['payment_references'] as Model<IPaymentReferences>) ||
  mongoose.model<IPaymentReferences>('payment_references', PaymentReferencesSchema, 'payment_references');

export default PaymentReferencesModel;
