import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import {
  getLetters,
  getEmployeeLetters,
  getLetterById,
  generateLetter,
  autoGenerateLetters,
} from '../controllers/hr/letters.controller.js';

const router = Router();

router.get('/letters', requireAuth, getLetters);
router.get('/letters/employee/:employeeId', requireAuth, getEmployeeLetters);
router.get('/letters/:id', requireAuth, getLetterById);
router.post('/letters/generate', requireAuth, generateLetter);
router.post('/letters/auto-generate', requireAuth, autoGenerateLetters);

export default router;

