import { Router } from 'express';
import multer from 'multer';
import {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
} from '../controllers/records.controller.js';
import { securityGateMiddleware } from '../middlewares/securityGate.middleware.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const recordsRouter = Router({ mergeParams: true });

recordsRouter.use(securityGateMiddleware);

recordsRouter.get('/', listRecords);
recordsRouter.get('/:id', getRecord);
recordsRouter.post('/', upload.any(), createRecord);
recordsRouter.patch('/:id', upload.any(), updateRecord);
recordsRouter.delete('/:id', deleteRecord);
