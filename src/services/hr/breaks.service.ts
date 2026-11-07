import { UsersModel } from '../../models/users.js';
import { NotificationsModel } from '../../models/notifications.js';

export function canManageBreaks(auth: any): boolean {
  if (!auth) return false;
  if (auth.role === 'admin' || auth.isSuperuser) return true;
  const perms = auth.permissions;
  if (!perms) return false;
  if (Array.isArray(perms)) return perms.includes('breakApproval') || perms.includes('manageTeam');
  if (typeof perms === 'object') return !!(perms.breakApproval || perms.manageTeam);
  return false;
}

export async function isTeamMember(managerId: string, employeeId: string, isAdmin = false): Promise<boolean> {
  if (isAdmin) return true;
  if (managerId === employeeId) return false;
  const emp = await UsersModel.findById(employeeId).lean();
  return !!emp && emp.manager === managerId;
}

export async function sendBreakNotification(opts: {
  recipient: string;
  recipientName?: string;
  title: string;
  message: string;
  senderName: string;
  meta?: Record<string, any>;
}): Promise<void> {
  try {
    await NotificationsModel.create({
      recipient: opts.recipient,
      title: opts.title,
      message: opts.message,
      category: 'System',
      link: '/portal/employee',
      senderName: opts.senderName,
      read: false,
      meta: opts.meta || {},
    });
  } catch (_) {}
}

