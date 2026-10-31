import mongoose, { Schema, Model } from 'mongoose';

export interface IUsers {
  _id: string;
  password?: string;
  tokenKey?: string;
  email?: string;
  emailVisibility?: boolean;
  verified?: boolean;
  name?: string;
  avatar?: string;
  role?: string;
  phone?: string;
  shiftStart?: string;
  shiftEnd?: string;
  monthlySalary?: number;
  plAdjustment?: number;
  department?: string;
  subCategory?: string;
  aadharNumber?: string;
  panNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  taxInfo?: string;
  paidBasic?: number;
  paidIncentive?: number;
  paidDeductions?: number;
  paidTransferDate?: string;
  aadharFile?: string;
  panFile?: string;
  bankFile?: string;
  joiningDate?: string;
  employeeId?: string;
  clientCode?: string;
  deleted?: boolean;
  deletedAt?: string;
  deletedByName?: string;
  manager?: string | null;
  managerName?: string;
  whatsappNumber?: string;
  deviceType?: string;
  employeeStatus?: string;
  designation?: string;
  permissions?: Record<string, any> | any[] | any;
  approvalStatus?: string;
  approvalRequestedByName?: string;
  approvalRequestedAt?: string;
  approvalReviewedByName?: string;
  approvalReviewedAt?: string;
  approvalNote?: string;
  allowances?: number;
  incentives?: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  dateOfBirth?: string;
  gender?: string;
  resignationDate?: string;
  lastWorkingDay?: string;
  whatsapp_enabled?: boolean;
  accountEnabled?: boolean;
  loginEnabled?: boolean;
  permanentAddress?: string;
  presentAddress?: string;
  presentCity?: string;
  presentState?: string;
  presentPincode?: string;
  alternatePhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  security_passcode_hash?: string;
  security_passcode_status?: string;
  security_passcode_set_at?: string;
  security_passcode_reset_at?: string;
  security_last_verified_at?: string;
  security_failed_attempts?: number;
  security_locked_until?: string;
  created?: Date;
  updated?: Date;
}

export const UsersSchema = new Schema<IUsers>(
  {
  _id: { type: String, required: true },
  password: { type: String, default: '' },
  tokenKey: { type: String, default: '' , index: true},
  email: { type: String, default: '' , index: true},
  emailVisibility: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  name: { type: String, default: '', index: true },
  avatar: { type: String, default: '' },
  role: { type: String, default: '', index: true },
  phone: { type: String, default: '' },
  shiftStart: { type: String, default: '' },
  shiftEnd: { type: String, default: '' },
  monthlySalary: { type: Number, default: 0 },
  plAdjustment: { type: Number, default: 0 },
  department: { type: String, default: '' },
  subCategory: { type: String, default: '' },
  aadharNumber: { type: String, default: '' },
  panNumber: { type: String, default: '' },
  bankName: { type: String, default: '' },
  bankAccountNumber: { type: String, default: '' },
  bankIfsc: { type: String, default: '' },
  bankBranch: { type: String, default: '' },
  taxInfo: { type: String, default: '' },
  paidBasic: { type: Number, default: 0 },
  paidIncentive: { type: Number, default: 0 },
  paidDeductions: { type: Number, default: 0 },
  paidTransferDate: { type: String, default: '' },
  aadharFile: { type: String, default: '' },
  panFile: { type: String, default: '' },
  bankFile: { type: String, default: '' },
  joiningDate: { type: String, default: '' },
  employeeId: { type: String, default: '' },
  clientCode: { type: String, default: '' , index: true},
  deleted: { type: Boolean, default: false },
  deletedAt: { type: String, default: '' },
  deletedByName: { type: String, default: '' },
  manager: { type: String, ref: 'users', default: null },
  managerName: { type: String, default: '' },
  whatsappNumber: { type: String, default: '' },
  deviceType: { type: String, default: '' },
  employeeStatus: { type: String, default: '' },
  designation: { type: String, default: '' },
  permissions: { type: Schema.Types.Mixed, default: {} },
  approvalStatus: { type: String, default: '' },
  approvalRequestedByName: { type: String, default: '' },
  approvalRequestedAt: { type: String, default: '' },
  approvalReviewedByName: { type: String, default: '' },
  approvalReviewedAt: { type: String, default: '' },
  approvalNote: { type: String, default: '' },
  allowances: { type: Number, default: 0 },
  incentives: { type: Number, default: 0 },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  gender: { type: String, default: '' },
  resignationDate: { type: String, default: '' },
  lastWorkingDay: { type: String, default: '' },
  whatsapp_enabled: { type: Boolean, default: false },
  accountEnabled: { type: Boolean, default: false },
  loginEnabled: { type: Boolean, default: false },
  permanentAddress: { type: String, default: '' },
  presentAddress: { type: String, default: '' },
  presentCity: { type: String, default: '' },
  presentState: { type: String, default: '' },
  presentPincode: { type: String, default: '' },
  alternatePhone: { type: String, default: '' },
  emergencyContactName: { type: String, default: '' },
  emergencyContactPhone: { type: String, default: '' },
  emergencyContactRelation: { type: String, default: '' },
  security_passcode_hash: { type: String, default: '' },
  security_passcode_status: { type: String, default: '' },
  security_passcode_set_at: { type: String, default: '' },
  security_passcode_reset_at: { type: String, default: '' },
  security_last_verified_at: { type: String, default: '' },
  security_failed_attempts: { type: Number, default: 0 },
  security_locked_until: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'users',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const UsersModel = (mongoose.models['users'] as Model<IUsers>) ||
  mongoose.model<IUsers>('users', UsersSchema, 'users');

export default UsersModel;
