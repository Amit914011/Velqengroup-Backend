import mongoose, { Schema, Model } from 'mongoose';

export interface IWhatsappTemplates {
  _id: string;
  whatsappAccountId?: string | null;
  templateName?: string;
  templateId?: string;
  language?: string;
  status?: string;
  category?: string;
  componentsJson?: Record<string, any> | any[] | any;
  created?: Date;
  updated?: Date;
}

export const WhatsappTemplatesSchema = new Schema<IWhatsappTemplates>(
  {
  _id: { type: String, required: true },
  whatsappAccountId: { type: String, ref: 'whatsapp_accounts', default: null },
  templateName: { type: String, default: '' , index: true},
  templateId: { type: String, default: '' },
  language: { type: String, default: '' },
  status: { type: String, default: '' },
  category: { type: String, default: '' },
  componentsJson: { type: Schema.Types.Mixed, default: {} },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'whatsapp_templates',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const WhatsappTemplatesModel = (mongoose.models['whatsapp_templates'] as Model<IWhatsappTemplates>) ||
  mongoose.model<IWhatsappTemplates>('whatsapp_templates', WhatsappTemplatesSchema, 'whatsapp_templates');

export default WhatsappTemplatesModel;
