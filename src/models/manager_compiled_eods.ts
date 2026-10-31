import mongoose, { Schema, Model } from 'mongoose';

export interface IManagerCompiledEods {
  _id: string;
  manager?: string | null;
  managerName?: string;
  managerDepartment?: string;
  title?: string;
  fromDate?: string;
  toDate?: string;
  teamMembers?: Record<string, any> | any[] | any;
  entries?: Record<string, any> | any[] | any;
  totalEntries?: number;
  status?: string;
  compiledAt?: string;
  sentAt?: string;
  viewedAt?: string;
  viewedByName?: string;
  summary?: string;
  created?: Date;
  updated?: Date;
}

export const ManagerCompiledEodsSchema = new Schema<IManagerCompiledEods>(
  {
  _id: { type: String, required: true },
  manager: { type: String, ref: 'users', default: null , index: true},
  managerName: { type: String, default: '' },
  managerDepartment: { type: String, default: '' },
  title: { type: String, default: '' },
  fromDate: { type: String, default: '' },
  toDate: { type: String, default: '' },
  teamMembers: { type: Schema.Types.Mixed, default: {} },
  entries: { type: Schema.Types.Mixed, default: {} },
  totalEntries: { type: Number, default: 0 },
  status: { type: String, default: '' , index: true},
  compiledAt: { type: String, default: '' },
  sentAt: { type: String, default: '' },
  viewedAt: { type: String, default: '' },
  viewedByName: { type: String, default: '' },
  summary: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'manager_compiled_eods',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const ManagerCompiledEodsModel = (mongoose.models['manager_compiled_eods'] as Model<IManagerCompiledEods>) ||
  mongoose.model<IManagerCompiledEods>('manager_compiled_eods', ManagerCompiledEodsSchema, 'manager_compiled_eods');

export default ManagerCompiledEodsModel;
