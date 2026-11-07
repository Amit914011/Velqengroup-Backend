import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import { getCaDocuments } from '../controllers/finance/ca.controller.js';

const router = Router();

router.get('/ca/documents', requireAuth, getCaDocuments);

export default router;

