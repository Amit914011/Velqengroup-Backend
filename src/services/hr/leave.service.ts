import { LeaveRequestsModel } from '../../models/leave_requests.js';
import { UsersModel } from '../../models/users.js';
import { NotificationsModel } from '../../models/notifications.js';

export const BULK_LEAVE_MARKS: Record<string, { label: string; deductionDays: number }> = {
  PL: { label: 'Paid Leave', deductionDays: 0 },
  UL: { label: 'Unpaid Leave', deductionDays: 1 },
  SL: { label: 'Sick Leave', deductionDays: 1 },
  HD: { label: 'Half Day', deductionDays: 0.5 },
  Absent: { label: 'Absent (informed)', deductionDays: 1 },
  NCNS: { label: 'No Call No Show', deductionDays: 3 },
  Sandwich: { label: 'Sandwich Leave', deductionDays: 3 },
  MTL: { label: 'Maternity Leave', deductionDays: 0 },
  Late: { label: 'Late Coming', deductionDays: 0 },
  Present: { label: 'Present', deductionDays: 0 },
};

export function canManageLeaves(auth: any): boolean {
  if (!auth) return false;
  if (auth.role === 'admin' || auth.isSuperuser) return true;
  const perms = auth.permissions;
  if (!perms) return false;
  if (Array.isArray(perms)) return perms.includes('approveLeave') || perms.includes('manageTeam');
  if (typeof perms === 'object') return !!(perms.approveLeave || perms.manageTeam);
  return false;
}

export function generateDateRange(fromDate: string, toDate: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${fromDate}T00:00:00Z`);
  const end = new Date(`${toDate}T00:00:00Z`);
  if (isNaN(cursor.getTime()) || isNaN(end.getTime()) || cursor > end) return [];
  let guard = 0;
  while (cursor <= end && guard < 31) {
    const y = cursor.getUTCFullYear();
    const m = String(cursor.getUTCMonth() + 1).padStart(2, '0');
    const d = String(cursor.getUTCDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    guard++;
  }
  return dates;
}

export async function processLeaveApproval(
  auth: any,
  leaveId: string,
  status: 'Approved' | 'Rejected',
  adminNote?: string
): Promise<any> {
  const leave = await LeaveRequestsModel.findById(leaveId);
  if (!leave) throw new Error('Leave request not found.');

  const emp = await UsersModel.findById(leave.employee).lean();
  if (!emp || emp._id === auth._id) throw new Error('You can only act on your team members requests.');
  if (auth.role !== 'admin' && !auth.isSuperuser && emp.manager !== auth._id) {
    throw new Error('This leave request is not from your team.');
  }

  leave.status = status;
  leave.adminNote = `${adminNote || ''} — ${status} by ${auth.name || 'Manager'}`;
  await leave.save();

  try {
    await NotificationsModel.create({
      recipient: leave.employee,
      title: `Leave request ${status.toLowerCase()}`,
      message: `Your leave request for ${leave.startDate || ''} has been ${status.toLowerCase()}.`,
      read: false,
      type: 'leave_status',
    });
  } catch (_) {}

  return leave.toObject();
}
