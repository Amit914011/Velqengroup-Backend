import mongoose, { Schema, Model } from 'mongoose';

export interface IChatAccessLog {
  _id: string;
  admin?: string | null;
  adminName?: string;
  conversationId?: string;
  conversationLabel?: string;
  isDm?: boolean;
  accessedAt?: string;
  created?: Date;
  updated?: Date;
}

export const ChatAccessLogSchema = new Schema<IChatAccessLog>(
  {
  _id: { type: String, required: true },
  admin: { type: String, ref: 'users', default: null , index: true},
  adminName: { type: String, default: '' },
  conversationId: { type: String, default: '' , index: true},
  conversationLabel: { type: String, default: '' },
  isDm: { type: Boolean, default: false },
  accessedAt: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'chat_access_log',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const ChatAccessLogModel = (mongoose.models['chat_access_log'] as Model<IChatAccessLog>) ||
  mongoose.model<IChatAccessLog>('chat_access_log', ChatAccessLogSchema, 'chat_access_log');

export default ChatAccessLogModel;
