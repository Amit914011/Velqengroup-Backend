import { Request, Response, NextFunction } from 'express';
import { resolveRole, UserRole } from '../services/roles.service.js';
import { sendPbError } from '../views/error.view.js';

// Require authenticated user session
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = (req as any).auth;
  if (!auth || (!auth.id && !auth._id)) {
    sendPbError(res, 401, 'The request requires valid authorization token.');
    return;
  }
  next();
}

// Require one of specified roles (admin and superuser always pass)
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const auth = (req as any).auth;
    if (!auth || (!auth.id && !auth._id)) {
      sendPbError(res, 401, 'The request requires valid authorization token.');
      return;
    }

    const currentRole = resolveRole(auth);
    if (currentRole === 'superuser' || currentRole === 'admin') {
      return next();
    }

    if (roles.includes(currentRole)) {
      return next();
    }

    sendPbError(res, 403, 'You do not have permission to perform this request.');
  };
}

// Require manager, admin, or superuser role
export const requireManager = requireRole('manager', 'admin', 'superuser');

// Require strictly superuser
export function requireSuperuser(req: Request, res: Response, next: NextFunction): void {
  const auth = (req as any).auth;
  if (!auth || resolveRole(auth) !== 'superuser') {
    sendPbError(res, 403, 'Superuser privileges required.');
    return;
  }
  next();
}

