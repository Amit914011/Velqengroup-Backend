import mongoose, { Schema, Model } from 'mongoose';

export interface IManagerLocationLog {
  _id: string;
  manager?: string | null;
  managerName?: string;
  event?: string;
  date?: string;
  time?: string;
  timestamp?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  locationSource?: string;
  locationNote?: string;
  module?: string;
  actionType?: string;
  referenceId?: string;
  meta?: Record<string, any> | any[] | any;
  created?: Date;
  updated?: Date;
}

export const ManagerLocationLogSchema = new Schema<IManagerLocationLog>(
  {
  _id: { type: String, required: true },
  manager: { type: String, ref: 'users', default: null },
  managerName: { type: String, default: '' },
  event: { type: String, default: '' , index: true},
  date: { type: String, default: '' },
  time: { type: String, default: '' },
  timestamp: { type: String, default: '' },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  locationSource: { type: String, default: '' },
  locationNote: { type: String, default: '' },
  module: { type: String, default: '' },
  actionType: { type: String, default: '' },
  referenceId: { type: String, default: '' },
  meta: { type: Schema.Types.Mixed, default: {} },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'manager_location_log',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

ManagerLocationLogSchema.index({"manager":1,"date":1});

export const ManagerLocationLogModel = (mongoose.models['manager_location_log'] as Model<IManagerLocationLog>) ||
  mongoose.model<IManagerLocationLog>('manager_location_log', ManagerLocationLogSchema, 'manager_location_log');

export default ManagerLocationLogModel;
