import { Request, Response, NextFunction } from 'express';
import { sendPbError } from '../views/error.view.js';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const hits = new Map<string, RateLimitRecord>();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_ATTEMPTS = 10; // max 10 attempts per minute

// Evict expired rate limit windows every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of hits.entries()) {
    if (now > record.resetAt) hits.delete(key);
  }
}, WINDOW_MS).unref();

// Rate limiter for auth endpoints: 10 attempts per minute per IP and identity
export function authRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const identity = String(req.body?.identity || req.body?.email || '').trim().toLowerCase();
  const key = `${ip}:${identity}`;
  const now = Date.now();

  const current = hits.get(key);
  if (!current || now > current.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (current.count >= MAX_ATTEMPTS) {
    return sendPbError(res, 429, 'Too many auth requests. Please try again later.');
  }

  current.count++;
  next();
}

