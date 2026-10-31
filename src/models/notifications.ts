import mongoose, { Schema, Model } from 'mongoose';

export interface INotifications {
  _id: string;
  recipient?: string | null;
  title?: string;
  message?: string;
  category?: string;
  link?: string;
  senderName?: string;
  read?: boolean;
  meta?: Record<string, any> | any[] | any;
  recipientName?: string;
  created?: Date;
  updated?: Date;
}

export const NotificationsSchema = new Schema<INotifications>(
  {
  _id: { type: String, required: true },
  recipient: { type: String, ref: 'users', default: null, index: true },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  category: { type: String, default: '' },
  link: { type: String, default: '' },
  senderName: { type: String, default: '' },
  read: { type: Boolean, default: false , index: true},
  meta: { type: Schema.Types.Mixed, default: {} },
  recipientName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'notifications',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const NotificationsModel = (mongoose.models['notifications'] as Model<INotifications>) ||
  mongoose.model<INotifications>('notifications', NotificationsSchema, 'notifications');

export default NotificationsModel;
