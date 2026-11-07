import { Router } from 'express';
import { requireAuth } from '../middlewares/rbac.middleware.js';
import {
  getClientsAction,
  changeClientStatusAction,
  changeApplicationStatusAction,
  getDocumentsAction,
  requestDocumentsAction,
  allocateFOAction,
  listFOsAction,
  getClientStatusHistoryAction,
  getApplicationStatusHistoryAction,
  assertClientAccessAction,
} from '../controllers/crm/fillingOfficer.controller.js';

const router = Router();

router.get('/filling-officer/clients', requireAuth, getClientsAction);
router.post('/filling-officer/change-client-status', requireAuth, changeClientStatusAction);
router.post('/filling-officer/change-application-status', requireAuth, changeApplicationStatusAction);
router.get('/filling-officer/documents', requireAuth, getDocumentsAction);
router.post('/filling-officer/request-documents', requireAuth, requestDocumentsAction);
router.post('/admin/allocate-filling-officer', requireAuth, allocateFOAction);
router.get('/admin/filling-officers', requireAuth, listFOsAction);
router.get('/filling-officer/client-status-history/:leadId', requireAuth, getClientStatusHistoryAction);
router.get('/filling-officer/application-status-history/:leadId', requireAuth, getApplicationStatusHistoryAction);
router.post('/filling-officer/assert-client-access', requireAuth, assertClientAccessAction);

export default router;

