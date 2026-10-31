import mongoose, { Schema, Model } from 'mongoose';

export interface IManagerEodConsolidated {
  _id: string;
  manager?: string | null;
  managerName?: string;
  eodDate?: string;
  department?: string;
  team?: string;
  totalTeamMembers?: number;
  presentCount?: number;
  absentCount?: number;
  onLeaveCount?: number;
  eodSubmittedCount?: number;
  eodPendingCount?: number;
  totalWorkingHours?: number;
  targetsAchievedCount?: number;
  targetsPartialCount?: number;
  targetsNotAchievedCount?: number;
  revenueGeneratedCount?: number;
  revenueExpectedCount?: number;
  revenueNotStartedCount?: number;
  targetIssues?: Record<string, any> | any[] | any;
  revenuePipeline?: Record<string, any> | any[] | any;
  specialRequests?: Record<string, any> | any[] | any;
  employeeReviews?: Record<string, any> | any[] | any;
  submissionStatus?: string;
  submittedAt?: string;
  createdBy?: string;
  totalLeads?: number;
  todayNewLeads?: number;
  todayInteractions?: number;
  totalVisits?: number;
  todayVisits?: number;
  totalEnrollments?: number;
  todayEnrollments?: number;
  expectedEnrollments?: number;
  totalRevenue?: number;
  todayRevenue?: number;
  teamPerformanceScore?: number;
  todayPresentCount?: number;
  todayAbsentCount?: number;
  todayHalfdayCount?: number;
  todayNewHiringCount?: number;
  todayResignedCount?: number;
  managerSelfEodId?: string;
  managerSelfEodStatus?: string;
  teamMemberEods?: Record<string, any> | any[] | any;
  consolidatedStatus?: string;
  managerSelfEod?: Record<string, any> | any[] | any;
  managerActivity?: Record<string, any> | any[] | any;
  teamMemberDetails?: Record<string, any> | any[] | any;
  teamTotals?: Record<string, any> | any[] | any;
  attendanceSummary?: Record<string, any> | any[] | any;
  targetSummary?: Record<string, any> | any[] | any;
  revenueSummary?: Record<string, any> | any[] | any;
  hrSummary?: Record<string, any> | any[] | any;
  managerFinalRemarks?: string;
  submissionTimestamp?: string;
  adminStatus?: string;
  adminNote?: string;
  reviewedBy?: string | null;
  reviewedByName?: string;
  reviewedAt?: string;
  created?: Date;
  updated?: Date;
}

export const ManagerEodConsolidatedSchema = new Schema<IManagerEodConsolidated>(
  {
  _id: { type: String, required: true },
  manager: { type: String, ref: 'users', default: null, index: true },
  managerName: { type: String, default: '' },
  eodDate: { type: String, default: '' , index: true},
  department: { type: String, default: '' },
  team: { type: String, default: '' },
  totalTeamMembers: { type: Number, default: 0 },
  presentCount: { type: Number, default: 0 },
  absentCount: { type: Number, default: 0 },
  onLeaveCount: { type: Number, default: 0 },
  eodSubmittedCount: { type: Number, default: 0 },
  eodPendingCount: { type: Number, default: 0 },
  totalWorkingHours: { type: Number, default: 0 },
  targetsAchievedCount: { type: Number, default: 0 },
  targetsPartialCount: { type: Number, default: 0 },
  targetsNotAchievedCount: { type: Number, default: 0 },
  revenueGeneratedCount: { type: Number, default: 0 },
  revenueExpectedCount: { type: Number, default: 0 },
  revenueNotStartedCount: { type: Number, default: 0 },
  targetIssues: { type: Schema.Types.Mixed, default: {} },
  revenuePipeline: { type: Schema.Types.Mixed, default: {} },
  specialRequests: { type: Schema.Types.Mixed, default: {} },
  employeeReviews: { type: Schema.Types.Mixed, default: {} },
  submissionStatus: { type: String, default: '' },
  submittedAt: { type: String, default: '' },
  createdBy: { type: String, default: '' },
  totalLeads: { type: Number, default: 0 },
  todayNewLeads: { type: Number, default: 0 },
  todayInteractions: { type: Number, default: 0 },
  totalVisits: { type: Number, default: 0 },
  todayVisits: { type: Number, default: 0 },
  totalEnrollments: { type: Number, default: 0 },
  todayEnrollments: { type: Number, default: 0 },
  expectedEnrollments: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  todayRevenue: { type: Number, default: 0 },
  teamPerformanceScore: { type: Number, default: 0 },
  todayPresentCount: { type: Number, default: 0 },
  todayAbsentCount: { type: Number, default: 0 },
  todayHalfdayCount: { type: Number, default: 0 },
  todayNewHiringCount: { type: Number, default: 0 },
  todayResignedCount: { type: Number, default: 0 },
  managerSelfEodId: { type: String, default: '' },
  managerSelfEodStatus: { type: String, default: '' },
  teamMemberEods: { type: Schema.Types.Mixed, default: {} },
  consolidatedStatus: { type: String, default: '' },
  managerSelfEod: { type: Schema.Types.Mixed, default: {} },
  managerActivity: { type: Schema.Types.Mixed, default: {} },
  teamMemberDetails: { type: Schema.Types.Mixed, default: {} },
  teamTotals: { type: Schema.Types.Mixed, default: {} },
  attendanceSummary: { type: Schema.Types.Mixed, default: {} },
  targetSummary: { type: Schema.Types.Mixed, default: {} },
  revenueSummary: { type: Schema.Types.Mixed, default: {} },
  hrSummary: { type: Schema.Types.Mixed, default: {} },
  managerFinalRemarks: { type: String, default: '' },
  submissionTimestamp: { type: String, default: '' },
  adminStatus: { type: String, default: '' },
  adminNote: { type: String, default: '' },
  reviewedBy: { type: String, ref: 'users', default: null },
  reviewedByName: { type: String, default: '' },
  reviewedAt: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'manager_eod_consolidated',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

ManagerEodConsolidatedSchema.index({"manager":1,"eodDate":1});

export const ManagerEodConsolidatedModel = (mongoose.models['manager_eod_consolidated'] as Model<IManagerEodConsolidated>) ||
  mongoose.model<IManagerEodConsolidated>('manager_eod_consolidated', ManagerEodConsolidatedSchema, 'manager_eod_consolidated');

export default ManagerEodConsolidatedModel;
