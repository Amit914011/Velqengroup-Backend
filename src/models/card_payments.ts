import mongoose, { Schema, Model } from 'mongoose';

export interface ICardPayments {
  _id: string;
  orderId?: string;
  providerTransactionId?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  status?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  clientId?: string;
  payerId?: string;
  failureReason?: string;
  verifiedAt?: string;
  webhookEventId?: string;
  ip?: string;
  userAgent?: string;
  created?: Date;
  updated?: Date;
}

export const CardPaymentsSchema = new Schema<ICardPayments>(
  {
  _id: { type: String, required: true },
  orderId: { type: String, default: '' , index: true},
  providerTransactionId: { type: String, default: '' , index: true},
  amount: { type: Number, default: 0 },
  currency: { type: String, default: '' },
  paymentMethod: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  payerName: { type: String, default: '' },
  payerEmail: { type: String, default: '' },
  payerPhone: { type: String, default: '' },
  clientId: { type: String, default: '' },
  payerId: { type: String, default: '' },
  failureReason: { type: String, default: '' },
  verifiedAt: { type: String, default: '' },
  webhookEventId: { type: String, default: '' , index: true},
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'card_payments',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const CardPaymentsModel = (mongoose.models['card_payments'] as Model<ICardPayments>) ||
  mongoose.model<ICardPayments>('card_payments', CardPaymentsSchema, 'card_payments');

export default CardPaymentsModel;
