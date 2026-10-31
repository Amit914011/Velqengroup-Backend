import mongoose, { Schema, Model } from 'mongoose';

export interface ICarrierVerifications {
  _id: string;
  owner?: string | null;
  ownerName?: string;
  query?: string;
  mcNumber?: string;
  usdotNumber?: string;
  legalName?: string;
  dbaName?: string;
  entityType?: string;
  physicalAddress?: string;
  phone?: string;
  powerUnits?: number;
  drivers?: number;
  operatingClassification?: string;
  cargoCarried?: string;
  carrierOperation?: string;
  dotStatus?: string;
  authorityStatus?: string;
  authorityTypes?: Record<string, any> | any[] | any;
  registrationDate?: string;
  authorityEffectiveDate?: string;
  mcs150Date?: string;
  authorityAgeMonths?: number;
  dotAgeMonths?: number;
  ageClassification?: string;
  originalIssueAvailable?: boolean;
  safetyRating?: string;
  safetyRatingDate?: string;
  inspectionSummary?: Record<string, any> | any[] | any;
  crashSummary?: Record<string, any> | any[] | any;
  insuranceStatus?: string;
  insuranceDetails?: Record<string, any> | any[] | any;
  pendingCancellation?: boolean;
  riskLevel?: string;
  riskFlags?: Record<string, any> | any[] | any;
  publicReputation?: Record<string, any> | any[] | any;
  sourceTimestamp?: string;
  checkedAt?: string;
  checkedBy?: string | null;
  checkedByName?: string;
  officialUrl?: string;
  cacheExpiresAt?: string;
  provider?: string;
  decision?: string;
  verificationPartial?: boolean;
  sections?: Record<string, any> | any[] | any;
  created?: Date;
  updated?: Date;
}

export const CarrierVerificationsSchema = new Schema<ICarrierVerifications>(
  {
  _id: { type: String, required: true },
  owner: { type: String, ref: 'logistics_users', default: null , index: true},
  ownerName: { type: String, default: '' },
  query: { type: String, default: '' },
  mcNumber: { type: String, default: '' , index: true},
  usdotNumber: { type: String, default: '' , index: true},
  legalName: { type: String, default: '' },
  dbaName: { type: String, default: '' },
  entityType: { type: String, default: '' },
  physicalAddress: { type: String, default: '' },
  phone: { type: String, default: '' },
  powerUnits: { type: Number, default: 0 },
  drivers: { type: Number, default: 0 },
  operatingClassification: { type: String, default: '' },
  cargoCarried: { type: String, default: '' },
  carrierOperation: { type: String, default: '' },
  dotStatus: { type: String, default: '' },
  authorityStatus: { type: String, default: '' },
  authorityTypes: { type: Schema.Types.Mixed, default: {} },
  registrationDate: { type: String, default: '' },
  authorityEffectiveDate: { type: String, default: '' },
  mcs150Date: { type: String, default: '' },
  authorityAgeMonths: { type: Number, default: 0 },
  dotAgeMonths: { type: Number, default: 0 },
  ageClassification: { type: String, default: '' },
  originalIssueAvailable: { type: Boolean, default: false },
  safetyRating: { type: String, default: '' },
  safetyRatingDate: { type: String, default: '' },
  inspectionSummary: { type: Schema.Types.Mixed, default: {} },
  crashSummary: { type: Schema.Types.Mixed, default: {} },
  insuranceStatus: { type: String, default: '' },
  insuranceDetails: { type: Schema.Types.Mixed, default: {} },
  pendingCancellation: { type: Boolean, default: false },
  riskLevel: { type: String, default: '' , index: true},
  riskFlags: { type: Schema.Types.Mixed, default: {} },
  publicReputation: { type: Schema.Types.Mixed, default: {} },
  sourceTimestamp: { type: String, default: '' },
  checkedAt: { type: String, default: '' },
  checkedBy: { type: String, ref: 'logistics_users', default: null },
  checkedByName: { type: String, default: '' },
  officialUrl: { type: String, default: '' },
  cacheExpiresAt: { type: String, default: '' },
  provider: { type: String, default: '' },
  decision: { type: String, default: '' },
  verificationPartial: { type: Boolean, default: false },
  sections: { type: Schema.Types.Mixed, default: {} },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'carrier_verifications',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const CarrierVerificationsModel = (mongoose.models['carrier_verifications'] as Model<ICarrierVerifications>) ||
  mongoose.model<ICarrierVerifications>('carrier_verifications', CarrierVerificationsSchema, 'carrier_verifications');

export default CarrierVerificationsModel;
