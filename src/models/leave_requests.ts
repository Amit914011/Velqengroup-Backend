import mongoose, { Schema, Model } from 'mongoose';

export interface ILeaveRequests {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  leaveType?: string;
  reason?: string;
  status?: string;
  adminNote?: string;
  attachment?: string;
  docSlipDeadline?: string;
  docSlipStatus?: string;
  createdByName?: string;
  updatedByName?: string;
  created?: Date;
  updated?: Date;
}

export const LeaveRequestsSchema = new Schema<ILeaveRequests>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  days: { type: Number, default: 0 },
  leaveType: { type: String, default: '' },
  reason: { type: String, default: '' },
  status: { type: String, default: '' },
  adminNote: { type: String, default: '' },
  attachment: { type: String, default: '' },
  docSlipDeadline: { type: String, default: '' },
  docSlipStatus: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'leave_requests',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LeaveRequestsModel = (mongoose.models['leave_requests'] as Model<ILeaveRequests>) ||
  mongoose.model<ILeaveRequests>('leave_requests', LeaveRequestsSchema, 'leave_requests');

export default LeaveRequestsModel;
