import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { UsersModel } from '../../models/users.js';
import { PasswordResetRequestsModel } from '../../models/password_reset_requests.js';
import { sendPbError } from '../../views/error.view.js';

export async function setPassword(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (auth.role !== 'admin' && !auth.isSuperuser) {
    return sendPbError(res, 403, 'Only administrators can change passwords.');
  }

  const { userId, password } = req.body || {};
  if (!userId || !password) {
    return sendPbError(res, 400, 'userId and password are required.');
  }
  if (String(password).length < 7) {
    return sendPbError(res, 400, 'Password must be at least 7 characters.');
  }

  const user = await UsersModel.findById(userId);
  if (!user) return sendPbError(res, 404, 'User not found.');

  user.password = await bcrypt.hash(password, 12);
  await user.save();
  res.json({ success: true, email: user.email || '' });
}

export async function generateResetLink(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (auth.role !== 'admin' && !auth.isSuperuser) {
    return sendPbError(res, 403, 'Only administrators can generate reset links.');
  }

  const { userId } = req.body || {};
  if (!userId) return sendPbError(res, 400, 'userId is required.');

  const user = await UsersModel.findById(userId);
  if (!user) return sendPbError(res, 404, 'User not found.');

  const token = crypto.randomBytes(32).toString('hex');
  res.json({ token, email: user.email || '' });
}

export async function requestPasswordReset(req: Request, res: Response): Promise<void> {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) return sendPbError(res, 400, 'Email is required.');

  const user = await UsersModel.findOne({ email });
  if (user) {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      await PasswordResetRequestsModel.create({
        email,
        name: user.name || '',
        token,
        status: 'Pending',
      });
    } catch (_) {}
  }

  res.json({ success: true });
}

