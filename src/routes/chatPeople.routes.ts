import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import { getChatPeople, recordAdminAccessLog } from '../controllers/chatPeople.controller.js';

export const chatPeopleRouter = Router();

chatPeopleRouter.get('/people', requireAuth, getChatPeople);
chatPeopleRouter.post('/admin/access-log', requireAuth, recordAdminAccessLog);
