import { registerHook, HookContext } from '../hookDispatcher.service.js';
import { generateReceiptNumber } from './receipt.service.js';
import { UsersModel } from '../../models/users.js';

export function registerReceiptHooks(): void {
  registerHook('payment_receipts', 'beforeCreate', async (ctx: HookContext) => {
    const body = ctx.body || {};
    if (!body.receiptNumber) {
      body.receiptNumber = await generateReceiptNumber(body.department);
    }

    let validEmp = false;
    if (body.employee) {
      const emp = await UsersModel.findById(body.employee).lean();
      if (emp) validEmp = true;
    }

    if (!validEmp && ctx.auth) {
      body.employee = ctx.auth._id || ctx.auth.id;
      if (!body.employeeName) {
        body.employeeName = ctx.auth.name || ctx.auth.email || '';
      }
    }

    return body;
  });
}

