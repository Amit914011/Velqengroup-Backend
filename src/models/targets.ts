import mongoose, { Schema, Model } from 'mongoose';

export interface ITargets {
  _id: string;
  employee?: string | null;
  title?: string;
  period?: string;
  targetValue?: number;
  achievedValue?: number;
  lateComings?: number;
  visits?: number;
  leaves?: number;
  allowedLeaves?: number;
  enrollmentTarget?: number;
  enrollmentAchieved?: number;
  createdByName?: string;
  updatedByName?: string;
  created?: Date;
  updated?: Date;
}

export const TargetsSchema = new Schema<ITargets>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  title: { type: String, default: '' },
  period: { type: String, default: '' },
  targetValue: { type: Number, default: 0 },
  achievedValue: { type: Number, default: 0 },
  lateComings: { type: Number, default: 0 },
  visits: { type: Number, default: 0 },
  leaves: { type: Number, default: 0 },
  allowedLeaves: { type: Number, default: 0 },
  enrollmentTarget: { type: Number, default: 0 },
  enrollmentAchieved: { type: Number, default: 0 },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'targets',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const TargetsModel = (mongoose.models['targets'] as Model<ITargets>) ||
  mongoose.model<ITargets>('targets', TargetsSchema, 'targets');

export default TargetsModel;
