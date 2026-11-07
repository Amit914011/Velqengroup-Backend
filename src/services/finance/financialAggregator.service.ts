export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const round2 = (n: number | string | null | undefined): number => {
  const v = Number(n) || 0;
  return Math.round((v + Number.EPSILON) * 100) / 100;
};

const num = (n: unknown): number => {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? v : 0;
};

export const grandOf = (row: Record<string, any>): number => num(row.grand_total) || num(row.amount);

export function monthKey(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const s = String(dateStr);
  if (/^\d{4}-\d{2}/.test(s)) return s.slice(0, 7);
  const d = new Date(s);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function dayKey(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const s = String(dateStr);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

const ELIGIBLE_STATUS: Record<string, string[]> = {
  INCOME: ['APPROVED', 'RECEIVED', 'PAID'],
  REFUND: ['REFUNDED', 'APPROVED'],
  EXPENSE: ['Paid'],
  SALARY: ['PAID'],
};

export function isCountable(row: Record<string, any>, type: string): boolean {
  if (!row || row.is_deleted || row.is_duplicate_suppressed) return false;
  if (type === 'ADVANCE') return true;
  const ok = ELIGIBLE_STATUS[type];
  return ok ? ok.includes(row.status) : false;
}

export function applyFilters(rows: Record<string, any>[], filters: any = {}): Record<string, any>[] {
  return rows.filter((r) => {
    const k = dayKey(r.transaction_date || r.created);
    if (filters.from && k && k < filters.from) return false;
    if (filters.to && k && k > filters.to) return false;
    if (filters.month && monthKey(r.transaction_date || r.created) !== filters.month) return false;
    if (filters.department && filters.department !== 'all' && (r.department || '') !== filters.department) return false;
    if (filters.type && filters.type !== 'all' && r.transaction_type !== filters.type) return false;
    if (filters.status && filters.status !== 'all' && (r.status || '') !== filters.status) return false;
    if (filters.paymentMethod && filters.paymentMethod !== 'all' && (r.payment_method || '') !== filters.paymentMethod) return false;
    return true;
  });
}

export function computeTotals(rows: Record<string, any>[]) {
  let income = 0;
  let refund = 0;
  let expense = 0;
  let salary = 0;
  let advance = 0;

  for (const r of rows) {
    const t = r.transaction_type;
    if (t === 'INCOME' && isCountable(r, 'INCOME')) income += grandOf(r);
    else if (t === 'REFUND' && isCountable(r, 'REFUND')) refund += grandOf(r);
    else if (t === 'EXPENSE' && isCountable(r, 'EXPENSE')) expense += grandOf(r);
    else if (t === 'SALARY' && isCountable(r, 'SALARY')) salary += grandOf(r);
    else if (t === 'ADVANCE' && isCountable(r, 'ADVANCE')) advance += grandOf(r);
  }

  const netIncome = round2(income - refund);
  const totalExpense = round2(expense + salary);
  const netProfit = round2(netIncome - totalExpense);

  return {
    income: round2(income),
    refund: round2(refund),
    netIncome,
    expense: round2(expense),
    salary: round2(salary),
    advance: round2(advance),
    totalExpense,
    netProfit,
  };
}

export function computeMonthly(rows: Record<string, any>[]) {
  const groups: Record<string, Record<string, any>[]> = {};
  for (const r of rows) {
    const k = monthKey(r.transaction_date || r.created);
    if (!k) continue;
    if (!groups[k]) groups[k] = [];
    groups[k].push(r);
  }

  const sortedKeys = Object.keys(groups).sort();
  return sortedKeys.map((k) => {
    const totals = computeTotals(groups[k]);
    return {
      key: k,
      revenue: totals.income,
      refund: totals.refund,
      netRevenue: totals.netIncome,
      expense: totals.expense,
      salary: totals.salary,
      totalExpense: totals.totalExpense,
      profit: totals.netProfit,
    };
  });
}

