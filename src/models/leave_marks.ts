import mongoose, { Schema, Model } from 'mongoose';

export interface ILeaveMarks {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  date?: string;
  mark?: string;
  note?: string;
  deductionDays?: number;
  sandwichGroup?: string;
  sourceRequest?: string;
  createdByName?: string;
  updatedByName?: string;
  created?: Date;
  updated?: Date;
}

export const LeaveMarksSchema = new Schema<ILeaveMarks>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null, index: true },
  employeeName: { type: String, default: '' },
  date: { type: String, default: '' },
  mark: { type: String, default: '' },
  note: { type: String, default: '' },
  deductionDays: { type: Number, default: 0 },
  sandwichGroup: { type: String, default: '' },
  sourceRequest: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'leave_marks',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

LeaveMarksSchema.index({"employee":1,"date":1});

export const LeaveMarksModel = (mongoose.models['leave_marks'] as Model<ILeaveMarks>) ||
  mongoose.model<ILeaveMarks>('leave_marks', LeaveMarksSchema, 'leave_marks');

export default LeaveMarksModel;
