import { Request, Response } from 'express';
import { LeaveMarksModel } from '../../models/leave_marks.js';
import { UsersModel } from '../../models/users.js';
import { sendPbError } from '../../views/error.view.js';
import {
  canManageLeaves,
  generateDateRange,
  processLeaveApproval,
  BULK_LEAVE_MARKS,
} from '../../services/hr/leave.service.js';

export async function approveLeaveAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canManageLeaves(auth)) return sendPbError(res, 403, 'Permission denied.');

  const { leaveId, status, adminNote } = req.body || {};
  if (!leaveId) return sendPbError(res, 400, 'leaveId is required.');
  if (status !== 'Approved' && status !== 'Rejected') {
    return sendPbError(res, 400, 'status must be Approved or Rejected.');
  }

  try {
    const updated = await processLeaveApproval(auth, leaveId, status, adminNote);
    res.json({ success: true, status: updated.status });
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function bulkLeaveAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canManageLeaves(auth)) return sendPbError(res, 403, 'Permission denied.');

  const { employeeIds, mark, fromDate, toDate, note } = req.body || {};
  if (!mark || !BULK_LEAVE_MARKS[mark]) {
    return sendPbError(res, 400, `Invalid leave mark. Allowed: ${Object.keys(BULK_LEAVE_MARKS).join(', ')}`);
  }
  if (!fromDate || !toDate || fromDate > toDate) {
    return sendPbError(res, 400, 'Valid date range (fromDate <= toDate) is required.');
  }
  if (!Array.isArray(employeeIds) || employeeIds.length === 0 || employeeIds.length > 200) {
    return sendPbError(res, 400, 'employeeIds must be an array of 1 to 200 employees.');
  }

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  const userFilter: any = { _id: { $in: employeeIds }, role: 'employee' };
  if (!isAdmin) userFilter.manager = auth._id;

  const validUsers = await UsersModel.find(userFilter).lean();
  if (validUsers.length === 0) {
    return sendPbError(res, 400, 'No valid team members selected.');
  }

  const dates = generateDateRange(fromDate, toDate);
  const meta = BULK_LEAVE_MARKS[mark];
  const managerName = auth.name || auth.email || 'Manager';
  let allocated = 0;

  for (const u of validUsers) {
    for (const d of dates) {
      await LeaveMarksModel.findOneAndUpdate(
        { employee: u._id, date: d },
        {
          $set: {
            employeeName: u.name || u.email,
            mark,
            deductionDays: meta.deductionDays,
            note: note || '',
            sandwichGroup: mark === 'Sandwich' ? `mgr-bulk-${d}` : undefined,
            updatedByName: `${managerName} (Manager bulk-leave)`,
          },
          $setOnInsert: {
            createdByName: `${managerName} (Manager bulk-leave)`,
          },
        },
        { upsert: true }
      );
      allocated++;
    }
  }

  res.json({ success: true, allocated, totalEmployees: validUsers.length, totalDays: dates.length });
}

