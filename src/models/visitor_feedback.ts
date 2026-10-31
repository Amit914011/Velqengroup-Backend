import mongoose, { Schema, Model } from 'mongoose';

export interface IVisitorFeedback {
  _id: string;
  visitor?: string | null;
  manager?: string | null;
  managerName?: string;
  visitorName?: string;
  employeeName?: string;
  rating?: number;
  comments?: string;
  notes?: string;
  created?: Date;
  updated?: Date;
}

export const VisitorFeedbackSchema = new Schema<IVisitorFeedback>(
  {
  _id: { type: String, required: true },
  visitor: { type: String, ref: 'visitors', default: null },
  manager: { type: String, ref: 'users', default: null },
  managerName: { type: String, default: '' },
  visitorName: { type: String, default: '' },
  employeeName: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  comments: { type: String, default: '' },
  notes: { type: String, default: '' },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'visitor_feedback',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);



export const VisitorFeedbackModel = (mongoose.models['visitor_feedback'] as Model<IVisitorFeedback>) ||
  mongoose.model<IVisitorFeedback>('visitor_feedback', VisitorFeedbackSchema, 'visitor_feedback');

export default VisitorFeedbackModel;
