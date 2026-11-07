import bcrypt from 'bcrypt';
import { UsersModel } from '../../models/users.js';
import { NotificationsModel } from '../../models/notifications.js';
import {
  EMPLOYEE_FIELDS,
  EMPLOYEE_NUMBER_FIELDS,
  generateNextEmployeeId,
} from './employee.service.js';

export function canSubmitEmployeeChanges(auth: any): boolean {
  if (!auth) return false;
  if (auth.role === 'admin' || auth.isSuperuser) return true;
  const perms = auth.permissions;
  if (!perms) return false;
  if (Array.isArray(perms)) return perms.includes('addEmployee') || perms.includes('manageTeam');
  if (typeof perms === 'object') return !!(perms.addEmployee || perms.manageTeam);
  return false;
}

export function buildNewValues(raw: Record<string, any>, defaultDept = ''): Record<string, any> {
  const out: Record<string, any> = {};
  for (const k of EMPLOYEE_FIELDS) {
    if (raw[k] !== undefined) {
      if (EMPLOYEE_NUMBER_FIELDS.includes(k)) {
        const n = Number(raw[k]);
        out[k] = isNaN(n) ? 0 : n;
      } else {
        out[k] = typeof raw[k] === 'string' ? raw[k].trim() : raw[k];
      }
    }
  }
  if (!out.department && defaultDept) out.department = defaultDept;
  return out;
}

export async function notifyAdmins(title: string, message: string, meta: Record<string, any> = {}): Promise<void> {
  const admins = await UsersModel.find({ role: 'admin' }, { _id: 1, name: 1 }).lean();
  for (const adm of admins) {
    try {
      await NotificationsModel.create({
        recipient: adm._id,
        title,
        message,
        read: false,
        type: 'employee_change',
        meta,
      });
    } catch (_) {}
  }
}

export async function applyApprovedValues(userId: string, newVals: Record<string, any>): Promise<any> {
  const updateData: Record<string, any> = {};
  for (const k of EMPLOYEE_FIELDS) {
    if (newVals[k] !== undefined && newVals[k] !== '') {
      updateData[k] = EMPLOYEE_NUMBER_FIELDS.includes(k) ? Number(newVals[k]) : newVals[k];
    }
  }
  return UsersModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
}

export async function directAddEmployee(auth: any, raw: Record<string, any>): Promise<any> {
  const newVals = buildNewValues(raw, auth.department || '');
  const empId = await generateNextEmployeeId(newVals.department);
  const password = raw.password || 'Welcome123!';
  const hashedPassword = await bcrypt.hash(password, 12);
  const doc = await UsersModel.create({
    ...newVals,
    employeeId: empId,
    role: 'employee',
    manager: auth.role === 'admin' ? raw.manager || auth._id : auth._id,
    password: hashedPassword,
    verified: true,
    accountEnabled: true,
    loginEnabled: true,
  });
  return doc.toObject();
}
