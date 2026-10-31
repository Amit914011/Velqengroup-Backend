import mongoose, { Schema, Model } from 'mongoose';

export interface IEmployeeDocuments {
  _id: string;
  employee?: string | null;
  documentType?: string;
  documentName?: string;
  file?: string;
  uploadedBy?: string | null;
  uploadedByName?: string;
  fileSize?: number;
  fileType?: string;
  notes?: string;
  created?: Date;
  updated?: Date;
}

export const EmployeeDocumentsSchema = new Schema<IEmployeeDocuments>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  documentType: { type: String, default: '' , index: true},
  documentName: { type: String, default: '' },
  file: { type: String, default: '' },
  uploadedBy: { type: String, ref: 'users', default: null },
  uploadedByName: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
  fileType: { type: String, default: '' },
  notes: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'employee_documents',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const EmployeeDocumentsModel = (mongoose.models['employee_documents'] as Model<IEmployeeDocuments>) ||
  mongoose.model<IEmployeeDocuments>('employee_documents', EmployeeDocumentsSchema, 'employee_documents');

export default EmployeeDocumentsModel;
