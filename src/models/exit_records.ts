import mongoose, { Schema, Model } from 'mongoose';

export interface IExitRecords {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  exitDate?: string;
  reason?: string;
  ffDocument?: string;
  nocDocument?: string;
  status?: string;
  remarks?: string;
  employeeStatus?: string;
  createdByName?: string;
  updatedByName?: string;
  acknowledgementDocument?: string;
  created?: Date;
  updated?: Date;
}

export const ExitRecordsSchema = new Schema<IExitRecords>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  exitDate: { type: String, default: '' },
  reason: { type: String, default: '' },
  ffDocument: { type: String, default: '' },
  nocDocument: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  remarks: { type: String, default: '' },
  employeeStatus: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  acknowledgementDocument: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'exit_records',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const ExitRecordsModel = (mongoose.models['exit_records'] as Model<IExitRecords>) ||
  mongoose.model<IExitRecords>('exit_records', ExitRecordsSchema, 'exit_records');

export default ExitRecordsModel;
