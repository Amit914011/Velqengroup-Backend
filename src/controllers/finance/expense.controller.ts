import { Request, Response } from 'express';
import { sendPbError } from '../../views/error.view.js';
import { fetchExpenseOptions, recordExpense } from '../../services/finance/expense.service.js';

function canAccessExpenses(auth: any, allowReception = false): boolean {
  if (auth.role === 'admin' || auth.isSuperuser) return true;
  if (allowReception && auth.email === 'reception@velqengroup.com') return true;
  const p = auth.permissions || {};
  return !!(p.manageTeam || p.viewReports);
}

export async function getExpenseOptions(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canAccessExpenses(auth, true)) {
    return sendPbError(res, 403, 'You do not have permission to punch expenses.');
  }

  try {
    const opts = await fetchExpenseOptions();
    res.json(opts);
  } catch (err: any) {
    sendPbError(res, 500, err.message || 'Failed to fetch expense options.');
  }
}

export async function punchExpense(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canAccessExpenses(auth, false)) {
    return sendPbError(res, 403, 'You do not have permission to punch expenses.');
  }

  try {
    const doc = await recordExpense(auth, req.body);
    res.json({ success: true, id: doc._id });
  } catch (err: any) {
    sendPbError(res, 400, err.message || 'Could not save the expense.');
  }
}

