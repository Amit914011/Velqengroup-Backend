import mongoose, { Schema, Model } from 'mongoose';

export interface ILeaveChangeRequests {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  date?: string;
  currentMark?: string;
  requestedMark?: string;
  reason?: string;
  status?: string;
  adminNote?: string;
  created?: Date;
  updated?: Date;
}

export const LeaveChangeRequestsSchema = new Schema<ILeaveChangeRequests>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  date: { type: String, default: '' },
  currentMark: { type: String, default: '' },
  requestedMark: { type: String, default: '' },
  reason: { type: String, default: '' },
  status: { type: String, default: '' },
  adminNote: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'leave_change_requests',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LeaveChangeRequestsModel = (mongoose.models['leave_change_requests'] as Model<ILeaveChangeRequests>) ||
  mongoose.model<ILeaveChangeRequests>('leave_change_requests', LeaveChangeRequestsSchema, 'leave_change_requests');

export default LeaveChangeRequestsModel;
