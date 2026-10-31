import mongoose, { Schema, Model } from 'mongoose';

export interface IRecruitmentInterviews {
  _id: string;
  candidate?: string | null;
  candidateName?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewType?: string;
  location?: string;
  interviewer?: string;
  position?: string;
  notes?: string;
  status?: string;
  completedAt?: string;
  noShow?: boolean;
  createdBy?: string | null;
  createdByName?: string;
  created?: Date;
  updated?: Date;
}

export const RecruitmentInterviewsSchema = new Schema<IRecruitmentInterviews>(
  {
  _id: { type: String, required: true },
  candidate: { type: String, ref: 'recruitment_candidates', default: null, index: true },
  candidateName: { type: String, default: '' },
  interviewDate: { type: String, default: '', index: true },
  interviewTime: { type: String, default: '' },
  interviewType: { type: String, default: '' },
  location: { type: String, default: '' },
  interviewer: { type: String, default: '' },
  position: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  completedAt: { type: String, default: '' },
  noShow: { type: Boolean, default: false },
  createdBy: { type: String, ref: 'users', default: null },
  createdByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'recruitment_interviews',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const RecruitmentInterviewsModel = (mongoose.models['recruitment_interviews'] as Model<IRecruitmentInterviews>) ||
  mongoose.model<IRecruitmentInterviews>('recruitment_interviews', RecruitmentInterviewsSchema, 'recruitment_interviews');

export default RecruitmentInterviewsModel;
