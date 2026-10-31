import mongoose, { Schema, Model } from 'mongoose';

export interface IFmcsaCarriers {
  _id: string;
  dotNumber?: string;
  statusCode?: string;
  docket1Prefix?: string;
  docket1?: string;
  docket1Status?: string;
  docket2Prefix?: string;
  docket2?: string;
  docket2Status?: string;
  docket3Prefix?: string;
  docket3?: string;
  docket3Status?: string;
  legalName?: string;
  dbaName?: string;
  phyStreet?: string;
  phyCity?: string;
  phyState?: string;
  phyZip?: string;
  phyCountry?: string;
  phyCnty?: string;
  mailStreet?: string;
  mailCity?: string;
  mailState?: string;
  mailZip?: string;
  mailCountry?: string;
  phone?: string;
  cellPhone?: string;
  fax?: string;
  email?: string;
  businessOrgDesc?: string;
  companyOfficer1?: string;
  companyOfficer2?: string;
  carrierOperation?: string;
  classdef?: string;
  truckUnits?: number;
  powerUnits?: number;
  busUnits?: number;
  fleetSize?: number;
  totalDrivers?: number;
  totalCdl?: number;
  driverInterTotal?: number;
  totalIntrastateDrivers?: number;
  mcs150Date?: string;
  mcs150Mileage?: number;
  mcs150MileageYear?: string;
  hmInd?: string;
  priorRevokeFlag?: string;
  priorRevokeDotNumber?: string;
  reviewId?: string;
  reviewType?: string;
  reviewDate?: string;
  safetyRating?: string;
  safetyRatingDate?: string;
  undelivPhy?: string;
  cargoCategories?: Record<string, any> | any[] | any;
  cargoOtherDesc?: string;
  rawData?: Record<string, any> | any[] | any;
  sourceFile?: string;
  sourceImportDate?: string;
  created?: Date;
  updated?: Date;
}

export const FmcsaCarriersSchema = new Schema<IFmcsaCarriers>(
  {
  _id: { type: String, required: true },
  dotNumber: { type: String, default: '' , index: true},
  statusCode: { type: String, default: '' , index: true},
  docket1Prefix: { type: String, default: '' },
  docket1: { type: String, default: '' , index: true},
  docket1Status: { type: String, default: '' },
  docket2Prefix: { type: String, default: '' },
  docket2: { type: String, default: '' , index: true},
  docket2Status: { type: String, default: '' },
  docket3Prefix: { type: String, default: '' },
  docket3: { type: String, default: '' , index: true},
  docket3Status: { type: String, default: '' },
  legalName: { type: String, default: '' , index: true},
  dbaName: { type: String, default: '' , index: true},
  phyStreet: { type: String, default: '' },
  phyCity: { type: String, default: '' },
  phyState: { type: String, default: '' },
  phyZip: { type: String, default: '' },
  phyCountry: { type: String, default: '' },
  phyCnty: { type: String, default: '' },
  mailStreet: { type: String, default: '' },
  mailCity: { type: String, default: '' },
  mailState: { type: String, default: '' },
  mailZip: { type: String, default: '' },
  mailCountry: { type: String, default: '' },
  phone: { type: String, default: '' },
  cellPhone: { type: String, default: '' },
  fax: { type: String, default: '' },
  email: { type: String, default: '' },
  businessOrgDesc: { type: String, default: '' },
  companyOfficer1: { type: String, default: '' },
  companyOfficer2: { type: String, default: '' },
  carrierOperation: { type: String, default: '' },
  classdef: { type: String, default: '' },
  truckUnits: { type: Number, default: 0 },
  powerUnits: { type: Number, default: 0 },
  busUnits: { type: Number, default: 0 },
  fleetSize: { type: Number, default: 0 },
  totalDrivers: { type: Number, default: 0 },
  totalCdl: { type: Number, default: 0 },
  driverInterTotal: { type: Number, default: 0 },
  totalIntrastateDrivers: { type: Number, default: 0 },
  mcs150Date: { type: String, default: '' },
  mcs150Mileage: { type: Number, default: 0 },
  mcs150MileageYear: { type: String, default: '' },
  hmInd: { type: String, default: '' },
  priorRevokeFlag: { type: String, default: '' },
  priorRevokeDotNumber: { type: String, default: '' },
  reviewId: { type: String, default: '' },
  reviewType: { type: String, default: '' },
  reviewDate: { type: String, default: '' },
  safetyRating: { type: String, default: '' },
  safetyRatingDate: { type: String, default: '' },
  undelivPhy: { type: String, default: '' },
  cargoCategories: { type: Schema.Types.Mixed, default: {} },
  cargoOtherDesc: { type: String, default: '' },
  rawData: { type: Schema.Types.Mixed, default: {} },
  sourceFile: { type: String, default: '' },
  sourceImportDate: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'fmcsa_carriers',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

FmcsaCarriersSchema.index({"docket1Prefix":1,"docket1":1});
FmcsaCarriersSchema.index({"docket2Prefix":1,"docket2":1});
FmcsaCarriersSchema.index({"docket3Prefix":1,"docket3":1});

export const FmcsaCarriersModel = (mongoose.models['fmcsa_carriers'] as Model<IFmcsaCarriers>) ||
  mongoose.model<IFmcsaCarriers>('fmcsa_carriers', FmcsaCarriersSchema, 'fmcsa_carriers');

export default FmcsaCarriersModel;
