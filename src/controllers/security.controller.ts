import { Request, Response } from 'express';
import { UsersModel } from '../models/users.js';
import { SecuritySessionsModel } from '../models/security_sessions.js';
import { generateInitialPasscode, hashPasscode, verifyPasscodeHash } from '../utils/securityPasscode.js';
import { generatePbId } from '../utils/idGenerator.js';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const LOCK_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 3;

// Resolve passcode state flags and status label
function getSecurityState(user: any): { hash: string; status: string; configured: boolean; locked: boolean } {
  const hash = user?.security_passcode_hash || '';
  const hasHash = Boolean(hash && hash.length > 5);
  let status = user?.security_passcode_status || '';
  if (!status) status = hasHash ? 'Active' : 'Setup Required';
  else if (hasHash && status !== 'Active' && status !== 'Disabled') status = 'Active';
  else if (!hasHash && status === 'Active') status = 'Setup Required';
  const configured = status === 'Active' && hasHash;
  const lockedUntil = user?.security_locked_until || '';
  const locked = Boolean(lockedUntil && Date.parse(lockedUntil) > Date.now());
  return { hash, status, configured, locked };
}

// Auto-provision initial formula passcode if employee has none
async function autoProvisionPasscode(user: any): Promise<boolean> {
  const code = generateInitialPasscode(user.employeeId, user.dateOfBirth || (user as any).dob, user._id);
  if (!code) return false;
  const stamp = new Date().toISOString();
  await UsersModel.findByIdAndUpdate(user._id, {
    security_passcode_hash: hashPasscode(code),
    security_passcode_status: 'Active',
    security_passcode_set_at: stamp,
    security_passcode_reset_at: stamp,
    security_failed_attempts: 0,
    security_locked_until: '',
  });
  return true;
}

// GET /api/security/status
export async function getSecurityStatus(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) {
    res.status(401).json({ code: 401, error: 'Please sign in again.', authMissing: true, message: 'Please sign in again.', data: {} });
    return;
  }
  const uid = String(auth.id || auth._id || '');
  if (auth.role !== 'employee') {
    res.json({ verified: true, applicable: false, configured: true, status: 'Active', statusKey: 'active', authUserId: uid, employeeRecordId: uid });
    return;
  }

  const user = await UsersModel.findById(uid).lean();
  let state = getSecurityState(user);
  if (!state.configured && state.status !== 'Disabled' && user) {
    if (await autoProvisionPasscode(user)) {
      state = getSecurityState(await UsersModel.findById(uid).lean());
    }
  }

  const sessions = await SecuritySessionsModel.find({ user: uid }).lean();
  const now = Date.now();
  const verified = sessions.some((s) => !Number.isNaN(Date.parse(s.expiresAt || '')) && Date.parse(s.expiresAt || '') > now);
  const statusKey = state.configured ? 'active' : state.status === 'Disabled' ? 'disabled' : 'setup_required';

  res.json({
    applicable: true,
    verified,
    configured: state.configured,
    status: state.status,
    statusKey,
    locked: state.locked,
    lockedUntil: user?.security_locked_until || '',
    failedAttempts: user?.security_failed_attempts || 0,
    securityPasscodeConfigured: state.configured,
    authUserId: uid,
    employeeRecordId: uid,
  });
}

// POST /api/security/verify
export async function verifySecurityPasscode(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) {
    res.status(401).json({ code: 401, error: 'Please sign in again.', authMissing: true, message: 'Please sign in again.', data: {} });
    return;
  }
  const passcode = String(req.body?.passcode || '').trim();
  const purpose = String(req.body?.purpose || 'login');
  if (!passcode) {
    res.status(400).json({ code: 400, error: 'Enter your security passcode.', message: 'Enter your security passcode.', data: {} });
    return;
  }
  if (auth.role !== 'employee') {
    res.status(403).json({ code: 403, error: 'Security verification is for employee accounts only.', message: 'Security verification is for employee accounts only.', data: {} });
    return;
  }

  const uid = String(auth.id || auth._id || '');
  const user = await UsersModel.findById(uid).lean();
  const state = getSecurityState(user);
  if (state.status === 'Disabled') {
    res.status(403).json({ code: 403, error: 'Your security passcode is disabled. Contact your administrator.', message: 'Your security passcode is disabled.', data: {} });
    return;
  }
  if (!state.configured) {
    res.status(403).json({ code: 403, error: 'Your security passcode is not set up yet.', setupRequired: true, configured: false, message: 'Not setup.', data: {} });
    return;
  }
  if (state.locked) {
    res.status(403).json({ code: 403, error: 'Too many incorrect attempts. Please try again after 5 minutes.', locked: true, lockedUntil: user?.security_locked_until, message: 'Account locked.', data: {} });
    return;
  }

  if (!verifyPasscodeHash(passcode, state.hash)) {
    const attempts = ((user?.security_failed_attempts as number) || 0) + 1;
    if (attempts >= MAX_ATTEMPTS) {
      const lockDate = new Date(Date.now() + LOCK_MS).toISOString();
      await UsersModel.findByIdAndUpdate(uid, { security_locked_until: lockDate, security_failed_attempts: 0 });
      res.status(403).json({ code: 403, error: 'Too many incorrect attempts. Your account is locked for 5 minutes.', locked: true, message: 'Account locked.', data: {} });
      return;
    }
    await UsersModel.findByIdAndUpdate(uid, { security_failed_attempts: attempts });
    res.status(400).json({ code: 400, error: 'Incorrect security passcode. Please try again.', message: 'Incorrect security passcode. Please try again.', data: {} });
    return;
  }

  const expDate = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const nowIso = new Date().toISOString();
  await SecuritySessionsModel.create({
    _id: generatePbId(),
    user: uid,
    verifiedAt: nowIso,
    expiresAt: expDate,
    purpose,
    ip: req.ip || '',
    userAgent: (req.headers['user-agent'] || '').slice(0, 300),
  });
  await UsersModel.findByIdAndUpdate(uid, { security_failed_attempts: 0, security_locked_until: '', security_last_verified_at: nowIso });
  res.json({ success: true, verified: true });
}

// POST /api/security/invalidate
export async function invalidateSecuritySession(req: Request, res: Response): Promise<void> {
  const uid = (req as any).auth?.id || (req as any).auth?._id;
  if (uid) {
    await SecuritySessionsModel.deleteMany({ user: uid });
  }
  res.json({ success: true });
}

