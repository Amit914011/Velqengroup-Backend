export const PAYROLL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export type PayrollMonth = (typeof PAYROLL_MONTHS)[number];
export const STANDARD_SHIFT_HOURS = 8;
export const REQUIRED_DAILY_MINUTES = 480;
export const STANDARD_WORKING_DAYS = 26;

export function monthIndex(month: string): number {
  return PAYROLL_MONTHS.indexOf(month as PayrollMonth);
}

export function monthPrefix(month: string, year: number | string): string {
  const idx = monthIndex(month);
  if (idx < 0 || !year) return '';
  return `${year}-${String(idx + 1).padStart(2, '0')}`;
}

export function monthRange(month: string, year: number | string): { fromDate: string; toDate: string } {
  const idx = monthIndex(month);
  if (idx < 0 || !year) return { fromDate: '', toDate: '' };
  const from = `${year}-${String(idx + 1).padStart(2, '0')}-01`;
  const days = new Date(Number(year), idx + 1, 0).getDate();
  const to = `${year}-${String(idx + 1).padStart(2, '0')}-${String(days).padStart(2, '0')}`;
  return { fromDate: from, toDate: to };
}

export function totalDaysInMonth(month: string, year: number | string): number {
  const idx = monthIndex(month);
  if (idx < 0 || !year) return 0;
  return new Date(Number(year), idx + 1, 0).getDate();
}

export function workingDaysInRange(fromStr: string, toStr: string): number {
  if (!fromStr || !toStr) return 0;
  const start = new Date(fromStr);
  const end = new Date(toStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;
  let count = 0;
  const d = new Date(start);
  let guard = 0;
  while (d <= end && guard < 100) {
    count++;
    d.setDate(d.getDate() + 1);
    guard++;
  }
  return count;
}

export function salaryCreditDate(month: string, year: number | string): string {
  const idx = monthIndex(month);
  if (idx < 0 || !year) return '';
  let y = Number(year);
  let m = idx + 2;
  if (m > 12) { m = 1; y += 1; }
  let d = new Date(y, m - 1, 10);
  if (d.getDay() === 0 || d.getDay() === 6) d = new Date(y, m - 1, 9);
  while (d.getDay() === 0) d.setDate(d.getDate() - 1);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

