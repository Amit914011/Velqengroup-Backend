import mongoose, { Schema, Model } from 'mongoose';

export interface IVelqenSmileInquiries {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
  subject?: string;
  message?: string;
  wantsToVolunteer?: boolean;
  status?: string;
  created?: Date;
  updated?: Date;
}

export const VelqenSmileInquiriesSchema = new Schema<IVelqenSmileInquiries>(
  {
  _id: { type: String, required: true },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  subject: { type: String, default: '' },
  message: { type: String, default: '' },
  wantsToVolunteer: { type: Boolean, default: false },
  status: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'velqen_smile_inquiries',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const VelqenSmileInquiriesModel = (mongoose.models['velqen_smile_inquiries'] as Model<IVelqenSmileInquiries>) ||
  mongoose.model<IVelqenSmileInquiries>('velqen_smile_inquiries', VelqenSmileInquiriesSchema, 'velqen_smile_inquiries');

export default VelqenSmileInquiriesModel;
