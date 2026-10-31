import mongoose, { Schema, Model } from 'mongoose';

export interface IRecruitmentConversations {
  _id: string;
  candidate?: string | null;
  candidateName?: string;
  callDateTime?: string;
  callStatus?: string;
  notes?: string;
  candidateResponse?: string;
  salaryDiscussion?: string;
  availability?: string;
  followUpRequired?: boolean;
  followUpDateTime?: string;
  nextAction?: string;
  createdBy?: string | null;
  createdByName?: string;
  created?: Date;
  updated?: Date;
}

export const RecruitmentConversationsSchema = new Schema<IRecruitmentConversations>(
  {
  _id: { type: String, required: true },
  candidate: { type: String, ref: 'recruitment_candidates', default: null, index: true },
  candidateName: { type: String, default: '' },
  callDateTime: { type: String, default: '' },
  callStatus: { type: String, default: '' },
  notes: { type: String, default: '' },
  candidateResponse: { type: String, default: '' },
  salaryDiscussion: { type: String, default: '' },
  availability: { type: String, default: '' },
  followUpRequired: { type: Boolean, default: false },
  followUpDateTime: { type: String, default: '' },
  nextAction: { type: String, default: '' },
  createdBy: { type: String, ref: 'users', default: null },
  createdByName: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'recruitment_conversations',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const RecruitmentConversationsModel = (mongoose.models['recruitment_conversations'] as Model<IRecruitmentConversations>) ||
  mongoose.model<IRecruitmentConversations>('recruitment_conversations', RecruitmentConversationsSchema, 'recruitment_conversations');

export default RecruitmentConversationsModel;
