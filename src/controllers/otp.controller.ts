import { Request, Response } from 'express';
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  sendEmailOtp,
  verifyEmailOtp,
} from '../services/otp.service.js';
import { sendPbError } from '../views/error.view.js';

// POST /api/otp/send (Phone)
export async function handleSendPhoneOtp(req: Request, res: Response): Promise<void> {
  const phone = String(req.body?.phone || '').trim();
  if (!phone || phone.length < 8) {
    sendPbError(res, 400, 'Valid phone number is required.');
    return;
  }
  const result = await sendPhoneOtp(phone, req.ip || '');
  if (!result.ok) {
    res.status(result.errorResponse?.code || 503).json(result.errorResponse);
    return;
  }
  res.json({ token: result.token, expiresAt: result.expiresAt });
}

// POST /api/otp/verify (Phone)
export async function handleVerifyPhoneOtp(req: Request, res: Response): Promise<void> {
  const phone = String(req.body?.phone || '').trim();
  const code = String(req.body?.code || req.body?.otp || '').trim();
  if (!phone || !code) {
    sendPbError(res, 400, 'Both phone and OTP code are required.');
    return;
  }
  const result = await verifyPhoneOtp(phone, code);
  if (!result.ok) {
    sendPbError(res, result.code || 400, result.message || 'Verification failed.');
    return;
  }
  res.json({ verified: true, token: result.token });
}

// POST /api/velqen-otp/send (Email)
export async function handleSendEmailOtp(req: Request, res: Response): Promise<void> {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    sendPbError(res, 400, 'Valid email address is required.');
    return;
  }
  const result = await sendEmailOtp(email, req.ip || '');
  if (!result.ok) {
    res.status(result.errorResponse?.code || 503).json(result.errorResponse);
    return;
  }
  res.json({ token: result.token, expiresAt: result.expiresAt });
}

// POST /api/velqen-otp/verify (Email)
export async function handleVerifyEmailOtp(req: Request, res: Response): Promise<void> {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const code = String(req.body?.code || req.body?.otp || '').trim();
  if (!email || !code) {
    sendPbError(res, 400, 'Both email and OTP code are required.');
    return;
  }
  const result = await verifyEmailOtp(email, code);
  if (!result.ok) {
    sendPbError(res, result.code || 400, result.message || 'Verification failed.');
    return;
  }
  res.json({ verified: true, token: result.token });
}

