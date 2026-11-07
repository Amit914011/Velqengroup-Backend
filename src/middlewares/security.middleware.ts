import { Request, Response, NextFunction } from 'express';
import { sendPbError } from '../views/error.view.js';

function hasDollarKey(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) return true;
    if (typeof obj[key] === 'object' && hasDollarKey(obj[key])) return true;
  }
  return false;
}

// Add standard HTTP security headers and sanitize request parameters
export function securityMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (hasDollarKey(req.body) || hasDollarKey(req.query)) {
    sendPbError(res, 400, 'Invalid input: operator keys starting with $ are not permitted.');
    return;
  }

  const filter = req.query.filter;
  if (typeof filter === 'string' && filter.length > 5000) {
    sendPbError(res, 400, 'Filter parameter exceeds maximum allowed length.');
    return;
  }

  next();
}
