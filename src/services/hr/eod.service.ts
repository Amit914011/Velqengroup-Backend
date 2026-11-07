import { UsersModel } from '../../models/users.js';
import { NotificationsModel } from '../../models/notifications.js';

export function canManageEod(auth: any): boolean {
  if (!auth) return false;
  if (auth.role === 'admin' || auth.isSuperuser) return true;
  const perms = auth.permissions;
  if (!perms) return false;
  if (Array.isArray(perms)) return perms.includes('eodCheck') || perms.includes('manageTeam');
  if (typeof perms === 'object') return !!(perms.eodCheck || perms.manageTeam);
  return false;
}

export function formatEodEntry(r: any, empName = ''): Record<string, any> {
  return {
    id: r._id || r.id,
    employee: r.employee || '',
    employeeName: r.employeeName || empName,
    date: r.date || '',
    tasksCompleted: r.tasksCompleted || '',
    tasksPending: r.tasksPending || '',
    challenges: r.challenges || '',
    planForTomorrow: r.planForTomorrow || '',
    hoursWorked: Number(r.hoursWorked) || 0,
    talktimeMinutes: Number(r.talktimeMinutes) || 0,
    leadsContacted: Number(r.leadsContacted) || 0,
    reviewStatus: r.reviewStatus || 'Pending',
    adminRemark: r.adminRemark || '',
    created: r.created || '',
  };
}

export async function notifyAdminsOfCompiledEod(opts: {
  reportId: string;
  managerName: string;
  fromDate: string;
  toDate: string;
  totalEntries: number;
  memberCount: number;
}): Promise<void> {
  try {
    const admins = await UsersModel.find({ role: 'admin' }, { _id: 1, name: 1 }).lean();
    for (const a of admins) {
      await NotificationsModel.create({
        recipient: a._id,
        recipientName: a.name || '',
        title: `New Compiled EOD Report from ${opts.managerName}`,
        message: `Manager ${opts.managerName} compiled a Team EOD Report for ${opts.fromDate} to ${opts.toDate} — ${opts.totalEntries} entries across ${opts.memberCount} member(s).`,
        category: 'EOD',
        link: '/portal/admin',
        senderName: opts.managerName,
        read: false,
        meta: {
          reportId: opts.reportId,
          kind: 'compiled-eod',
          fromDate: opts.fromDate,
          toDate: opts.toDate,
          totalEntries: opts.totalEntries,
        },
      });
    }
  } catch (_) {}
}

