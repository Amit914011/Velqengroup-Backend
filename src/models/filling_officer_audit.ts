import mongoose, { Schema, Model } from 'mongoose';

export interface IFillingOfficerAudit {
  _id: string;
  actor?: string | null;
  actorName?: string;
  action?: string;
  lead?: string | null;
  client?: string | null;
  fillingOfficer?: string | null;
  summary?: string;
  meta?: Record<string, any> | any[] | any;
  created?: Date;
  updated?: Date;
}

export const FillingOfficerAuditSchema = new Schema<IFillingOfficerAudit>(
  {
  _id: { type: String, required: true },
  actor: { type: String, ref: 'users', default: null , index: true},
  actorName: { type: String, default: '' },
  action: { type: String, default: '' },
  lead: { type: String, ref: 'leads', default: null , index: true},
  client: { type: String, ref: 'users', default: null },
  fillingOfficer: { type: String, ref: 'users', default: null },
  summary: { type: String, default: '' },
  meta: { type: Schema.Types.Mixed, default: {} },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'filling_officer_audit',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const FillingOfficerAuditModel = (mongoose.models['filling_officer_audit'] as Model<IFillingOfficerAudit>) ||
  mongoose.model<IFillingOfficerAudit>('filling_officer_audit', FillingOfficerAuditSchema, 'filling_officer_audit');

export default FillingOfficerAuditModel;
