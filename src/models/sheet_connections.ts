import mongoose, { Schema, Model } from 'mongoose';

export interface ISheetConnections {
  _id: string;
  name?: string;
  department?: string;
  subCategory?: string;
  token?: string;
  employees?: Record<string, any> | any[] | any;
  columnMap?: Record<string, any> | any[] | any;
  rotationIndex?: number;
  defaultStatus?: string;
  active?: boolean;
  leadsCreated?: number;
  lastLeadName?: string;
  lastLeadAt?: string;
  sheetUrl?: string;
  sheetName?: string;
  purpose?: string;
  position?: string;
  assignedHiringManager?: string | null;
  assignmentMode?: string;
  hiringManagers?: Record<string, any> | any[] | any;
  hiringColumnMap?: Record<string, any> | any[] | any;
  hiringRotationIndex?: number;
  candidatesCreated?: number;
  created?: Date;
  updated?: Date;
}

export const SheetConnectionsSchema = new Schema<ISheetConnections>(
  {
  _id: { type: String, required: true },
  name: { type: String, default: '' },
  department: { type: String, default: '' },
  subCategory: { type: String, default: '' },
  token: { type: String, default: '' , index: true},
  employees: { type: Schema.Types.Mixed, default: {} },
  columnMap: { type: Schema.Types.Mixed, default: {} },
  rotationIndex: { type: Number, default: 0 },
  defaultStatus: { type: String, default: '' },
  active: { type: Boolean, default: false },
  leadsCreated: { type: Number, default: 0 },
  lastLeadName: { type: String, default: '' },
  lastLeadAt: { type: String, default: '' },
  sheetUrl: { type: String, default: '' },
  sheetName: { type: String, default: '' },
  purpose: { type: String, default: '', index: true },
  position: { type: String, default: '' },
  assignedHiringManager: { type: String, ref: 'users', default: null },
  assignmentMode: { type: String, default: '' },
  hiringManagers: { type: Schema.Types.Mixed, default: {} },
  hiringColumnMap: { type: Schema.Types.Mixed, default: {} },
  hiringRotationIndex: { type: Number, default: 0 },
  candidatesCreated: { type: Number, default: 0 },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'sheet_connections',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const SheetConnectionsModel = (mongoose.models['sheet_connections'] as Model<ISheetConnections>) ||
  mongoose.model<ISheetConnections>('sheet_connections', SheetConnectionsSchema, 'sheet_connections');

export default SheetConnectionsModel;
