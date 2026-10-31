import mongoose, { Schema, Model } from 'mongoose';

export interface IRealtimeHeartbeat {
  _id: string;
  tick?: number;
  updatedBy?: string;
  updatedByName?: string;
  created?: Date;
  updated?: Date;
}

export const RealtimeHeartbeatSchema = new Schema<IRealtimeHeartbeat>(
  {
  _id: { type: String, required: true },
  tick: { type: Number, default: 0 },
  updatedBy: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'realtime_heartbeat',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);



export const RealtimeHeartbeatModel = (mongoose.models['realtime_heartbeat'] as Model<IRealtimeHeartbeat>) ||
  mongoose.model<IRealtimeHeartbeat>('realtime_heartbeat', RealtimeHeartbeatSchema, 'realtime_heartbeat');

export default RealtimeHeartbeatModel;
