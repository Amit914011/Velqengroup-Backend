import mongoose, { Schema, Model } from 'mongoose';

export interface ICandidateNotes {
  _id: string;
  candidate?: string | null;
  candidateName?: string;
  note_type?: string;
  note_text?: string;
  call_type?: string;
  call_status?: string;
  call_duration?: string;
  created_by?: string | null;
  created_by_name?: string;
  created_by_role?: string;
  edited_by?: string | null;
  edited_by_name?: string;
  edited_at?: Date | null;
  edit_history?: Record<string, any> | any[] | any;
  deleted?: boolean;
  deleted_by?: string | null;
  deleted_by_name?: string;
  deleted_at?: Date | null;
  created?: Date;
  updated?: Date;
}

export const CandidateNotesSchema = new Schema<ICandidateNotes>(
  {
  _id: { type: String, required: true },
  candidate: { type: String, ref: 'recruitment_candidates', default: null , index: true},
  candidateName: { type: String, default: '' },
  note_type: { type: String, default: '' },
  note_text: { type: String, default: '' },
  call_type: { type: String, default: '' },
  call_status: { type: String, default: '' },
  call_duration: { type: String, default: '' },
  created_by: { type: String, ref: 'users', default: null },
  created_by_name: { type: String, default: '' },
  created_by_role: { type: String, default: '' },
  edited_by: { type: String, ref: 'users', default: null },
  edited_by_name: { type: String, default: '' },
  edited_at: { type: Date, default: null },
  edit_history: { type: Schema.Types.Mixed, default: {} },
  deleted: { type: Boolean, default: false },
  deleted_by: { type: String, ref: 'users', default: null },
  deleted_by_name: { type: String, default: '' },
  deleted_at: { type: Date, default: null },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'candidate_notes',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const CandidateNotesModel = (mongoose.models['candidate_notes'] as Model<ICandidateNotes>) ||
  mongoose.model<ICandidateNotes>('candidate_notes', CandidateNotesSchema, 'candidate_notes');

export default CandidateNotesModel;
