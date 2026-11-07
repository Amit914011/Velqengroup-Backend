import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import {
  submitChangeRequest,
  addEmployeeDirectAction,
  editEmployeeDirectAction,
  getManagerChangeRequests,
  getAdminChangeRequests,
} from '../controllers/hr/employeeChange.controller.js';
import {
  approveChangeRequest,
  rejectChangeRequest,
  bulkProcessRequests,
} from '../controllers/hr/employeeApproval.controller.js';
import {
  uploadIdentityFiles,
  getEmployeeDocuments,
  uploadEmployeeDocument,
  streamDocumentFile,
  streamIdentityFile,
} from '../controllers/hr/employeeDocs.controller.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024 } });
const router = Router();

router.post('/manager/employee-change-request', requireAuth, submitChangeRequest);
router.post('/manager/add-employee-direct', requireAuth, addEmployeeDirectAction);
router.post('/manager/edit-employee-direct', requireAuth, editEmployeeDirectAction);
router.get('/manager/employee-change-requests', requireAuth, getManagerChangeRequests);
router.get('/admin/employee-change-requests', requireAuth, getAdminChangeRequests);

router.post('/admin/employee-change-request/approve', requireAuth, approveChangeRequest);
router.post('/admin/employee-change-request/reject', requireAuth, rejectChangeRequest);
router.post('/admin/employee-change-requests/bulk', requireAuth, bulkProcessRequests);

router.post('/manager/employee-identity-files', requireAuth, upload.any(), uploadIdentityFiles);
router.get('/manager/employee-documents', requireAuth, getEmployeeDocuments);
router.post('/manager/employee-document', requireAuth, upload.any(), uploadEmployeeDocument);
router.get('/manager/employee-document-file/:id', requireAuth, streamDocumentFile);
router.get('/manager/employee-identity-file', requireAuth, streamIdentityFile);

export default router;

