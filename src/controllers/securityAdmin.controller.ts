import { Request, Response } from 'express';
import { UsersModel } from '../models/users.js';
import { SecuritySessionsModel } from '../models/security_sessions.js';
import { generateInitialPasscode, hashPasscode } from '../utils/securityPasscode.js';
import { sendPbError } from '../views/error.view.js';

// Verify that caller has admin role
export function checkAdminAccess(req: Request, res: Response): boolean {
  const auth = (req as any).auth;
  if (!auth || auth.role !== 'admin') {
    sendPbError(res, 403, 'Admin access required.');
    return false;
  }
  return true;
}

// GET /api/security/admin/info/:userId
export async function getAdminInfo(req: Request, res: Response): Promise<void> {
  if (!checkAdminAccess(req, res)) return;
  const user = await UsersModel.findById(req.params.userId).lean();
  if (!user) {
    sendPbError(res, 404, 'Employee not found.');
    return;
  }
  const hash = user.security_passcode_hash || '';
  const configured = Boolean(hash && hash.length > 5);
  const status = user.security_passcode_status || (configured ? 'Active' : 'Setup Required');

  res.json({
    userId: user._id,
    employeeRecordId: user._id,
    status,
    configured,
    securityPasscodeConfigured: configured,
    securityStatus: String(status).toLowerCase().replace(/\s+/g, '_'),
    setAt: user.security_passcode_set_at || '',
    resetAt: user.security_passcode_reset_at || '',
    lastVerifiedAt: user.security_last_verified_at || '',
    failedAttempts: user.security_failed_attempts || 0,
    lockedUntil: user.security_locked_until || '',
    canGenerate: true,
  });
}

// Set formula passcode on target user
async function applyFormulaPasscode(userId: string): Promise<string | null> {
  const user = await UsersModel.findById(userId).lean();
  if (!user) return null;
  const passcode = generateInitialPasscode(user.employeeId, user.dateOfBirth || (user as any).dob, String(user._id));
  if (!passcode) return null;
  const stamp = new Date().toISOString();
  await UsersModel.findByIdAndUpdate(userId, {
    security_passcode_hash: hashPasscode(passcode),
    security_passcode_status: 'Active',
    security_passcode_set_at: stamp,
    security_passcode_reset_at: stamp,
    security_failed_attempts: 0,
    security_locked_until: '',
  });
  await SecuritySessionsModel.deleteMany({ user: userId });
  return passcode;
}

// POST /api/security/admin/generate and POST /api/security/admin/reset
export async function adminGeneratePasscode(req: Request, res: Response): Promise<void> {
  if (!checkAdminAccess(req, res)) return;
  const userId = req.body?.userId;
  if (!userId) {
    sendPbError(res, 400, 'userId is required.');
    return;
  }
  const passcode = await applyFormulaPasscode(userId);
  if (!passcode) {
    sendPbError(res, 400, 'Cannot generate formula passcode. Create a custom passcode instead.');
    return;
  }
  res.json({ success: true, passcode, status: 'Active', configured: true, employeeRecordId: userId });
}

// POST /api/security/admin/custom
export async function adminCustomPasscode(req: Request, res: Response): Promise<void> {
  if (!checkAdminAccess(req, res)) return;
  const { userId, passcode } = req.body || {};
  if (!userId || !passcode || String(passcode).length < 4) {
    sendPbError(res, 400, 'Passcode must be at least 4 characters.');
    return;
  }
  const stamp = new Date().toISOString();
  await UsersModel.findByIdAndUpdate(userId, {
    security_passcode_hash: hashPasscode(passcode),
    security_passcode_status: 'Active',
    security_passcode_set_at: stamp,
    security_passcode_reset_at: stamp,
    security_failed_attempts: 0,
    security_locked_until: '',
  });
  await SecuritySessionsModel.deleteMany({ user: userId });
  res.json({ success: true, status: 'Active', configured: true, employeeRecordId: userId });
}

// POST /api/security/admin/disable
export async function adminDisablePasscode(req: Request, res: Response): Promise<void> {
  if (!checkAdminAccess(req, res)) return;
  const userId = req.body?.userId;
  if (!userId) {
    sendPbError(res, 400, 'userId is required.');
    return;
  }
  await UsersModel.findByIdAndUpdate(userId, { security_passcode_status: 'Disabled' });
  await SecuritySessionsModel.deleteMany({ user: userId });
  res.json({ success: true, status: 'Disabled' });
}

// POST /api/security/admin/enable
export async function adminEnablePasscode(req: Request, res: Response): Promise<void> {
  if (!checkAdminAccess(req, res)) return;
  const userId = req.body?.userId;
  if (!userId) {
    sendPbError(res, 400, 'userId is required.');
    return;
  }
  const user = await UsersModel.findById(userId).lean();
  const next = user?.security_passcode_hash ? 'Active' : 'Setup Required';
  await UsersModel.findByIdAndUpdate(userId, { security_passcode_status: next });
  res.json({ success: true, status: next });
}

