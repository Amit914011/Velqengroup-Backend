import { Request, Response, NextFunction } from 'express';
import { sendPbError } from '../views/error.view.js';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const authHits = new Map<string, RateLimitRecord>();
const globalHits = new Map<string, RateLimitRecord>();
const strictHits = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 1000;
const AUTH_MAX = 15;
const GLOBAL_MAX = 1000;
const STRICT_MAX = 20;

function cleanupMap(map: Map<string, RateLimitRecord>): void {
  const now = Date.now();
  for (const [key, record] of map.entries()) {
    if (now > record.resetAt) map.delete(key);
  }
}

setInterval(() => {
  cleanupMap(authHits);
  cleanupMap(globalHits);
  cleanupMap(strictHits);
}, WINDOW_MS).unref();

function checkLimit(
  map: Map<string, RateLimitRecord>,
  key: string,
  limit: number,
  res: Response,
  next: NextFunction,
  message: string
): void {
  const now = Date.now();
  const current = map.get(key);
  if (!current || now > current.resetAt) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (current.count >= limit) {
    sendPbError(res, 429, message);
    return;
  }

  current.count++;
  next();
}

// 1. Auth rate limiter: 15 attempts / min per IP + identity
export function authRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const identity = String(req.body?.identity || req.body?.email || '').trim().toLowerCase();
  checkLimit(authHits, `${ip}:${identity}`, AUTH_MAX, res, next, 'Too many auth requests. Please try again later.');
}

// 2. Global rate limiter: 1000 requests / min per IP
export function globalRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  checkLimit(globalHits, ip, GLOBAL_MAX, res, next, 'Too many requests. Please slow down.');
}

// 3. Strict rate limiter for OTP, password reset, file tokens: 20 attempts / min per IP
export function strictRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  checkLimit(strictHits, ip, STRICT_MAX, res, next, 'Rate limit exceeded for sensitive operation.');
}
