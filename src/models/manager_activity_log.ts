import mongoose, { Schema, Model } from 'mongoose';

export interface IManagerActivityLog {
  _id: string;
  manager?: string | null;
  managerName?: string;
  date?: string;
  time?: string;
  timestamp?: string;
  module?: string;
  actionType?: string;
  referenceId?: string;
  relatedRecordId?: string;
  relatedName?: string;
  description?: string;
  status?: string;
  meta?: Record<string, any> | any[] | any;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  locationSource?: string;
  locationNote?: string;
  created?: Date;
  updated?: Date;
}

export const ManagerActivityLogSchema = new Schema<IManagerActivityLog>(
  {
  _id: { type: String, required: true },
  manager: { type: String, ref: 'users', default: null, index: true },
  managerName: { type: String, default: '' },
  date: { type: String, default: '' },
  time: { type: String, default: '' },
  timestamp: { type: String, default: '', index: true },
  module: { type: String, default: '' , index: true},
  actionType: { type: String, default: '' },
  referenceId: { type: String, default: '' },
  relatedRecordId: { type: String, default: '' },
  relatedName: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: String, default: '' },
  meta: { type: Schema.Types.Mixed, default: {} },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  locationAccuracy: { type: Number, default: 0 },
  locationSource: { type: String, default: '' },
  locationNote: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'manager_activity_log',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

ManagerActivityLogSchema.index({"manager":1,"date":1});

export const ManagerActivityLogModel = (mongoose.models['manager_activity_log'] as Model<IManagerActivityLog>) ||
  mongoose.model<IManagerActivityLog>('manager_activity_log', ManagerActivityLogSchema, 'manager_activity_log');

export default ManagerActivityLogModel;
