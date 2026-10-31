import mongoose, { Schema, Model } from 'mongoose';

export interface ISaturdaySpecialConfig {
  _id: string;
  enabled?: boolean;
  dayOfWeek?: number;
  popupHour?: number;
  popupMinute?: number;
  lockStartHour?: number;
  lockStartMinute?: number;
  lockEndHour?: number;
  lockEndMinute?: number;
  popupTitle?: string;
  popupSubtitle?: string;
  popupQuote?: string;
  popupTimeLabel?: string;
  popupTimeRange?: string;
  popupActivities?: string;
  popupCta?: string;
  popupFooter?: string;
  popupButton?: string;
  lockTitle?: string;
  lockSubtitle?: string;
  lockTimeRange?: string;
  lockActivities?: string;
  lockNote?: string;
  lockFooter?: string;
  welcomeTitle?: string;
  welcomeBody?: string;
  welcomeInstruction?: string;
  welcomeButton?: string;
  created?: Date;
  updated?: Date;
}

export const SaturdaySpecialConfigSchema = new Schema<ISaturdaySpecialConfig>(
  {
  _id: { type: String, required: true },
  enabled: { type: Boolean, default: false },
  dayOfWeek: { type: Number, default: 0 },
  popupHour: { type: Number, default: 0 },
  popupMinute: { type: Number, default: 0 },
  lockStartHour: { type: Number, default: 0 },
  lockStartMinute: { type: Number, default: 0 },
  lockEndHour: { type: Number, default: 0 },
  lockEndMinute: { type: Number, default: 0 },
  popupTitle: { type: String, default: '' },
  popupSubtitle: { type: String, default: '' },
  popupQuote: { type: String, default: '' },
  popupTimeLabel: { type: String, default: '' },
  popupTimeRange: { type: String, default: '' },
  popupActivities: { type: String, default: '' },
  popupCta: { type: String, default: '' },
  popupFooter: { type: String, default: '' },
  popupButton: { type: String, default: '' },
  lockTitle: { type: String, default: '' },
  lockSubtitle: { type: String, default: '' },
  lockTimeRange: { type: String, default: '' },
  lockActivities: { type: String, default: '' },
  lockNote: { type: String, default: '' },
  lockFooter: { type: String, default: '' },
  welcomeTitle: { type: String, default: '' },
  welcomeBody: { type: String, default: '' },
  welcomeInstruction: { type: String, default: '' },
  welcomeButton: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'saturday_special_config',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);



export const SaturdaySpecialConfigModel = (mongoose.models['saturday_special_config'] as Model<ISaturdaySpecialConfig>) ||
  mongoose.model<ISaturdaySpecialConfig>('saturday_special_config', SaturdaySpecialConfigSchema, 'saturday_special_config');

export default SaturdaySpecialConfigModel;
