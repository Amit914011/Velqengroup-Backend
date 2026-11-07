import { Router } from 'express';
import multer from 'multer';
import os from 'node:os';
import {
  getStatus, getDataset, getImports, deleteImport, lookup, explainLookup,
  importDataset, importPdf, getReputationStatus, getReputation,
} from '../controllers/logistics/carrierVerify.controller.js';
import { requireRole } from '../middlewares/rbac.middleware.js';

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 2 * 1024 * 1024 * 1024, fieldSize: 256 * 1024 },
});
const pdfUpload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 200 * 1024 * 1024, fieldSize: 256 * 1024 },
});
const router = Router();

router.get('/status', getStatus);
router.get('/dataset', getDataset);
router.get('/imports', requireRole('admin', 'superuser'), getImports);
router.delete('/imports/:id', requireRole('admin', 'superuser'), deleteImport);
router.get('/lookup', lookup);
router.get('/lookup/explain', explainLookup);
router.post('/import', requireRole('admin', 'superuser'), upload.single('file'), importDataset);
router.post('/import-pdf', requireRole('admin', 'superuser'), pdfUpload.single('file'), importPdf);
router.get('/reputation/status', getReputationStatus);
router.post('/reputation', getReputation);

export default router;

