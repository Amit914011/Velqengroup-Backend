import mongoose, { Schema, Model } from 'mongoose';

export interface ILoginAttempts {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  deviceId?: string;
  label?: string;
  browser?: string;
  os?: string;
  userAgent?: string;
  ip?: string;
  location?: string;
  status?: string;
  created?: Date;
  updated?: Date;
}

export const LoginAttemptsSchema = new Schema<ILoginAttempts>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  deviceId: { type: String, default: '' },
  label: { type: String, default: '' },
  browser: { type: String, default: '' },
  os: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  ip: { type: String, default: '' },
  location: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'login_attempts',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const LoginAttemptsModel = (mongoose.models['login_attempts'] as Model<ILoginAttempts>) ||
  mongoose.model<ILoginAttempts>('login_attempts', LoginAttemptsSchema, 'login_attempts');

export default LoginAttemptsModel;
