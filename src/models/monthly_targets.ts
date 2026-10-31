import mongoose, { Schema, Model } from 'mongoose';

export interface IMonthlyTargets {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  department?: string;
  month?: string;
  leadsTarget?: number;
  visitsTarget?: number;
  callsTarget?: number;
  revenueTarget?: number;
  enrollmentsTarget?: number;
  created?: Date;
  updated?: Date;
}

export const MonthlyTargetsSchema = new Schema<IMonthlyTargets>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  department: { type: String, default: '' },
  month: { type: String, default: '' },
  leadsTarget: { type: Number, default: 0 },
  visitsTarget: { type: Number, default: 0 },
  callsTarget: { type: Number, default: 0 },
  revenueTarget: { type: Number, default: 0 },
  enrollmentsTarget: { type: Number, default: 0 },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'monthly_targets',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

MonthlyTargetsSchema.index({"employee":1,"month":1});

export const MonthlyTargetsModel = (mongoose.models['monthly_targets'] as Model<IMonthlyTargets>) ||
  mongoose.model<IMonthlyTargets>('monthly_targets', MonthlyTargetsSchema, 'monthly_targets');

export default MonthlyTargetsModel;
