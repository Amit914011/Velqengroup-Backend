import mongoose, { Schema, Model } from 'mongoose';

export interface ILogisticsJobApplications {
  _id: string;
  applicant?: string | null;
  applicantName?: string;
  job?: string | null;
  jobTitle?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  location?: string;
  experience?: string;
  cdlType?: string;
  drivingExperience?: string;
  preferredPosition?: string;
  preferredRoute?: string;
  equipmentExperience?: string;
  availability?: string;
  resumeUrl?: string;
  comments?: string;
  status?: string;
  assignedTo?: string | null;
  created?: Date;
  updated?: Date;
}

export const LogisticsJobApplicationsSchema = new Schema<ILogisticsJobApplications>(
  {
  _id: { type: String, required: true },
  applicant: { type: String, ref: 'logistics_users', default: null, index: true },
  applicantName: { type: String, default: '' },
  job: { type: String, ref: 'logistics_jobs', default: null , index: true},
  jobTitle: { type: String, default: '' },
  fullName: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  location: { type: String, default: '' },
  experience: { type: String, default: '' },
  cdlType: { type: String, default: '' },
  drivingExperience: { type: String, default: '' },
  preferredPosition: { type: String, default: '' },
  preferredRoute: { type: String, default: '' },
  equipmentExperience: { type: String, default: '' },
  availability: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  comments: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  assignedTo: { type: String, ref: 'users', default: null },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'logistics_job_applications',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LogisticsJobApplicationsModel = (mongoose.models['logistics_job_applications'] as Model<ILogisticsJobApplications>) ||
  mongoose.model<ILogisticsJobApplications>('logistics_job_applications', LogisticsJobApplicationsSchema, 'logistics_job_applications');

export default LogisticsJobApplicationsModel;
