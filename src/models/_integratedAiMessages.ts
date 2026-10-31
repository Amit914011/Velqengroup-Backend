import mongoose, { Schema, Model } from 'mongoose';

export interface IIntegratedAiMessages {
  _id: string;
  userId?: string;
  role?: string;
  content?: Record<string, any> | any[] | any;
  created?: Date;
  updated?: Date;
}

export const IntegratedAiMessagesSchema = new Schema<IIntegratedAiMessages>(
  {
  _id: { type: String, required: true },
  userId: { type: String, default: '' , index: true},
  role: { type: String, default: '' },
  content: { type: Schema.Types.Mixed, default: {} },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: '_integratedAiMessages',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);


export const IntegratedAiMessagesModel = (mongoose.models['_integratedAiMessages'] as Model<IIntegratedAiMessages>) ||
  mongoose.model<IIntegratedAiMessages>('_integratedAiMessages', IntegratedAiMessagesSchema, '_integratedAiMessages');

export default IntegratedAiMessagesModel;
