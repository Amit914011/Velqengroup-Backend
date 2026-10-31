import { Router } from 'express';
import { healthCheck, collectionsSummary } from '../controllers/health.controller.js';
import { recordsRouter } from './records.routes.js';
import { authRouter } from './auth.routes.js';
import { securityRouter } from './security.routes.js';
import { realtimeRouter } from './realtime.routes.js';
import { chatPeopleRouter } from './chatPeople.routes.js';
import { saturdaySpecialRouter } from './saturdaySpecial.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', healthCheck);
apiRouter.get('/collections', collectionsSummary);
apiRouter.use('/realtime', realtimeRouter);
apiRouter.use('/security', securityRouter);
apiRouter.use('/chat', chatPeopleRouter);
apiRouter.use('/saturday-special', saturdaySpecialRouter);
apiRouter.use('/collections/:collection/records', recordsRouter);
apiRouter.use('/collections/:collection', authRouter);



