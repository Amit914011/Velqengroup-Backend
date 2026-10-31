import mongoose, { Schema, Model } from 'mongoose';

export interface IEmployeeBreaks {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  date?: string;
  breakType?: string;
  requestedMinutes?: number;
  status?: string;
  startAt?: string;
  endAt?: string;
  actualMinutes?: number;
  reason?: string;
  adminNote?: string;
  loginLocked?: boolean;
  unlockedBy?: string | null;
  unlockedByName?: string;
  unlockedAt?: string;
  unlockNote?: string;
  created?: Date;
  updated?: Date;
}

export const EmployeeBreaksSchema = new Schema<IEmployeeBreaks>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  date: { type: String, default: '' , index: true},
  breakType: { type: String, default: '' },
  requestedMinutes: { type: Number, default: 0 },
  status: { type: String, default: '' },
  startAt: { type: String, default: '' },
  endAt: { type: String, default: '' },
  actualMinutes: { type: Number, default: 0 },
  reason: { type: String, default: '' },
  adminNote: { type: String, default: '' },
  loginLocked: { type: Boolean, default: false },
  unlockedBy: { type: String, ref: 'users', default: null },
  unlockedByName: { type: String, default: '' },
  unlockedAt: { type: String, default: '' },
  unlockNote: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'employee_breaks',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const EmployeeBreaksModel = (mongoose.models['employee_breaks'] as Model<IEmployeeBreaks>) ||
  mongoose.model<IEmployeeBreaks>('employee_breaks', EmployeeBreaksSchema, 'employee_breaks');

export default EmployeeBreaksModel;
