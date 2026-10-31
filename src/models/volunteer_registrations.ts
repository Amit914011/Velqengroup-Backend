import mongoose, { Schema, Model } from 'mongoose';

export interface IVolunteerRegistrations {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  idType1?: string;
  idNumber1?: string;
  idType2?: string;
  idNumber2?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  whyVolunteer?: string;
  status?: string;
  emailVerified?: boolean;
  adminNotes?: string;
  approvedDate?: string;
  volunteerUser?: string | null;
  idDocument1?: string;
  idDocument2?: string;
  aadharVerificationStatus?: string;
  aadharAdminNote?: string;
  created?: Date;
  updated?: Date;
}

export const VolunteerRegistrationsSchema = new Schema<IVolunteerRegistrations>(
  {
  _id: { type: String, required: true },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  email: { type: String, default: '' , index: true},
  phone: { type: String, default: '' },
  idType1: { type: String, default: '' },
  idNumber1: { type: String, default: '' },
  idType2: { type: String, default: '' },
  idNumber2: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  whyVolunteer: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  emailVerified: { type: Boolean, default: false },
  adminNotes: { type: String, default: '' },
  approvedDate: { type: String, default: '' },
  volunteerUser: { type: String, ref: 'users', default: null },
  idDocument1: { type: String, default: '' },
  idDocument2: { type: String, default: '' },
  aadharVerificationStatus: { type: String, default: '' },
  aadharAdminNote: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'volunteer_registrations',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const VolunteerRegistrationsModel = (mongoose.models['volunteer_registrations'] as Model<IVolunteerRegistrations>) ||
  mongoose.model<IVolunteerRegistrations>('volunteer_registrations', VolunteerRegistrationsSchema, 'volunteer_registrations');

export default VolunteerRegistrationsModel;
