import { Router } from 'express';
import { connectRealtime, updateSubscriptions } from '../controllers/realtime.controller.js';

export const realtimeRouter = Router();

realtimeRouter.get('/', connectRealtime);
realtimeRouter.post('/', updateSubscriptions);

