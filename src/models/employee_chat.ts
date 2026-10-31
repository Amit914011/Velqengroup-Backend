import mongoose, { Schema, Model } from 'mongoose';

export interface IEmployeeChat {
  _id: string;
  sender?: string | null;
  senderName?: string;
  senderDept?: string;
  room?: string;
  content?: string;
  participants?: string[];
  isDm?: boolean;
  deleted?: boolean;
  deletedAt?: string;
  deletedBy?: string | null;
  deletedByName?: string;
  deletionReason?: string;
  edited?: boolean;
  editedAt?: string;
  originalContent?: string;
  complianceFlag?: string;
  complianceSeverity?: string;
  complianceCategory?: string;
  complianceConfidence?: number;
  complianceReason?: string;
  complianceAlert?: string | null;
  created?: Date;
  updated?: Date;
}

export const EmployeeChatSchema = new Schema<IEmployeeChat>(
  {
  _id: { type: String, required: true },
  sender: { type: String, ref: 'users', default: null },
  senderName: { type: String, default: '' },
  senderDept: { type: String, default: '' },
  room: { type: String, default: '' , index: true},
  content: { type: String, default: '' },
  participants: { type: [String], ref: 'users', default: [] },
  isDm: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: String, default: '' },
  deletedBy: { type: String, ref: 'users', default: null },
  deletedByName: { type: String, default: '' },
  deletionReason: { type: String, default: '' },
  edited: { type: Boolean, default: false },
  editedAt: { type: String, default: '' },
  originalContent: { type: String, default: '' },
  complianceFlag: { type: String, default: '' },
  complianceSeverity: { type: String, default: '' },
  complianceCategory: { type: String, default: '' },
  complianceConfidence: { type: Number, default: 0 },
  complianceReason: { type: String, default: '' },
  complianceAlert: { type: String, ref: 'chat_compliance_alerts', default: null },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'employee_chat',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const EmployeeChatModel = (mongoose.models['employee_chat'] as Model<IEmployeeChat>) ||
  mongoose.model<IEmployeeChat>('employee_chat', EmployeeChatSchema, 'employee_chat');

export default EmployeeChatModel;
