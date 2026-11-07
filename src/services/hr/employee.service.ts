import { UsersModel } from '../../models/users.js';

export const EMPLOYEE_FIELDS = [
  'name', 'email', 'phone', 'designation', 'department', 'joiningDate',
  'shiftStart', 'shiftEnd', 'employeeStatus', 'aadharNumber', 'panNumber',
  'bankName', 'bankAccountNumber', 'bankIfsc', 'bankBranch', 'taxInfo',
  'paidBasic', 'allowances', 'incentives', 'address', 'whatsappNumber',
  'city', 'state', 'pincode', 'dateOfBirth', 'gender',
  'permanentAddress', 'presentAddress', 'presentCity', 'presentState', 'presentPincode',
  'alternatePhone', 'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation',
];

export const EMPLOYEE_NUMBER_FIELDS = ['paidBasic', 'allowances', 'incentives'];

const EXIT_STATUSES = new Set(['resigned', 'left', 'terminated', 'exited', 'inactive']);

export function isExitStatus(status?: string): boolean {
  return EXIT_STATUSES.has(String(status || '').trim().toLowerCase());
}

export function istNowString(): string {
  const d = new Date();
  const ist = new Date(d.getTime() + 5.5 * 3600000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(ist.getUTCDate())} ${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())}:${pad(ist.getUTCSeconds())} IST`;
}

export const DEPT_PREFIXES: Record<string, string> = {
  'Tour & Travel': 'VG0014726VV',
  'Real Estate': 'VG0014726VE',
  Logistics: 'VG0014726VL',
  Trading: 'VG0014726VT',
  'Visa Immigration': 'VG0014726VI',
  'D Staff': 'VG0014726VD',
};

export async function generateNextEmployeeId(department?: string): Promise<string> {
  const prefix = DEPT_PREFIXES[department || ''] || 'VG0014726VV';
  const start = 1061;
  const regex = new RegExp(`^${prefix}(\\d+)$`);
  const docs = await UsersModel.find({ employeeId: { $regex: `^${prefix}` } }, { employeeId: 1 }).lean();
  let maxNum = start - 1;
  for (const doc of docs) {
    const match = regex.exec(doc.employeeId || '');
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }
  return `${prefix}${maxNum + 1}`;
}

export function snapshotEmployee(user: Record<string, any>): Record<string, any> {
  const snap: Record<string, any> = {};
  for (const f of EMPLOYEE_FIELDS) {
    const v = user[f];
    snap[f] = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v;
  }
  return snap;
}

export function validateEmployeeInput(vals: Record<string, any>, reqPassword = false): string[] {
  const errors: string[] = [];
  if (!vals.name || !String(vals.name).trim()) errors.push('Name is required.');
  if (!vals.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(vals.email).trim())) {
    errors.push('A valid email address is required.');
  }
  if (!vals.phone || !String(vals.phone).trim()) errors.push('Phone number is required.');
  if (reqPassword && (!vals.password || String(vals.password).length < 7)) {
    errors.push('Password must be at least 7 characters.');
  }
  return errors;
}

