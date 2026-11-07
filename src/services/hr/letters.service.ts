import { SalarySlipsModel } from '../../models/salary_slips.js';
import { ResignationRequestsModel } from '../../models/resignation_requests.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface DateParts {
  y: number;
  m: number;
  d: number;
}

export function parseJoinParts(raw: any): DateParts | null {
  if (!raw) return null;
  const s = String(raw).trim();
  const mIso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (mIso) return { y: Number(mIso[1]), m: Number(mIso[2]), d: Number(mIso[3]) };
  const mInd = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (mInd) return { y: Number(mInd[3]), m: Number(mInd[2]), d: Number(mInd[1]) };
  const dt = new Date(s);
  if (isNaN(dt.getTime())) return null;
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

export function partsToISO(p: DateParts): string {
  return `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
}

export function addDays(p: DateParts, n: number): DateParts {
  const dt = new Date(Date.UTC(p.y, p.m - 1, p.d) + n * DAY_MS);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

export function addMonths(p: DateParts, n: number): DateParts {
  const target = p.m - 1 + n;
  const y = p.y + Math.floor(target / 12);
  let m0 = target % 12;
  if (m0 < 0) m0 += 12;
  const lastDay = new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();
  return { y, m: m0 + 1, d: Math.min(p.d, lastDay) };
}

export function getEligibility(user: any): Record<string, any> {
  const p = parseJoinParts(user?.joiningDate);
  if (!p) {
    return { joinD: null, joiningDate: '', apptEligible: false, expEligible: false, missingJoiningDate: true };
  }
  const joiningDate = partsToISO(p);
  const apptDate = partsToISO(addDays(p, 45));
  const expDate = partsToISO(addMonths(p, 6));
  const now = new Date();
  const todayMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const joinMs = Date.UTC(p.y, p.m - 1, p.d);
  const apptMs = Date.UTC(addDays(p, 45).y, addDays(p, 45).m - 1, addDays(p, 45).d);
  const expMs = Date.UTC(addMonths(p, 6).y, addMonths(p, 6).m - 1, addMonths(p, 6).d);

  return {
    joinD: new Date(joinMs),
    joiningDate,
    apptEligibleDate: apptDate,
    expEligibleDate: expDate,
    daysEmployed: Math.max(0, Math.floor((todayMs - joinMs) / DAY_MS)),
    apptEligible: todayMs >= apptMs,
    expEligible: todayMs >= expMs,
    missingJoiningDate: false,
  };
}

export async function buildLetterSnapshot(user: any, letterType: string, opts: Record<string, any> = {}): Promise<any> {
  const slip = await SalarySlipsModel.findOne({ employee: user._id || user.id }).sort({ created: -1 }).lean();
  const missing: string[] = [];

  ['name', 'employeeId', 'department', 'designation', 'joiningDate'].forEach((k) => {
    if (!user[k]) missing.push(k);
  });

  let relievingDate = opts.relievingDate || '';
  let lastWorkingDay = opts.lastWorkingDay || '';
  if (letterType === 'Experience' && !relievingDate && !lastWorkingDay) {
    const res = await ResignationRequestsModel.findOne({ employee: user._id || user.id, status: 'Approved' }).lean();
    if (res) {
      relievingDate = res.lastWorkingDay || '';
      lastWorkingDay = res.lastWorkingDay || '';
    }
    if (!relievingDate && !lastWorkingDay) missing.push('relievingDate');
  }

  const basicSalary = slip ? Number(slip.basicSalary || 0) : Number(user.basicSalary || 0);
  const snapshot = {
    name: user.name || '',
    employeeId: user.employeeId || '',
    department: user.department || '',
    designation: user.designation || '',
    joiningDate: user.joiningDate || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.presentAddress || user.permanentAddress || user.address || '',
    shiftStart: user.shiftStart || '',
    shiftEnd: user.shiftEnd || '',
    basicSalary,
    incentives: slip ? Number(slip.incentives || 0) : Number(user.incentives || 0),
    allowances: slip ? Number(slip.allowances || 0) : Number(user.allowances || 0),
    netSalary: basicSalary,
    grossSalary: slip ? Number(slip.grossSalary || 0) : 0,
    totalDeductions: slip ? Number(slip.totalDeductions || 0) : 0,
    relievingDate,
    lastWorkingDay,
    salarySource: slip ? 'latest_salary_slip' : 'user_profile',
    capturedAt: new Date().toISOString(),
  };

  return { snapshot, missing };
}

