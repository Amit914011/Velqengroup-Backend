import { Request, Response, NextFunction } from 'express';
import { SecuritySessionsModel } from '../models/security_sessions.js';
import { loadRules } from '../utils/rules/ruleLoader.js';
import { sendPbError } from '../views/error.view.js';

// Collections accessed during initial login or non-sensitive system keepalives
const SECURITY_ALLOWLIST = new Set([
  'users',
  'device_security',
  'employee_breaks',
  'security_sessions',
  'notifications',
  'broadcasts',
  '_superusers',
  'external_auths',
  'trusted_devices',
  'login_attempts',
  'realtime_heartbeat',
]);

// Determine if a collection rule permits anonymous or public access
function isRulePublic(rule?: string | null): boolean {
  if (rule === '' || rule === '""') return true;
  if (!rule) return false;
  const parts = String(rule).split(' || ');
  return parts.some((p) => !p.includes('@request.auth'));
}

// Get the corresponding action rule for the HTTP request method
function getActionRule(rules: any, method: string, isDetail: boolean): string | null {
  if (method === 'GET') return isDetail ? rules.viewRule : rules.listRule;
  if (method === 'POST') return rules.createRule;
  if (method === 'PATCH' || method === 'PUT') return rules.updateRule;
  if (method === 'DELETE') return rules.deleteRule;
  return null;
}

// Security gate: blocks employee access to protected collections without an active security session
export async function securityGateMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = (req as any).auth;
  if (!auth || auth.role !== 'employee' || auth.department === 'Chartered Accountant') {
    return next();
  }

  const col = req.params.collection;
  if (!col || SECURITY_ALLOWLIST.has(col)) {
    return next();
  }

  const allRules = loadRules();
  const colRules = allRules[col];
  if (colRules) {
    const isDetail = Boolean(req.params.id);
    const rule = getActionRule(colRules, req.method, isDetail);
    if (isRulePublic(rule)) return next();
  }

  try {
    const sessions = await SecuritySessionsModel.find({ user: auth.id }).lean();
    const nowMs = Date.now();
    const hasValidSession = sessions.some((s) => {
      const expMs = Date.parse(String(s.expiresAt || ''));
      return !Number.isNaN(expMs) && expMs > nowMs;
    });

    if (hasValidSession) return next();
    return sendPbError(res, 403, 'Security verification required.');
  } catch (_) {
    return next(); // Fail open on database error to avoid bricking all access
  }
}

