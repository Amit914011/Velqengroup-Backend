import mongoose, { Schema, Model } from 'mongoose';

export interface IAttendance {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  date?: string;
  loginAt?: string;
  logoutAt?: string;
  shiftStart?: string;
  shiftEnd?: string;
  lateMinutes?: number;
  earlyMinutes?: number;
  minutesLogged?: number;
  signedOut?: boolean;
  baseMinutesLogged?: number;
  lunchStartAt?: string;
  lunchEndAt?: string;
  lunchMinutes?: number;
  lunchExceeded?: boolean;
  lunchUsedMinutes?: number;
  bodApplied?: boolean;
  bodReason?: string;
  bodBy?: string | null;
  bodByName?: string;
  bodAt?: string;
  createdByName?: string;
  updatedByName?: string;
  productiveMinutes?: number;
  breakMinutes?: number;
  created?: Date;
  updated?: Date;
}

export const AttendanceSchema = new Schema<IAttendance>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null, index: true },
  employeeName: { type: String, default: '' },
  date: { type: String, default: '', index: true },
  loginAt: { type: String, default: '' },
  logoutAt: { type: String, default: '' },
  shiftStart: { type: String, default: '' },
  shiftEnd: { type: String, default: '' },
  lateMinutes: { type: Number, default: 0 },
  earlyMinutes: { type: Number, default: 0 },
  minutesLogged: { type: Number, default: 0 },
  signedOut: { type: Boolean, default: false },
  baseMinutesLogged: { type: Number, default: 0 },
  lunchStartAt: { type: String, default: '', index: true },
  lunchEndAt: { type: String, default: '' },
  lunchMinutes: { type: Number, default: 0 },
  lunchExceeded: { type: Boolean, default: false },
  lunchUsedMinutes: { type: Number, default: 0 },
  bodApplied: { type: Boolean, default: false },
  bodReason: { type: String, default: '' },
  bodBy: { type: String, ref: 'users', default: null },
  bodByName: { type: String, default: '' },
  bodAt: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  productiveMinutes: { type: Number, default: 0 },
  breakMinutes: { type: Number, default: 0 },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'attendance',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

AttendanceSchema.index({"employee":1,"date":1});

export const AttendanceModel = (mongoose.models['attendance'] as Model<IAttendance>) ||
  mongoose.model<IAttendance>('attendance', AttendanceSchema, 'attendance');

export default AttendanceModel;
