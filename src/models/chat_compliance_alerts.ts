import mongoose, { Schema, Model } from 'mongoose';

export interface IChatComplianceAlerts {
  _id: string;
  message?: string | null;
  messageId?: string;
  messageContent?: string;
  conversationId?: string;
  conversationLabel?: string;
  isDm?: boolean;
  room?: string;
  sender?: string | null;
  senderName?: string;
  senderDept?: string;
  participants?: string[];
  severity?: string;
  category?: string;
  reason?: string;
  confidence?: number;
  context?: Record<string, any> | any[] | any;
  status?: string;
  reviewedBy?: string | null;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNote?: string;
  created?: Date;
  updated?: Date;
}

export const ChatComplianceAlertsSchema = new Schema<IChatComplianceAlerts>(
  {
  _id: { type: String, required: true },
  message: { type: String, ref: 'employee_chat', default: null },
  messageId: { type: String, default: '' },
  messageContent: { type: String, default: '' },
  conversationId: { type: String, default: '' , index: true},
  conversationLabel: { type: String, default: '' },
  isDm: { type: Boolean, default: false },
  room: { type: String, default: '' },
  sender: { type: String, ref: 'users', default: null , index: true},
  senderName: { type: String, default: '' },
  senderDept: { type: String, default: '' },
  participants: { type: [String], ref: 'users', default: [] },
  severity: { type: String, default: '' , index: true},
  category: { type: String, default: '' },
  reason: { type: String, default: '' },
  confidence: { type: Number, default: 0 },
  context: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, default: '' , index: true},
  reviewedBy: { type: String, ref: 'users', default: null },
  reviewedByName: { type: String, default: '' },
  reviewedAt: { type: String, default: '' },
  reviewNote: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'chat_compliance_alerts',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const ChatComplianceAlertsModel = (mongoose.models['chat_compliance_alerts'] as Model<IChatComplianceAlerts>) ||
  mongoose.model<IChatComplianceAlerts>('chat_compliance_alerts', ChatComplianceAlertsSchema, 'chat_compliance_alerts');

export default ChatComplianceAlertsModel;
