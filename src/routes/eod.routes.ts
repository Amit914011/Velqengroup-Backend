import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import {
  reviewEod,
  deleteEod,
  compileEod,
  sendCompiledEod,
  getCompiledEods,
  getCompiledEodById,
} from '../controllers/hr/eod.controller.js';

const router = Router();

router.post('/manager/review-eod', requireAuth, reviewEod);
router.post('/manager/delete-eod', requireAuth, deleteEod);
router.post('/manager/compile-eod', requireAuth, compileEod);
router.post('/manager/send-compiled-eod', requireAuth, sendCompiledEod);
router.get('/manager/compiled-eods', requireAuth, getCompiledEods);
router.get('/manager/compiled-eods/:id', requireAuth, getCompiledEodById);

export default router;

