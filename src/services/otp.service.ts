import crypto from 'crypto';
import { PhoneOtpsModel } from '../models/phone_otps.js';
import { EmailOtpsModel } from '../models/email_otps.js';
import { generatePbId } from '../utils/idGenerator.js';
import { checkIntegrationAllowed } from '../utils/integrationGate.js';

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

function generateCode(): string {
  return String(crypto.randomInt(100000, 999999));
}

// Send Phone OTP through Twilio via integration gate
export async function sendPhoneOtp(phone: string, ip: string = '') {
  const gate = checkIntegrationAllowed('twilio');
  if (!gate.allowed) return { ok: false, errorResponse: gate.errorResponse };

  const code = generateCode();
  const token = generatePbId();
  const recordId = generatePbId();
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  await PhoneOtpsModel.create({
    _id: recordId,
    phone: phone.trim(),
    code,
    token,
    expiresAt,
    attempts: 0,
    verified: false,
    consumed: false,
    ip,
    created: new Date(),
    updated: new Date(),
  });

  return { ok: true, token, expiresAt };
}

// Verify Phone OTP code
export async function verifyPhoneOtp(phone: string, code: string) {
  const cleanPhone = phone.trim();
  const cleanCode = code.trim();

  const record = await PhoneOtpsModel.findOne({
    phone: cleanPhone,
    consumed: { $ne: true },
  }).sort({ created: -1 });

  if (!record) return { ok: false, code: 400, message: 'No OTP request found for this phone.' };
  if (record.attempts && record.attempts >= MAX_ATTEMPTS) {
    return { ok: false, code: 400, message: 'Too many failed attempts. Request a new OTP.' };
  }
  if (!record.expiresAt || Date.now() > record.expiresAt) {
    return { ok: false, code: 400, message: 'OTP has expired. Please request a new one.' };
  }

  if (record.code !== cleanCode) {
    record.attempts = (record.attempts || 0) + 1;
    await record.save();
    return { ok: false, code: 400, message: 'Invalid OTP code.' };
  }

  record.verified = true;
  record.consumed = true;
  await record.save();

  return { ok: true, verified: true, token: record.token };
}

// Send Email OTP through SMTP via integration gate
export async function sendEmailOtp(email: string, ip: string = '') {
  const gate = checkIntegrationAllowed('smtp');
  if (!gate.allowed) return { ok: false, errorResponse: gate.errorResponse };

  const code = generateCode();
  const token = generatePbId();
  const recordId = generatePbId();
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  await EmailOtpsModel.create({
    _id: recordId,
    email: email.trim().toLowerCase(),
    code,
    token,
    expiresAt,
    attempts: 0,
    verified: false,
    consumed: false,
    ip,
    created: new Date(),
    updated: new Date(),
  });

  return { ok: true, token, expiresAt };
}

// Verify Email OTP code
export async function verifyEmailOtp(email: string, code: string) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  const record = await EmailOtpsModel.findOne({
    email: cleanEmail,
    consumed: { $ne: true },
  }).sort({ created: -1 });

  if (!record) return { ok: false, code: 400, message: 'No OTP request found for this email.' };
  if (record.attempts && record.attempts >= MAX_ATTEMPTS) {
    return { ok: false, code: 400, message: 'Too many failed attempts. Request a new OTP.' };
  }
  if (!record.expiresAt || Date.now() > record.expiresAt) {
    return { ok: false, code: 400, message: 'OTP has expired. Please request a new one.' };
  }

  if (record.code !== cleanCode) {
    record.attempts = (record.attempts || 0) + 1;
    await record.save();
    return { ok: false, code: 400, message: 'Invalid OTP code.' };
  }

  record.verified = true;
  record.consumed = true;
  await record.save();

  return { ok: true, verified: true, token: record.token };
}

