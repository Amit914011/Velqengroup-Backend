import { Router } from 'express';
import {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
} from '../controllers/records.controller.js';
import { securityGateMiddleware } from '../middlewares/securityGate.middleware.js';

export const recordsRouter = Router({ mergeParams: true });

recordsRouter.use(securityGateMiddleware);

recordsRouter.get('/', listRecords);
recordsRouter.get('/:id', getRecord);
recordsRouter.post('/', createRecord);
recordsRouter.patch('/:id', updateRecord);
recordsRouter.delete('/:id', deleteRecord);


