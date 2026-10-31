import mongoose, { Schema, Model } from 'mongoose';

export interface ICarrierGoogleReputation {
  _id: string;
  dotNumber?: string;
  legalName?: string;
  googlePlaceId?: string;
  googleBusinessName?: string;
  googleRating?: number;
  googleReviewCount?: number;
  googleAddress?: string;
  googleMapsUri?: string;
  googleWebsite?: string;
  googlePhone?: string;
  matchConfidence?: string;
  matchReason?: string;
  reputationLabel?: string;
  googleCheckedAt?: string;
  payload?: Record<string, any> | any[] | any;
  created?: Date;
  updated?: Date;
}

export const CarrierGoogleReputationSchema = new Schema<ICarrierGoogleReputation>(
  {
  _id: { type: String, required: true },
  dotNumber: { type: String, default: '' , index: true},
  legalName: { type: String, default: '' },
  googlePlaceId: { type: String, default: '' },
  googleBusinessName: { type: String, default: '' },
  googleRating: { type: Number, default: 0 },
  googleReviewCount: { type: Number, default: 0 },
  googleAddress: { type: String, default: '' },
  googleMapsUri: { type: String, default: '' },
  googleWebsite: { type: String, default: '' },
  googlePhone: { type: String, default: '' },
  matchConfidence: { type: String, default: '' , index: true},
  matchReason: { type: String, default: '' },
  reputationLabel: { type: String, default: '' },
  googleCheckedAt: { type: String, default: '' },
  payload: { type: Schema.Types.Mixed, default: {} },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'carrier_google_reputation',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const CarrierGoogleReputationModel = (mongoose.models['carrier_google_reputation'] as Model<ICarrierGoogleReputation>) ||
  mongoose.model<ICarrierGoogleReputation>('carrier_google_reputation', CarrierGoogleReputationSchema, 'carrier_google_reputation');

export default CarrierGoogleReputationModel;
