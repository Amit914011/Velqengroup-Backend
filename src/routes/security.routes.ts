import { Router } from 'express';
import {
  getSecurityStatus,
  verifySecurityPasscode,
  invalidateSecuritySession,
} from '../controllers/security.controller.js';
import {
  getAdminInfo,
  adminGeneratePasscode,
  adminCustomPasscode,
  adminDisablePasscode,
  adminEnablePasscode,
} from '../controllers/securityAdmin.controller.js';

export const securityRouter = Router();

// Employee verification routes
securityRouter.get('/status', getSecurityStatus);
securityRouter.post('/verify', verifySecurityPasscode);
securityRouter.post('/invalidate', invalidateSecuritySession);

// Admin management routes
securityRouter.get('/admin/info/:userId', getAdminInfo);
securityRouter.post('/admin/generate', adminGeneratePasscode);
securityRouter.post('/admin/regenerate', adminGeneratePasscode);
securityRouter.post('/admin/custom', adminCustomPasscode);
securityRouter.post('/admin/reset', adminGeneratePasscode);
securityRouter.post('/admin/disable', adminDisablePasscode);
securityRouter.post('/admin/enable', adminEnablePasscode);

