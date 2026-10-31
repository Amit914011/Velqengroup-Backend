import mongoose, { Schema, Model } from 'mongoose';

export interface IRecruitmentAssessments {
  _id: string;
  candidate?: string | null;
  candidateName?: string;
  interview?: string | null;
  communication?: number;
  experience?: number;
  jobKnowledge?: number;
  relevantExperience?: number;
  personality?: number;
  salarySuitability?: number;
  availability?: number;
  overallRating?: number;
  remarks?: string;
  recommendation?: string;
  createdBy?: string | null;
  createdByName?: string;
  created?: Date;
  updated?: Date;
}

export const RecruitmentAssessmentsSchema = new Schema<IRecruitmentAssessments>(
  {
  _id: { type: String, required: true },
  candidate: { type: String, ref: 'recruitment_candidates', default: null, index: true },
  candidateName: { type: String, default: '' },
  interview: { type: String, ref: 'recruitment_interviews', default: null },
  communication: { type: Number, default: 0 },
  experience: { type: Number, default: 0 },
  jobKnowledge: { type: Number, default: 0 },
  relevantExperience: { type: Number, default: 0 },
  personality: { type: Number, default: 0 },
  salarySuitability: { type: Number, default: 0 },
  availability: { type: Number, default: 0 },
  overallRating: { type: Number, default: 0 },
  remarks: { type: String, default: '' },
  recommendation: { type: String, default: '' },
  createdBy: { type: String, ref: 'users', default: null },
  createdByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'recruitment_assessments',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const RecruitmentAssessmentsModel = (mongoose.models['recruitment_assessments'] as Model<IRecruitmentAssessments>) ||
  mongoose.model<IRecruitmentAssessments>('recruitment_assessments', RecruitmentAssessmentsSchema, 'recruitment_assessments');

export default RecruitmentAssessmentsModel;
