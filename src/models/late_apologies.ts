import mongoose, { Schema, Model } from 'mongoose';

export interface ILateApologies {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  date?: string;
  loginAt?: string;
  shiftStart?: string;
  lateMinutes?: number;
  reason?: string;
  apologyMessage?: string;
  attachment?: string;
  status?: string;
  adminRemark?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  created?: Date;
  updated?: Date;
}

export const LateApologiesSchema = new Schema<ILateApologies>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  date: { type: String, default: '' , index: true},
  loginAt: { type: String, default: '' },
  shiftStart: { type: String, default: '' },
  lateMinutes: { type: Number, default: 0 },
  reason: { type: String, default: '' },
  apologyMessage: { type: String, default: '' },
  attachment: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  adminRemark: { type: String, default: '' },
  reviewedByName: { type: String, default: '' },
  reviewedAt: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'late_apologies',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LateApologiesModel = (mongoose.models['late_apologies'] as Model<ILateApologies>) ||
  mongoose.model<ILateApologies>('late_apologies', LateApologiesSchema, 'late_apologies');

export default LateApologiesModel;
