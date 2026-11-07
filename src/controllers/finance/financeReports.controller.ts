import { Request, Response } from 'express';
import { FinancialTransactionsModel } from '../../models/financial_transactions.js';
import { sendPbError } from '../../views/error.view.js';
import { applyFilters, computeTotals, computeMonthly } from '../../services/finance/financialAggregator.service.js';

function canViewReports(auth: any): boolean {
  if (auth.role === 'admin' || auth.isSuperuser || auth.role === 'ca' || auth.department === 'CA') return true;
  const p = auth.permissions || {};
  return !!p.viewReports;
}

export async function getLedgerSummary(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canViewReports(auth)) {
    return sendPbError(res, 403, 'You do not have permission to view financial reports.');
  }

  try {
    const rows = await FinancialTransactionsModel.find({ is_deleted: { $ne: true } }).lean();
    const filtered = applyFilters(rows, req.query);
    const totals = computeTotals(filtered);
    const monthly = computeMonthly(filtered);

    res.json({
      success: true,
      totals,
      monthly,
      count: filtered.length,
    });
  } catch (err: any) {
    sendPbError(res, 500, err.message || 'Failed to aggregate ledger.');
  }
}

