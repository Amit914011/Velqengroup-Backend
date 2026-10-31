import mongoose, { Schema, Model } from 'mongoose';

export interface ILogisticsJobs {
  _id: string;
  owner?: string | null;
  ownerName?: string;
  title?: string;
  category?: string;
  jobType?: string;
  location?: string;
  routeType?: string;
  experience?: string;
  equipment?: string;
  payType?: string;
  homeTime?: string;
  description?: string;
  status?: string;
  created?: Date;
  updated?: Date;
}

export const LogisticsJobsSchema = new Schema<ILogisticsJobs>(
  {
  _id: { type: String, required: true },
  owner: { type: String, ref: 'logistics_users', default: null },
  ownerName: { type: String, default: '' },
  title: { type: String, default: '' },
  category: { type: String, default: '' , index: true},
  jobType: { type: String, default: '' },
  location: { type: String, default: '' },
  routeType: { type: String, default: '' },
  experience: { type: String, default: '' },
  equipment: { type: String, default: '' },
  payType: { type: String, default: '' },
  homeTime: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: String, default: '', index: true },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'logistics_jobs',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LogisticsJobsModel = (mongoose.models['logistics_jobs'] as Model<ILogisticsJobs>) ||
  mongoose.model<ILogisticsJobs>('logistics_jobs', LogisticsJobsSchema, 'logistics_jobs');

export default LogisticsJobsModel;
