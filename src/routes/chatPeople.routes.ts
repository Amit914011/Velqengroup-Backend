import { Router } from 'express';
import { getChatPeople } from '../controllers/chatPeople.controller.js';

export const chatPeopleRouter = Router();

chatPeopleRouter.get('/people', getChatPeople);

