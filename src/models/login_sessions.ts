import mongoose, { Schema, Model } from 'mongoose';

export interface ILoginSessions {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  working_date?: string;
  login_at?: Date | null;
  logout_at?: Date | null;
  session_duration?: number;
  is_active?: boolean;
  created?: Date;
  updated?: Date;
}

export const LoginSessionsSchema = new Schema<ILoginSessions>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null },
  employeeName: { type: String, default: '' },
  working_date: { type: String, default: '' },
  login_at: { type: Date, default: null },
  logout_at: { type: Date, default: null },
  session_duration: { type: Number, default: 0 },
  is_active: { type: Boolean, default: false , index: true},
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'login_sessions',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

LoginSessionsSchema.index({"employee":1,"working_date":1});

export const LoginSessionsModel = (mongoose.models['login_sessions'] as Model<ILoginSessions>) ||
  mongoose.model<ILoginSessions>('login_sessions', LoginSessionsSchema, 'login_sessions');

export default LoginSessionsModel;
