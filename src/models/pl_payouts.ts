import mongoose, { Schema, Model } from 'mongoose';

export interface IPlPayouts {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  financialYear?: string;
  unconsumedLeaves?: number;
  perDayRate?: number;
  amount?: number;
  note?: string;
  created?: Date;
  updated?: Date;
}

export const PlPayoutsSchema = new Schema<IPlPayouts>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  financialYear: { type: String, default: '' },
  unconsumedLeaves: { type: Number, default: 0 },
  perDayRate: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  note: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'pl_payouts',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

PlPayoutsSchema.index({"employee":1,"financialYear":1});

export const PlPayoutsModel = (mongoose.models['pl_payouts'] as Model<IPlPayouts>) ||
  mongoose.model<IPlPayouts>('pl_payouts', PlPayoutsSchema, 'pl_payouts');

export default PlPayoutsModel;
