import mongoose, { Schema, Model } from 'mongoose';

export interface IManagerEodReports {
  _id: string;
  manager?: string | null;
  managerName?: string;
  managerDepartment?: string;
  date?: string;
  teamSize?: number;
  presentCount?: number;
  absentCount?: number;
  leaveCount?: number;
  halfDayCount?: number;
  teamProductivity?: number;
  teamActivity?: Record<string, any> | any[] | any;
  tasksCompleted?: number;
  performanceRating?: number;
  targetsAchievedPct?: number;
  challenges?: string;
  remarks?: string;
  tomorrowPlan?: string;
  teamTargets?: Record<string, any> | any[] | any;
  status?: string;
  submittedAt?: string;
  onBreakCount?: number;
  visitorCount?: number;
  clientInteractions?: number;
  teamTasksCompleted?: string;
  teamChallenges?: string;
  teamAchievements?: string;
  myAchievements?: string;
  created?: Date;
  updated?: Date;
}

export const ManagerEodReportsSchema = new Schema<IManagerEodReports>(
  {
  _id: { type: String, required: true },
  manager: { type: String, ref: 'users', default: null , index: true},
  managerName: { type: String, default: '' },
  managerDepartment: { type: String, default: '' },
  date: { type: String, default: '' , index: true},
  teamSize: { type: Number, default: 0 },
  presentCount: { type: Number, default: 0 },
  absentCount: { type: Number, default: 0 },
  leaveCount: { type: Number, default: 0 },
  halfDayCount: { type: Number, default: 0 },
  teamProductivity: { type: Number, default: 0 },
  teamActivity: { type: Schema.Types.Mixed, default: {} },
  tasksCompleted: { type: Number, default: 0 },
  performanceRating: { type: Number, default: 0 },
  targetsAchievedPct: { type: Number, default: 0 },
  challenges: { type: String, default: '' },
  remarks: { type: String, default: '' },
  tomorrowPlan: { type: String, default: '' },
  teamTargets: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, default: '' },
  submittedAt: { type: String, default: '' },
  onBreakCount: { type: Number, default: 0 },
  visitorCount: { type: Number, default: 0 },
  clientInteractions: { type: Number, default: 0 },
  teamTasksCompleted: { type: String, default: '' },
  teamChallenges: { type: String, default: '' },
  teamAchievements: { type: String, default: '' },
  myAchievements: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'manager_eod_reports',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

ManagerEodReportsSchema.index({"manager":1,"date":1});

export const ManagerEodReportsModel = (mongoose.models['manager_eod_reports'] as Model<IManagerEodReports>) ||
  mongoose.model<IManagerEodReports>('manager_eod_reports', ManagerEodReportsSchema, 'manager_eod_reports');

export default ManagerEodReportsModel;
