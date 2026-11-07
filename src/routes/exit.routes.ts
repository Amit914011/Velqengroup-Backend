import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import { markExitAction } from '../controllers/hr/exit.controller.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024 } });
const router = Router();

router.post('/manager/mark-exit', requireAuth, upload.any(), markExitAction);

export default router;

