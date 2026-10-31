import mongoose, { Schema, Model } from 'mongoose';

export interface IOvertimeSettings {
  _id: string;
  holidayMultiplier?: number;
  sundayMultiplier?: number;
  afterShiftMultiplier?: number;
  active?: boolean;
  updatedByName?: string;
  created?: Date;
  updated?: Date;
}

export const OvertimeSettingsSchema = new Schema<IOvertimeSettings>(
  {
  _id: { type: String, required: true },
  holidayMultiplier: { type: Number, default: 0 },
  sundayMultiplier: { type: Number, default: 0 },
  afterShiftMultiplier: { type: Number, default: 0 },
  active: { type: Boolean, default: false },
  updatedByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'overtime_settings',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);



export const OvertimeSettingsModel = (mongoose.models['overtime_settings'] as Model<IOvertimeSettings>) ||
  mongoose.model<IOvertimeSettings>('overtime_settings', OvertimeSettingsSchema, 'overtime_settings');

export default OvertimeSettingsModel;
