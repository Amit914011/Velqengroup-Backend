import mongoose, { Schema, Model } from 'mongoose';

export interface IWhatsappAccounts {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  employeeCode?: string;
  department?: string;
  phoneNumberId?: string;
  businessPhoneNumber?: string;
  wabaId?: string;
  whatsappEnabled?: boolean;
  connectionStatus?: string;
  lastWebhook?: Date | null;
  lastSync?: Date | null;
  created?: Date;
  updated?: Date;
}

export const WhatsappAccountsSchema = new Schema<IWhatsappAccounts>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null , index: true},
  employeeName: { type: String, default: '' },
  employeeCode: { type: String, default: '' },
  department: { type: String, default: '' },
  phoneNumberId: { type: String, default: '' },
  businessPhoneNumber: { type: String, default: '' },
  wabaId: { type: String, default: '' },
  whatsappEnabled: { type: Boolean, default: false , index: true},
  connectionStatus: { type: String, default: '' },
  lastWebhook: { type: Date, default: null },
  lastSync: { type: Date, default: null },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'whatsapp_accounts',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const WhatsappAccountsModel = (mongoose.models['whatsapp_accounts'] as Model<IWhatsappAccounts>) ||
  mongoose.model<IWhatsappAccounts>('whatsapp_accounts', WhatsappAccountsSchema, 'whatsapp_accounts');

export default WhatsappAccountsModel;
