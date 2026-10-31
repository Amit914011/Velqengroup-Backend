import mongoose, { Schema, Model } from 'mongoose';

export interface IWeeklyAcknowledgements {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  weekStart?: string;
  targetTotal?: number;
  achieved?: number;
  remaining?: number;
  commitment?: string;
  created?: Date;
  updated?: Date;
}

export const WeeklyAcknowledgementsSchema = new Schema<IWeeklyAcknowledgements>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  weekStart: { type: String, default: '' },
  targetTotal: { type: Number, default: 0 },
  achieved: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 },
  commitment: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'weekly_acknowledgements',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

WeeklyAcknowledgementsSchema.index({"employee":1,"weekStart":1});

export const WeeklyAcknowledgementsModel = (mongoose.models['weekly_acknowledgements'] as Model<IWeeklyAcknowledgements>) ||
  mongoose.model<IWeeklyAcknowledgements>('weekly_acknowledgements', WeeklyAcknowledgementsSchema, 'weekly_acknowledgements');

export default WeeklyAcknowledgementsModel;
