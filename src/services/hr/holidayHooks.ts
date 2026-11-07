import { registerHook, HookDispatcherError, HookContext, AfterHookContext } from '../hookDispatcher.service.js';
import { CompanyHolidaysModel } from '../../models/company_holidays.js';
import { CompanyHolidayAuditModel } from '../../models/company_holiday_audit.js';
import { LeaveMarksModel } from '../../models/leave_marks.js';

export function registerHolidayHooks(): void {
  // Block Absent / NCNS marks on APPROVED_OFF company holidays
  const validateLeaveMark = async (ctx: HookContext) => {
    const mark = ctx.body?.mark || '';
    if (mark === 'Absent' || mark === 'NCNS') {
      const date = ctx.body?.date || '';
      if (date) {
        const hol = await CompanyHolidaysModel.findOne({
          $or: [{ holidayDate: date }, { date }],
          status: 'APPROVED_OFF',
        }).lean();
        if (hol) {
          throw new HookDispatcherError(
            400,
            `${date} is an approved company holiday — employees cannot be marked Absent or NCNS on a paid holiday.`
          );
        }
      }
    }
    return ctx.body;
  };

  registerHook('leave_marks', 'beforeCreate', validateLeaveMark);
  registerHook('leave_marks', 'beforeUpdate', validateLeaveMark);

  // Holiday after-change hooks for audit and notification
  registerHook('company_holidays', 'afterCreate', async (ctx: AfterHookContext) => {
    const rec = ctx.record || {};
    const actor = ctx.auth || {};
    try {
      await CompanyHolidayAuditModel.create({
        holiday: rec._id,
        holidayName: rec.holidayName || '',
        holidayDate: rec.holidayDate || rec.date || '',
        oldStatus: '',
        newStatus: rec.status || '',
        action: 'create',
        changedBy: actor._id || '',
        changedByName: actor.name || actor.email || 'Admin',
        changedAt: new Date().toISOString(),
        note: 'Holiday created',
      });
      if (rec.status === 'APPROVED_OFF') {
        const date = rec.holidayDate || rec.date;
        await LeaveMarksModel.deleteMany({ date, mark: { $in: ['Absent', 'NCNS'] } });
      }
    } catch (_) {}
  });

  registerHook('company_holidays', 'afterUpdate', async (ctx: AfterHookContext) => {
    const rec = ctx.record || {};
    const actor = ctx.auth || {};
    try {
      await CompanyHolidayAuditModel.create({
        holiday: rec._id,
        holidayName: rec.holidayName || '',
        holidayDate: rec.holidayDate || rec.date || '',
        oldStatus: '',
        newStatus: rec.status || '',
        action: 'update',
        changedBy: actor._id || '',
        changedByName: actor.name || actor.email || 'Admin',
        changedAt: new Date().toISOString(),
        note: 'Holiday updated',
      });
      if (rec.status === 'APPROVED_OFF') {
        const date = rec.holidayDate || rec.date;
        await LeaveMarksModel.deleteMany({ date, mark: { $in: ['Absent', 'NCNS'] } });
      }
    } catch (_) {}
  });

  registerHook('company_holidays', 'afterDelete', async (ctx: AfterHookContext) => {
    const rec = ctx.record || {};
    const actor = ctx.auth || {};
    try {
      await CompanyHolidayAuditModel.create({
        holidayName: rec.holidayName || '',
        holidayDate: rec.holidayDate || rec.date || '',
        oldStatus: rec.status || '',
        newStatus: '',
        action: 'delete',
        changedBy: actor._id || '',
        changedByName: actor.name || actor.email || 'Admin',
        changedAt: new Date().toISOString(),
        note: 'Holiday deleted',
      });
    } catch (_) {}
  });
}

