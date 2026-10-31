import mongoose, { Schema, Model } from 'mongoose';

export interface IHrRoundRobinState {
  _id: string;
  key?: string;
  enabled?: boolean;
  managerIds?: Record<string, any> | any[] | any;
  currentIndex?: number;
  created?: Date;
  updated?: Date;
}

export const HrRoundRobinStateSchema = new Schema<IHrRoundRobinState>(
  {
  _id: { type: String, required: true },
  key: { type: String, default: '' , index: true},
  enabled: { type: Boolean, default: false },
  managerIds: { type: Schema.Types.Mixed, default: {} },
  currentIndex: { type: Number, default: 0 },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'hr_round_robin_state',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const HrRoundRobinStateModel = (mongoose.models['hr_round_robin_state'] as Model<IHrRoundRobinState>) ||
  mongoose.model<IHrRoundRobinState>('hr_round_robin_state', HrRoundRobinStateSchema, 'hr_round_robin_state');

export default HrRoundRobinStateModel;
