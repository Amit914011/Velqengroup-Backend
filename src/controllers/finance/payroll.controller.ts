import { Request, Response } from 'express';
import { UsersModel } from '../../models/users.js';
import { AttendanceModel } from '../../models/attendance.js';
import { LeaveMarksModel } from '../../models/leave_marks.js';
import { sendPbError } from '../../views/error.view.js';
import { computePayroll } from '../../services/finance/payrollEngine.service.js';

export async function calculateSalaryAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  const { employeeId, month, year, overrides, manualPresentDays, lateDeductionEnabled } = req.body || {};
  if (!employeeId || !month || !year) {
    return sendPbError(res, 400, 'employeeId, month, and year are required.');
  }

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  const isSelf = auth._id === employeeId || auth.id === employeeId;
  const isManager = auth.role === 'employee' && (auth.designation?.includes('Manager') || auth.permissions?.manageTeam);

  if (!isAdmin && !isSelf && !isManager && auth.role !== 'ca') {
    return sendPbError(res, 403, 'Permission denied.');
  }

  const employee = await UsersModel.findById(employeeId).lean();
  if (!employee) return sendPbError(res, 404, 'Employee not found.');

  const attendance = await AttendanceModel.find({ employee: employeeId }).lean();
  const leaveMarks = await LeaveMarksModel.find({ employee: employeeId }).lean();

  const payroll = computePayroll({
    employee,
    month,
    year,
    attendance,
    leaveMarks,
    overrides,
    manualPresentDays,
    lateDeductionEnabled: Boolean(lateDeductionEnabled),
  });

  res.json({ success: true, payroll });
}

