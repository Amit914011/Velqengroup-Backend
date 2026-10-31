import mongoose, { Schema, Model } from 'mongoose';

export interface ISecurityAudit {
  _id: string;
  user?: string | null;
  employeeId?: string;
  employeeName?: string;
  event?: string;
  ip?: string;
  userAgent?: string;
  meta?: Record<string, any> | any[] | any;
  created?: Date;
  updated?: Date;
}

export const SecurityAuditSchema = new Schema<ISecurityAudit>(
  {
  _id: { type: String, required: true },
  user: { type: String, ref: 'users', default: null , index: true},
  employeeId: { type: String, default: '' },
  employeeName: { type: String, default: '' },
  event: { type: String, default: '' , index: true},
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  meta: { type: Schema.Types.Mixed, default: {} },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'security_audit',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const SecurityAuditModel = (mongoose.models['security_audit'] as Model<ISecurityAudit>) ||
  mongoose.model<ISecurityAudit>('security_audit', SecurityAuditSchema, 'security_audit');

export default SecurityAuditModel;
