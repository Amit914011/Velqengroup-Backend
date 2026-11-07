import {
  STANDARD_SHIFT_HOURS,
  REQUIRED_DAILY_MINUTES,
  monthRange,
  totalDaysInMonth,
  workingDaysInRange,
  salaryCreditDate,
} from './payrollDates.js';

export interface ComputePayrollOptions {
  employee: any;
  month: string;
  year: number | string;
  attendance?: any[];
  leaveMarks?: any[];
  overrides?: { workingDays?: number; fromDate?: string; toDate?: string };
  lateDeductionEnabled?: boolean;
  manualPresentDays?: number | string | null;
}

export function computePayroll(opts: ComputePayrollOptions): any {
  const emp = opts.employee || {};
  const { monthStart, monthEnd, fromDate, toDate, workingDays } = resolvePeriod(opts);
  const basic = Number(emp.paidBasic || emp.basicSalary) || 0;
  const allowances = Number(emp.allowances) || 0;
  const incentives = Number(emp.paidIncentive || emp.incentives) || 0;
  const gross = basic + allowances + incentives;

  const marks = (opts.leaveMarks || []).filter((m) => m.date >= fromDate && m.date <= toDate);
  const att = (opts.attendance || []).filter((a) => a.date >= fromDate && a.date <= toDate);

  const presentDays = calculatePresentDays(marks, att, fromDate, toDate, workingDays, opts.manualPresentDays);
  const leaveCounts = calculateLeaveCounts(marks);
  const rates = calculateRates(basic, opts.month, opts.year);
  const deductions = calculateDeductions(leaveCounts, att, rates, opts.lateDeductionEnabled);

  const presentDaysSalary = Math.round(rates.dailyRate * presentDays * 100) / 100;
  const paidLeaveSalary = Math.round(rates.dailyRate * leaveCounts.paidLeaveDays * 100) / 100;
  const payableBasic = presentDaysSalary + paidLeaveSalary;
  const totalDeductions = Math.round(
    (deductions.unpaidLeave + deductions.halfDay + deductions.absent + deductions.ncns + deductions.sandwich + deductions.shortHours + deductions.lateComing) * 100
  ) / 100;
  const netSalary = Math.max(0, Math.round((gross - totalDeductions) * 100) / 100);

  return {
    fromDate, toDate, monthStart, monthEnd, workingDays,
    basicSalary: basic, allowances, incentives, grossSalary: gross,
    dailyRate: rates.dailyRate, hourlyRate: rates.hourlyRate,
    presentDays, payableBasic, presentDaysSalary, paidLeaveSalary,
    ...leaveCounts, ...deductions,
    totalDeductions, netSalary,
    salaryCreditDate: salaryCreditDate(opts.month, opts.year),
  };
}

function resolvePeriod(opts: ComputePayrollOptions) {
  const { fromDate: monthStart, toDate: monthEnd } = monthRange(opts.month, opts.year);
  let effectiveStart = monthStart;
  const joinDate = opts.employee?.joiningDate;
  if (joinDate && joinDate > monthStart) effectiveStart = joinDate;

  const fromDate = opts.overrides?.fromDate || effectiveStart;
  const toDate = opts.overrides?.toDate || monthEnd;
  const workingDays = opts.overrides?.workingDays || workingDaysInRange(fromDate, toDate);
  return { monthStart, monthEnd, fromDate, toDate, workingDays };
}

function calculatePresentDays(marks: any[], att: any[], from: string, to: string, total: number, manual: any): number {
  if (manual != null && manual !== '' && !isNaN(Number(manual))) {
    return Math.min(total, Math.max(0, Number(manual)));
  }
  const nonPresent = new Set(marks.filter((m) => m.mark && m.mark !== 'Present').map((m) => m.date));
  const presentDates = new Set<string>();

  att.forEach((a) => { if (a.loginAt && a.date && !nonPresent.has(a.date)) presentDates.add(a.date); });
  marks.forEach((m) => { if (m.mark === 'Present' && m.date) presentDates.add(m.date); });

  addWeekOffDays(from, to, nonPresent, presentDates);
  const halfDays = marks.filter((m) => m.mark === 'HD').length * 0.5;
  return Math.min(total, Math.round((presentDates.size + halfDays) * 100) / 100);
}

function addWeekOffDays(from: string, to: string, nonPresent: Set<string>, present: Set<string>) {
  const cursor = new Date(from);
  const end = new Date(to);
  let guard = 0;
  while (cursor <= end && guard < 100) {
    if (cursor.getDay() === 0) {
      const iso = cursor.toISOString().slice(0, 10);
      if (!nonPresent.has(iso)) present.add(iso);
    }
    cursor.setDate(cursor.getDate() + 1);
    guard++;
  }
}

function calculateLeaveCounts(marks: any[]) {
  return {
    paidLeaveDays: marks.filter((m) => ['PL', 'MTL'].includes(m.mark)).length,
    unpaidLeaveDays: marks.filter((m) => ['UL', 'SL'].includes(m.mark)).length,
    halfDayDays: marks.filter((m) => m.mark === 'HD').length * 0.5,
    absentDays: marks.filter((m) => m.mark === 'Absent').length,
    ncnsDays: marks.filter((m) => m.mark === 'NCNS').length,
    sandwichDays: marks.filter((m) => m.mark === 'Sandwich').length,
  };
}

function calculateRates(basic: number, month: string, year: number | string) {
  const totalDays = totalDaysInMonth(month, year) || 30;
  const dailyRate = Math.round((basic / totalDays) * 100) / 100;
  const hourlyRate = Math.round((dailyRate / STANDARD_SHIFT_HOURS) * 100) / 100;
  return { dailyRate, hourlyRate };
}

function calculateDeductions(counts: any, att: any[], rates: any, lateEnabled = false) {
  const unpaid = Math.round(counts.unpaidLeaveDays * rates.dailyRate * 100) / 100;
  const halfDay = Math.round(counts.halfDayDays * rates.dailyRate * 100) / 100;
  const absent = Math.round(counts.absentDays * rates.dailyRate * 100) / 100;
  const ncns = Math.round(counts.ncnsDays * 3 * rates.dailyRate * 100) / 100;
  const sandwich = Math.round(counts.sandwichDays * rates.dailyRate * 100) / 100;

  const lateMinutes = att.reduce((s, a) => s + (Number(a.lateMinutes) || 0), 0);
  const lateHours = Math.round((lateMinutes / 60) * 100) / 100;
  const lateComing = lateEnabled ? Math.round(lateHours * rates.hourlyRate * 100) / 100 : 0;

  let shortMinutes = 0;
  att.forEach((a) => {
    if (a.loginAt && a.signedOut && Number(a.minutesLogged || 0) < REQUIRED_DAILY_MINUTES) {
      shortMinutes += (REQUIRED_DAILY_MINUTES - Number(a.minutesLogged || 0));
    }
  });
  const shortHours = Math.round((shortMinutes / 60) * 100) / 100;
  const shortDeduction = Math.round(shortHours * rates.hourlyRate * 100) / 100;

  return {
    unpaidLeave: unpaid, halfDay, absent, ncns, sandwich,
    lateComing, shortHours: shortDeduction,
  };
}
