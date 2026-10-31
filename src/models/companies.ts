import mongoose, { Schema, Model } from 'mongoose';

export interface ICompanies {
  _id: string;
  name?: string;
  companyCode?: string;
  department?: string;
  hasLedger?: boolean;
  businessStatus?: string;
  description?: string;
  order?: number;
  parent?: string | null;
  created?: Date;
  updated?: Date;
}

export const CompaniesSchema = new Schema<ICompanies>(
  {
  _id: { type: String, required: true },
  name: { type: String, default: '' },
  companyCode: { type: String, default: '' , index: true},
  department: { type: String, default: '' },
  hasLedger: { type: Boolean, default: false },
  businessStatus: { type: String, default: '' },
  description: { type: String, default: '' },
  order: { type: Number, default: 0, index: true },
  parent: { type: String, ref: 'companies', default: null },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'companies',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const CompaniesModel = (mongoose.models['companies'] as Model<ICompanies>) ||
  mongoose.model<ICompanies>('companies', CompaniesSchema, 'companies');

export default CompaniesModel;
