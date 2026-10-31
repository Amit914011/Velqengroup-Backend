import mongoose, { Schema, Model } from 'mongoose';

export interface ILogisticsNotifications {
  _id: string;
  owner?: string | null;
  type?: string;
  title?: string;
  body?: string;
  relatedId?: string;
  read?: boolean;
  created?: Date;
  updated?: Date;
}

export const LogisticsNotificationsSchema = new Schema<ILogisticsNotifications>(
  {
  _id: { type: String, required: true },
  owner: { type: String, ref: 'logistics_users', default: null, index: true },
  type: { type: String, default: '' },
  title: { type: String, default: '' },
  body: { type: String, default: '' },
  relatedId: { type: String, default: '' },
  read: { type: Boolean, default: false , index: true},
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'logistics_notifications',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LogisticsNotificationsModel = (mongoose.models['logistics_notifications'] as Model<ILogisticsNotifications>) ||
  mongoose.model<ILogisticsNotifications>('logistics_notifications', LogisticsNotificationsSchema, 'logistics_notifications');

export default LogisticsNotificationsModel;
