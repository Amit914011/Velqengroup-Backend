import mongoose, { Schema, Model } from 'mongoose';

export interface IRecruitmentCandidateEdits {
  _id: string;
  candidate?: string | null;
  candidateName?: string;
  assignedManager?: string | null;
  editedBy?: string | null;
  editedByName?: string;
  editedByRole?: string;
  tab?: string;
  field?: string;
  fieldLabel?: string;
  previousValue?: string;
  newValue?: string;
  source?: string;
  created?: Date;
  updated?: Date;
}

export const RecruitmentCandidateEditsSchema = new Schema<IRecruitmentCandidateEdits>(
  {
  _id: { type: String, required: true },
  candidate: { type: String, ref: 'recruitment_candidates', default: null, index: true },
  candidateName: { type: String, default: '' },
  assignedManager: { type: String, ref: 'users', default: null , index: true},
  editedBy: { type: String, ref: 'users', default: null , index: true},
  editedByName: { type: String, default: '' },
  editedByRole: { type: String, default: '' },
  tab: { type: String, default: '' },
  field: { type: String, default: '' },
  fieldLabel: { type: String, default: '' },
  previousValue: { type: String, default: '' },
  newValue: { type: String, default: '' },
  source: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'recruitment_candidate_edits',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const RecruitmentCandidateEditsModel = (mongoose.models['recruitment_candidate_edits'] as Model<IRecruitmentCandidateEdits>) ||
  mongoose.model<IRecruitmentCandidateEdits>('recruitment_candidate_edits', RecruitmentCandidateEditsSchema, 'recruitment_candidate_edits');

export default RecruitmentCandidateEditsModel;
