import { registerHook, AfterHookContext } from '../hookDispatcher.service.js';
import { SalarySlipsModel } from '../../models/salary_slips.js';
import { LeaveMarksModel } from '../../models/leave_marks.js';
import { AttendanceModel } from '../../models/attendance.js';
import { UsersModel } from '../../models/users.js';
import { computePayroll } from './payrollEngine.service.js';

export function registerSalarySyncHooks(): void {
  const syncLeaveWithDraft = async (ctx: AfterHookContext) => {
    const mark = ctx.record;
    if (!mark || !mark.employee || !mark.date) return;

    const dateStr = String(mark.date);
    const year = parseInt(dateStr.slice(0, 4), 10);
    const monthNum = parseInt(dateStr.slice(5, 7), 10);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[monthNum - 1];
    if (!month || isNaN(year)) return;

    // Find any draft slip for this employee and month
    const slip = await SalarySlipsModel.findOne({
      employee: mark.employee,
      month,
      year,
      status: 'Draft',
    });
    if (!slip) return;

    const emp = await UsersModel.findById(mark.employee).lean();
    if (!emp) return;

    const marks = await LeaveMarksModel.find({ employee: mark.employee }).lean();
    const attendance = await AttendanceModel.find({ employee: mark.employee }).lean();

    const result = computePayroll({
      employee: emp,
      month,
      year,
      leaveMarks: marks,
      attendance,
      manualPresentDays: slip.presentDays,
      lateDeductionEnabled: slip.lateDeductionEnabled,
    });

    Object.assign(slip, {
      basicSalary: result.basicSalary,
      grossSalary: result.grossSalary,
      dailyRate: result.dailyRate,
      hourlyRate: result.hourlyRate,
      presentDays: result.presentDays,
      payableBasic: result.payableBasic,
      presentDaysSalary: result.presentDaysSalary,
      paidLeaveSalary: result.paidLeaveSalary,
      totalDeductions: result.totalDeductions,
      netSalary: result.netSalary,
      unpaidLeave: result.unpaidLeave,
      halfDay: result.halfDay,
      absent: result.absent,
      ncns: result.ncns,
      sandwich: result.sandwich,
      shortHours: result.shortHours,
      lateComing: result.lateComing,
      updated: new Date(),
    });

    await slip.save();
  };

  registerHook('leave_marks', 'afterCreate', syncLeaveWithDraft);
  registerHook('leave_marks', 'afterUpdate', syncLeaveWithDraft);
}
