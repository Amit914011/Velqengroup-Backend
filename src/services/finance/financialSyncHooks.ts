import { registerHook, AfterHookContext } from '../hookDispatcher.service.js';
import { syncLedgerTransaction } from './financialSync.service.js';
import { FinancialTransactionsModel } from '../../models/financial_transactions.js';

const FINANCIAL_COLLECTIONS = [
  'payment_receipts',
  'company_income',
  'company_expenses',
  'salary_slips',
  'employee_advances',
];

export function registerFinancialSyncHooks(): void {
  for (const coll of FINANCIAL_COLLECTIONS) {
    registerHook(coll, 'afterCreate', async (ctx: AfterHookContext) => {
      if (ctx.record) {
        await syncLedgerTransaction(coll, ctx.record);
      }
    });

    registerHook(coll, 'afterUpdate', async (ctx: AfterHookContext) => {
      if (ctx.record) {
        await syncLedgerTransaction(coll, ctx.record);
      }
    });

    registerHook(coll, 'afterDelete', async (ctx: AfterHookContext) => {
      if (ctx.record && ctx.record._id) {
        await FinancialTransactionsModel.deleteOne({
          source_module: coll,
          source_record_id: ctx.record._id,
        });
      }
    });
  }
}

