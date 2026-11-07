import { registerHook, HookDispatcherError, HookContext } from '../hookDispatcher.service.js';
import { AttendanceModel } from '../../models/attendance.js';
import { UsersModel } from '../../models/users.js';
import { isAttendanceBlocked, getResignationCutoff } from './attendance.service.js';

export function registerAttendanceHooks(): void {
  registerHook('attendance', 'beforeCreate', async (ctx: HookContext) => {
    const body = ctx.body || {};
    const empId = body.employee;
    const date = body.date;

    if (empId) {
      const user = await UsersModel.findById(empId).lean();
      if (user && isAttendanceBlocked(user, date)) {
        const cutoff = getResignationCutoff(user);
        throw new HookDispatcherError(
          400,
          `Employee has resigned. Attendance cannot be recorded after the last working day (${cutoff}).`
        );
      }
    }

    if (empId && date) {
      const existing = await AttendanceModel.findOne({ employee: empId, date }).lean();
      if (existing) {
        throw new HookDispatcherError(
          400,
          `Attendance already exists for this employee on ${date}. Use PATCH /api/collections/attendance/records/${existing._id} to update it instead of creating a duplicate.`
        );
      }
    }

    return body;
  });
}
