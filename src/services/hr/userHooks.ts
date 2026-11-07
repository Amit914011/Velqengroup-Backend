import bcrypt from 'bcrypt';
import { registerHook, HookDispatcherError, HookContext } from '../hookDispatcher.service.js';
import { ALL_MODELS } from '../../models/index.js';
import {
  generateNextEmployeeId,
  isExitStatus,
  istNowString,
} from './employee.service.js';

export function registerUserHooks(): void {
  registerHook('users', 'beforeCreate', async (ctx: HookContext) => {
    const body = { ...(ctx.body || {}) };
    const authRole = ctx.auth?.role || '';

    // user-role-guard: non-admin creators force role 'client' and verified true
    if (authRole !== 'admin') {
      body.role = 'client';
      body.verified = true;
    }

    // Auto-generate employeeId if employee role and not set
    if (body.role === 'employee' && !body.employeeId) {
      body.employeeId = await generateNextEmployeeId(body.department);
    }

    // Login flags initialization
    const status = String(body.employeeStatus || 'Active').trim();
    const isExit = body.role === 'employee' && isExitStatus(status);
    if (body.accountEnabled === undefined) body.accountEnabled = !isExit;
    if (body.loginEnabled === undefined) body.loginEnabled = !isExit;

    // Hash password if plain text
    if (body.password && !body.password.startsWith('$2')) {
      body.password = await bcrypt.hash(body.password, 12);
    }

    return body;
  });

  registerHook('users', 'beforeUpdate', async (ctx: HookContext) => {
    const body = { ...(ctx.body || {}) };
    const oldRecord = ctx.record || {};
    const authRole = ctx.auth?.role || '';

    if (body.employeeStatus !== undefined) {
      const wasExit = isExitStatus(oldRecord.employeeStatus);
      const isExitNow = isExitStatus(body.employeeStatus);

      if (wasExit && !isExitNow) {
        if (authRole !== 'admin') {
          throw new HookDispatcherError(403, 'Only administrators can reactivate an exited employee.');
        }
        body.accountEnabled = true;
        body.loginEnabled = true;
        body.lastWorkingDay = '';
        body.resignationDate = '';

        // Write employee_reactivation_log
        try {
          const logModel = ALL_MODELS['employee_reactivation_log'];
          if (logModel) {
            await logModel.create({
              employee: oldRecord._id || oldRecord.id,
              employeeName: oldRecord.name || oldRecord.email || '',
              employeeId: oldRecord.employeeId || '',
              previousStatus: oldRecord.employeeStatus || '',
              newStatus: body.employeeStatus || 'Active',
              reactivatedBy: ctx.auth?._id || ctx.auth?.id || '',
              reactivatedByName: ctx.auth?.name || ctx.auth?.email || '',
              reactivatedAt: istNowString(),
              previousExitDate: oldRecord.lastWorkingDay || oldRecord.resignationDate || '',
              remarks: String(body.reactivationRemarks || '').slice(0, 3000),
            });
          }
        } catch (_) {}
      } else if (!wasExit && isExitNow) {
        body.accountEnabled = false;
        body.loginEnabled = false;
      }
    }

    if (body.password && !body.password.startsWith('$2')) {
      body.password = await bcrypt.hash(body.password, 12);
    }

    return body;
  });
}
