import mongoose, { Schema, Model } from 'mongoose';

export interface IVelqenSmileDonors {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
  subject?: string;
  message?: string;
  contributionType?: string;
  status?: string;
  internalNotes?: string;
  created?: Date;
  updated?: Date;
}

export const VelqenSmileDonorsSchema = new Schema<IVelqenSmileDonors>(
  {
  _id: { type: String, required: true },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  subject: { type: String, default: '' },
  message: { type: String, default: '' },
  contributionType: { type: String, default: '' },
  status: { type: String, default: '' , index: true},
  internalNotes: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'velqen_smile_donors',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const VelqenSmileDonorsModel = (mongoose.models['velqen_smile_donors'] as Model<IVelqenSmileDonors>) ||
  mongoose.model<IVelqenSmileDonors>('velqen_smile_donors', VelqenSmileDonorsSchema, 'velqen_smile_donors');

export default VelqenSmileDonorsModel;
