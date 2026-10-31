import mongoose, { Schema, Model } from 'mongoose';

export interface IResignationRequests {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  employeeEmail?: string;
  department?: string;
  designation?: string;
  reason?: string;
  noticePeriod?: string;
  lastWorkingDay?: string;
  comments?: string;
  overallScore?: number;
  rating?: string;
  blocked?: boolean;
  performanceEvaluation?: Record<string, any> | any[] | any;
  status?: string;
  adminNote?: string;
  overrideReason?: string;
  reviewedBy?: string | null;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewAction?: string;
  created?: Date;
  updated?: Date;
}

export const ResignationRequestsSchema = new Schema<IResignationRequests>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  employeeEmail: { type: String, default: '' },
  department: { type: String, default: '' },
  designation: { type: String, default: '' },
  reason: { type: String, default: '' },
  noticePeriod: { type: String, default: '' },
  lastWorkingDay: { type: String, default: '' },
  comments: { type: String, default: '' },
  overallScore: { type: Number, default: 0 },
  rating: { type: String, default: '' },
  blocked: { type: Boolean, default: false },
  performanceEvaluation: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, default: '' , index: true},
  adminNote: { type: String, default: '' },
  overrideReason: { type: String, default: '' },
  reviewedBy: { type: String, ref: 'users', default: null },
  reviewedByName: { type: String, default: '' },
  reviewedAt: { type: String, default: '' },
  reviewAction: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'resignation_requests',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const ResignationRequestsModel = (mongoose.models['resignation_requests'] as Model<IResignationRequests>) ||
  mongoose.model<IResignationRequests>('resignation_requests', ResignationRequestsSchema, 'resignation_requests');

export default ResignationRequestsModel;
