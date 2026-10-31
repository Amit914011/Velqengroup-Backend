import mongoose, { Schema, Model } from 'mongoose';

export interface IAllocationState {
  _id: string;
  key?: string;
  employee_ids?: Record<string, any> | any[] | any;
  current_index?: number;
  history?: Record<string, any> | any[] | any;
  last_updated?: string;
  created?: Date;
  updated?: Date;
}

export const AllocationStateSchema = new Schema<IAllocationState>(
  {
  _id: { type: String, required: true },
  key: { type: String, default: '' , index: true},
  employee_ids: { type: Schema.Types.Mixed, default: {} },
  current_index: { type: Number, default: 0 },
  history: { type: Schema.Types.Mixed, default: {} },
  last_updated: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'allocation_state',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const AllocationStateModel = (mongoose.models['allocation_state'] as Model<IAllocationState>) ||
  mongoose.model<IAllocationState>('allocation_state', AllocationStateSchema, 'allocation_state');

export default AllocationStateModel;
