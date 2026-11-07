import { registerReceiptHooks } from './receiptHooks.js';
import { registerFinancialSyncHooks } from './financialSyncHooks.js';
import { registerSalarySyncHooks } from './salarySyncHooks.js';

export function registerFinanceHooks(): void {
  registerReceiptHooks();
  registerFinancialSyncHooks();
  registerSalarySyncHooks();
}

