import mongoose, { Schema, Model } from 'mongoose';

export interface IManagerWeeklyReports {
  _id: string;
  manager?: string | null;
  managerName?: string;
  reportType?: string;
  weekKey?: string;
  weekStart?: string;
  status?: string;
  submittedAt?: string;
  submittedToDirector?: boolean;
  directorNotified?: boolean;
  lastWeekLeads?: number;
  lastWeekVisits?: number;
  lastWeekRevenue?: number;
  lastWeekPunctuality?: string;
  lastWeekDecorum?: string;
  lastWeekBehaviour?: string;
  lastWeekOverall?: string;
  projectionTarget?: string;
  expectedLeads?: number;
  expectedVisits?: number;
  expectedRevenue?: number;
  requiredToAchieve?: string;
  supportRequired?: string;
  notPerformingReason?: string;
  teamDiscussed?: boolean;
  committedProjection?: Record<string, any> | any[] | any;
  actualLeads?: number;
  actualVisits?: number;
  actualRevenue?: number;
  shortfallLeads?: number;
  shortfallVisits?: number;
  shortfallRevenue?: number;
  shortfallReason?: string;
  managerRemarks?: string;
  created?: Date;
  updated?: Date;
}

export const ManagerWeeklyReportsSchema = new Schema<IManagerWeeklyReports>(
  {
  _id: { type: String, required: true },
  manager: { type: String, ref: 'users', default: null , index: true},
  managerName: { type: String, default: '' },
  reportType: { type: String, default: '' , index: true},
  weekKey: { type: String, default: '' , index: true},
  weekStart: { type: String, default: '' },
  status: { type: String, default: '' },
  submittedAt: { type: String, default: '' },
  submittedToDirector: { type: Boolean, default: false },
  directorNotified: { type: Boolean, default: false },
  lastWeekLeads: { type: Number, default: 0 },
  lastWeekVisits: { type: Number, default: 0 },
  lastWeekRevenue: { type: Number, default: 0 },
  lastWeekPunctuality: { type: String, default: '' },
  lastWeekDecorum: { type: String, default: '' },
  lastWeekBehaviour: { type: String, default: '' },
  lastWeekOverall: { type: String, default: '' },
  projectionTarget: { type: String, default: '' },
  expectedLeads: { type: Number, default: 0 },
  expectedVisits: { type: Number, default: 0 },
  expectedRevenue: { type: Number, default: 0 },
  requiredToAchieve: { type: String, default: '' },
  supportRequired: { type: String, default: '' },
  notPerformingReason: { type: String, default: '' },
  teamDiscussed: { type: Boolean, default: false },
  committedProjection: { type: Schema.Types.Mixed, default: {} },
  actualLeads: { type: Number, default: 0 },
  actualVisits: { type: Number, default: 0 },
  actualRevenue: { type: Number, default: 0 },
  shortfallLeads: { type: Number, default: 0 },
  shortfallVisits: { type: Number, default: 0 },
  shortfallRevenue: { type: Number, default: 0 },
  shortfallReason: { type: String, default: '' },
  managerRemarks: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'manager_weekly_reports',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

ManagerWeeklyReportsSchema.index({"manager":1,"weekKey":1,"reportType":1,"status":1});

export const ManagerWeeklyReportsModel = (mongoose.models['manager_weekly_reports'] as Model<IManagerWeeklyReports>) ||
  mongoose.model<IManagerWeeklyReports>('manager_weekly_reports', ManagerWeeklyReportsSchema, 'manager_weekly_reports');

export default ManagerWeeklyReportsModel;
