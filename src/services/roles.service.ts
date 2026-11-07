import { RECEPTION_EMAILS } from '../config/environment.js';

export type UserRole =
  | 'superuser'
  | 'admin'
  | 'manager'
  | 'employee'
  | 'filling_officer'
  | 'reception'
  | 'ca'
  | 'client'
  | 'volunteer'
  | 'logistics_user'
  | 'marketplace_user'
  | 'anonymous';

const MANAGER_PERMISSION_KEYS = [
  'addEmployee',
  'breakApproval',
  'eodCheck',
  'viewReports',
  'manageTeam',
  'approveLeave',
  'assignTargets',
];

const FO_PERMISSION_KEYS = [
  'viewAllocatedClients',
  'changeClientStatus',
  'manageClientDocuments',
  'requestClientDocuments',
  'clientEmailAccess',
];

// Check if user has permission key
export function hasPermission(permissions: unknown, key: string): boolean {
  if (!permissions) return false;
  let p: any = permissions;
  if (typeof p === 'string') {
    try {
      p = JSON.parse(p);
    } catch {
      return false;
    }
  }
  if (Array.isArray(p)) return p.includes(key);
  if (typeof p === 'object' && p !== null) return p[key] === true || p[key] === 'true';
  return false;
}

// Designation matchers
export function isManagerDesignation(d?: string | null): boolean {
  if (!d) return false;
  return /manager/i.test(d) || d.trim().toLowerCase() === 'team lead';
}

export function isCADesignation(d?: string | null): boolean {
  if (!d) return false;
  const lower = d.trim().toLowerCase();
  return lower === 'ca (chartered accountant)' || lower.includes('chartered accountant') || lower.startsWith('ca ');
}

export function isFillingOfficerDesignation(d?: string | null): boolean {
  if (!d) return false;
  const clean = d.trim().toLowerCase().replace(/[\s_-]+/g, '');
  return clean === 'fillingofficer' || clean.includes('fillingofficer');
}

export function isReceptionistDesignation(d?: string | null): boolean {
  if (!d) return false;
  return d.trim().toLowerCase() === 'receptionist';
}

// Role predicate helpers
export function isReceptionUser(user: any): boolean {
  if (!user) return false;
  const email = String(user.email || '').trim().toLowerCase();
  const allowlist = (RECEPTION_EMAILS || 'reception@velqengroup.com,receiption@velqengroup.com')
    .toLowerCase()
    .split(',')
    .map((s) => s.trim());
  if (email && allowlist.includes(email)) return true;
  return isReceptionistDesignation(user.designation);
}

export function isCaUser(user: any): boolean {
  if (!user) return false;
  if (user.role === 'ca') return true;
  if (user.department === 'Chartered Accountant') return true;
  return isCADesignation(user.designation);
}

export function isManagerUser(user: any): boolean {
  if (!user) return false;
  if (user.role !== 'employee') return false;
  if (isManagerDesignation(user.designation)) return true;
  const perms = user.permissions || user.designation_permissions;
  return MANAGER_PERMISSION_KEYS.some((k) => hasPermission(perms, k));
}

export function isFillingOfficerUser(user: any): boolean {
  if (!user) return false;
  if (user.role !== 'employee') return false;
  if (isFillingOfficerDesignation(user.designation)) return true;
  const perms = user.permissions || user.designation_permissions;
  return FO_PERMISSION_KEYS.some((k) => hasPermission(perms, k));
}

// Master role resolver function
export function resolveRole(user: any): UserRole {
  if (!user || (!user.id && !user._id)) return 'anonymous';

  const colName = user.collectionName || '';
  if (colName === '_superusers') return 'superuser';
  if (colName === 'logistics_users') return 'logistics_user';
  if (colName === 'marketplace_users') return 'marketplace_user';

  const role = String(user.role || '').toLowerCase();
  if (role === 'admin' || role === 'founder') return 'admin';
  if (isReceptionUser(user)) return 'reception';
  if (isCaUser(user)) return 'ca';
  if (isFillingOfficerUser(user)) return 'filling_officer';
  if (isManagerUser(user)) return 'manager';
  if (role === 'employee') return 'employee';
  if (role === 'client') return 'client';
  if (role === 'volunteer') return 'volunteer';

  return (role as UserRole) || 'anonymous';
}

