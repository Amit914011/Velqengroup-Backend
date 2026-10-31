import mongoose from 'mongoose';
import { MONGODB_URI } from './environment.js';

mongoose.set('autoIndex', false);

export async function connectDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  return mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
}
