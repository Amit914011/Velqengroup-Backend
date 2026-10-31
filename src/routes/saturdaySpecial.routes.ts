import { Router } from 'express';
import { getSaturdaySpecialStatus, getSaturdaySpecialConfig } from '../controllers/saturdaySpecial.controller.js';

export const saturdaySpecialRouter = Router();

saturdaySpecialRouter.get('/status', getSaturdaySpecialStatus);
saturdaySpecialRouter.get('/config', getSaturdaySpecialConfig);

