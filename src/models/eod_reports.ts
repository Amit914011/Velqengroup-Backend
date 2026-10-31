import mongoose, { Schema, Model } from 'mongoose';

export interface IEodReports {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  department?: string;
  date?: string;
  totalLeadsToday?: number;
  newLeadsToday?: number;
  callsMade?: number;
  interactions?: number;
  revenueGenerated?: number;
  visitsToday?: number;
  enrollmentsToday?: number;
  expectedVisits?: number;
  expectedEnrollments?: number;
  tomorrowProjection?: string;
  tasksCompleted?: string;
  pendingTasks?: string;
  challengesFaced?: string;
  notes?: string;
  submittedAt?: Date | null;
  expectedLeads?: number;
  expectedRevenue?: number;
  commitments?: Record<string, any> | any[] | any;
  performanceScore?: number;
  missedCommitmentsCount?: number;
  adminRemark?: string;
  reviewStatus?: string;
  rejectionReason?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewedByRole?: string;
  talkTimeSeconds?: number;
  talkTimeCallCount?: number;
  created?: Date;
  updated?: Date;
}

export const EodReportsSchema = new Schema<IEodReports>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null, index: true },
  employeeName: { type: String, default: '' },
  department: { type: String, default: '' },
  date: { type: String, default: '', index: true },
  totalLeadsToday: { type: Number, default: 0 },
  newLeadsToday: { type: Number, default: 0 },
  callsMade: { type: Number, default: 0 },
  interactions: { type: Number, default: 0 },
  revenueGenerated: { type: Number, default: 0 },
  visitsToday: { type: Number, default: 0 },
  enrollmentsToday: { type: Number, default: 0 },
  expectedVisits: { type: Number, default: 0 },
  expectedEnrollments: { type: Number, default: 0 },
  tomorrowProjection: { type: String, default: '' },
  tasksCompleted: { type: String, default: '' },
  pendingTasks: { type: String, default: '' },
  challengesFaced: { type: String, default: '' },
  notes: { type: String, default: '' },
  submittedAt: { type: Date, default: null },
  expectedLeads: { type: Number, default: 0 },
  expectedRevenue: { type: Number, default: 0 },
  commitments: { type: Schema.Types.Mixed, default: {} },
  performanceScore: { type: Number, default: 0 },
  missedCommitmentsCount: { type: Number, default: 0 },
  adminRemark: { type: String, default: '' },
  reviewStatus: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  reviewedByName: { type: String, default: '' },
  reviewedAt: { type: String, default: '' },
  reviewedByRole: { type: String, default: '' },
  talkTimeSeconds: { type: Number, default: 0 },
  talkTimeCallCount: { type: Number, default: 0 },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'eod_reports',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

EodReportsSchema.index({"employee":1,"date":1});

export const EodReportsModel = (mongoose.models['eod_reports'] as Model<IEodReports>) ||
  mongoose.model<IEodReports>('eod_reports', EodReportsSchema, 'eod_reports');

export default EodReportsModel;
