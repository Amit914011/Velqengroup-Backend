import mongoose, { Schema, Model } from 'mongoose';

export interface IVelqenSmileHelpSeekers {
  _id: string;
  name?: string;
  phone1?: string;
  phone2?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  aadharNumber?: string;
  aadharImage?: string;
  govIdType?: string;
  govIdNumber?: string;
  govIdImage?: string;
  addressProofType?: string;
  addressProofImage?: string;
  helpCategory?: string;
  description?: string;
  consent?: boolean;
  verificationStatus?: string;
  verificationNotes?: string;
  rejectionReason?: string;
  contactStatus?: string;
  internalNotes?: string;
  history?: Record<string, any> | any[] | any;
  created?: Date;
  updated?: Date;
}

export const VelqenSmileHelpSeekersSchema = new Schema<IVelqenSmileHelpSeekers>(
  {
  _id: { type: String, required: true },
  name: { type: String, default: '' },
  phone1: { type: String, default: '' },
  phone2: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  aadharNumber: { type: String, default: '' },
  aadharImage: { type: String, default: '' },
  govIdType: { type: String, default: '' },
  govIdNumber: { type: String, default: '' },
  govIdImage: { type: String, default: '' },
  addressProofType: { type: String, default: '' },
  addressProofImage: { type: String, default: '' },
  helpCategory: { type: String, default: '' , index: true},
  description: { type: String, default: '' },
  consent: { type: Boolean, default: false },
  verificationStatus: { type: String, default: '' , index: true},
  verificationNotes: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  contactStatus: { type: String, default: '' },
  internalNotes: { type: String, default: '' },
  history: { type: Schema.Types.Mixed, default: {} },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'velqen_smile_help_seekers',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const VelqenSmileHelpSeekersModel = (mongoose.models['velqen_smile_help_seekers'] as Model<IVelqenSmileHelpSeekers>) ||
  mongoose.model<IVelqenSmileHelpSeekers>('velqen_smile_help_seekers', VelqenSmileHelpSeekersSchema, 'velqen_smile_help_seekers');

export default VelqenSmileHelpSeekersModel;
