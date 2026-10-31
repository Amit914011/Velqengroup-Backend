import mongoose, { Schema, Model } from 'mongoose';

export interface IFmcsaImports {
  _id: string;
  fileName?: string;
  fileSize?: number;
  importDate?: string;
  mode?: string;
  rowsProcessed?: number;
  recordsAdded?: number;
  recordsUpdated?: number;
  duplicates?: number;
  rejectedRows?: number;
  status?: string;
  importedBy?: string | null;
  importedByName?: string;
  notes?: string;
  sampleHeaders?: Record<string, any> | any[] | any;
  created?: Date;
  updated?: Date;
}

export const FmcsaImportsSchema = new Schema<IFmcsaImports>(
  {
  _id: { type: String, required: true },
  fileName: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
  importDate: { type: String, default: '' , index: true},
  mode: { type: String, default: '' },
  rowsProcessed: { type: Number, default: 0 },
  recordsAdded: { type: Number, default: 0 },
  recordsUpdated: { type: Number, default: 0 },
  duplicates: { type: Number, default: 0 },
  rejectedRows: { type: Number, default: 0 },
  status: { type: String, default: '' , index: true},
  importedBy: { type: String, ref: 'users', default: null },
  importedByName: { type: String, default: '' },
  notes: { type: String, default: '' },
  sampleHeaders: { type: Schema.Types.Mixed, default: {} },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'fmcsa_imports',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const FmcsaImportsModel = (mongoose.models['fmcsa_imports'] as Model<IFmcsaImports>) ||
  mongoose.model<IFmcsaImports>('fmcsa_imports', FmcsaImportsSchema, 'fmcsa_imports');

export default FmcsaImportsModel;
