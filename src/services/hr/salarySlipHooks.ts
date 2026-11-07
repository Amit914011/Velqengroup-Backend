import { registerHook, HookContext, AfterHookContext } from '../hookDispatcher.service.js';
import { SalarySlipsModel } from '../../models/salary_slips.js';
import { UsersModel } from '../../models/users.js';

export function registerSalarySlipHooks(): void {
  registerHook('salary_slips', 'beforeCreate', async (ctx: HookContext) => {
    const body = ctx.body || {};
    const empId = body.employee;
    const month = body.month;
    const year = body.year;

    if (empId && month && year) {
      try {
        const prior = await SalarySlipsModel.find({ employee: empId, month, year }).lean();
        const next = (prior.length > 0 ? Math.max(...prior.map((p: any) => Number(p.version || 0))) : 0) + 1;
        body.version = next;
        body.versionLabel = `v${next}`;
      } catch (_) {}
    }
    return body;
  });

  const handleFinalAndExit = async (ctx: AfterHookContext) => {
    const rec = ctx.record || {};
    const empId = rec.employee;

    if (rec.isFinal && empId) {
      try {
        await SalarySlipsModel.updateMany(
          { employee: empId, month: rec.month, year: rec.year, _id: { $ne: rec._id } },
          { $set: { isFinal: false } }
        );
      } catch (_) {}
    }

    if (rec.status === 'Full & Final' && empId) {
      try {
        const cutoff = rec.lastWorkingDay || rec.toDate || new Date().toISOString().slice(0, 10);
        await UsersModel.findByIdAndUpdate(empId, {
          $set: {
            employeeStatus: 'Resigned',
            resignationDate: cutoff,
            lastWorkingDay: cutoff,
          },
        });
      } catch (_) {}
    }
  };

  registerHook('salary_slips', 'afterCreate', handleFinalAndExit);
  registerHook('salary_slips', 'afterUpdate', handleFinalAndExit);
}
