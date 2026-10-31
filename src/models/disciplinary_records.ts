import mongoose, { Schema, Model } from 'mongoose';

export interface IDisciplinaryRecords {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  type?: string;
  severity?: string;
  title?: string;
  description?: string;
  date?: string;
  createdByName?: string;
  updatedByName?: string;
  created?: Date;
  updated?: Date;
}

export const DisciplinaryRecordsSchema = new Schema<IDisciplinaryRecords>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  type: { type: String, default: '' , index: true},
  severity: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  date: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'disciplinary_records',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const DisciplinaryRecordsModel = (mongoose.models['disciplinary_records'] as Model<IDisciplinaryRecords>) ||
  mongoose.model<IDisciplinaryRecords>('disciplinary_records', DisciplinaryRecordsSchema, 'disciplinary_records');

export default DisciplinaryRecordsModel;
