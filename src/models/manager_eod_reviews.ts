import mongoose, { Schema, Model } from 'mongoose';

export interface IManagerEodReviews {
  _id: string;
  manager?: string | null;
  managerName?: string;
  employee?: string | null;
  employeeName?: string;
  employeeId?: string;
  designation?: string;
  eodDate?: string;
  department?: string;
  team?: string;
  employeeEodId?: string;
  employeeEodStatus?: string;
  targetStatus?: string;
  targetReason?: string;
  revenueStatus?: string;
  expectedRevenueStartDate?: string;
  revenueExplanation?: string;
  specialRequest?: boolean;
  specialRequestDetails?: string;
  specialRequestPriority?: string;
  managerRemarks?: string;
  reviewStatus?: string;
  employeeEodSnapshot?: Record<string, any> | any[] | any;
  createdBy?: string;
  updatedBy?: string;
  created?: Date;
  updated?: Date;
}

export const ManagerEodReviewsSchema = new Schema<IManagerEodReviews>(
  {
  _id: { type: String, required: true },
  manager: { type: String, ref: 'users', default: null, index: true },
  managerName: { type: String, default: '' },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  employeeId: { type: String, default: '' },
  designation: { type: String, default: '' },
  eodDate: { type: String, default: '', index: true },
  department: { type: String, default: '' },
  team: { type: String, default: '' },
  employeeEodId: { type: String, default: '' },
  employeeEodStatus: { type: String, default: '' },
  targetStatus: { type: String, default: '' },
  targetReason: { type: String, default: '' },
  revenueStatus: { type: String, default: '' },
  expectedRevenueStartDate: { type: String, default: '' },
  revenueExplanation: { type: String, default: '' },
  specialRequest: { type: Boolean, default: false },
  specialRequestDetails: { type: String, default: '' },
  specialRequestPriority: { type: String, default: '' },
  managerRemarks: { type: String, default: '' },
  reviewStatus: { type: String, default: '' },
  employeeEodSnapshot: { type: Schema.Types.Mixed, default: {} },
  createdBy: { type: String, default: '' },
  updatedBy: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'manager_eod_reviews',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

ManagerEodReviewsSchema.index({"manager":1,"employee":1,"eodDate":1});

export const ManagerEodReviewsModel = (mongoose.models['manager_eod_reviews'] as Model<IManagerEodReviews>) ||
  mongoose.model<IManagerEodReviews>('manager_eod_reviews', ManagerEodReviewsSchema, 'manager_eod_reviews');

export default ManagerEodReviewsModel;
