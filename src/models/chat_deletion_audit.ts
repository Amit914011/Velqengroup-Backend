import mongoose, { Schema, Model } from 'mongoose';

export interface IChatDeletionAudit {
  _id: string;
  message?: string | null;
  messageId?: string;
  sender?: string | null;
  senderName?: string;
  conversationId?: string;
  conversationLabel?: string;
  isDm?: boolean;
  room?: string;
  participants?: string[];
  originalContent?: string;
  contentHash?: string;
  deletedBy?: string | null;
  deletedByName?: string;
  deletedAt?: string;
  reason?: string;
  created?: Date;
  updated?: Date;
}

export const ChatDeletionAuditSchema = new Schema<IChatDeletionAudit>(
  {
  _id: { type: String, required: true },
  message: { type: String, ref: 'employee_chat', default: null , index: true},
  messageId: { type: String, default: '' },
  sender: { type: String, ref: 'users', default: null },
  senderName: { type: String, default: '' },
  conversationId: { type: String, default: '' },
  conversationLabel: { type: String, default: '' },
  isDm: { type: Boolean, default: false },
  room: { type: String, default: '' },
  participants: { type: [String], ref: 'users', default: [] },
  originalContent: { type: String, default: '' },
  contentHash: { type: String, default: '' },
  deletedBy: { type: String, ref: 'users', default: null , index: true},
  deletedByName: { type: String, default: '' },
  deletedAt: { type: String, default: '' },
  reason: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'chat_deletion_audit',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const ChatDeletionAuditModel = (mongoose.models['chat_deletion_audit'] as Model<IChatDeletionAudit>) ||
  mongoose.model<IChatDeletionAudit>('chat_deletion_audit', ChatDeletionAuditSchema, 'chat_deletion_audit');

export default ChatDeletionAuditModel;
