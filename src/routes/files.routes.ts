import { Router } from 'express';
import { requestFileToken, serveFile } from '../controllers/files.controller.js';

export const filesRouter = Router();

filesRouter.post('/token', requestFileToken);
filesRouter.get('/:collection/:recordId/:filename', serveFile);

