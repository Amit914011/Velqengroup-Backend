import { Request, Response } from 'express';
import { UsersModel } from '../../models/users.js';
import { EmployeeChangeRequestsModel } from '../../models/employee_change_requests.js';
import { sendPbError } from '../../views/error.view.js';
import {
  canSubmitEmployeeChanges,
  buildNewValues,
  notifyAdmins,
  applyApprovedValues,
  directAddEmployee,
} from '../../services/hr/employeeChange.service.js';
import { snapshotEmployee, validateEmployeeInput } from '../../services/hr/employee.service.js';

export async function submitChangeRequest(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canSubmitEmployeeChanges(auth)) {
    return sendPbError(res, 403, 'Permission denied to submit employee changes.');
  }

  const reqType = String(req.body?.requestType || 'add').toLowerCase();
  const newVals = buildNewValues(req.body || {}, auth.department);
  const errs = validateEmployeeInput(newVals, reqType === 'add');
  if (errs.length > 0) return sendPbError(res, 400, errs.join(' '));

  let oldValues = {};
  let targetId = req.body?.employeeId;
  let empName = newVals.name;

  if (reqType === 'edit') {
    if (!targetId) return sendPbError(res, 400, 'employeeId is required for edit.');
    const target = await UsersModel.findById(targetId);
    if (!target) return sendPbError(res, 404, 'Employee not found.');
    if (auth.role !== 'admin' && target.manager !== auth._id) {
      return sendPbError(res, 403, 'This employee is not assigned to you.');
    }
    oldValues = snapshotEmployee(target.toObject());
    empName = target.name || newVals.name;
  }

  const doc = await EmployeeChangeRequestsModel.create({
    requestType: reqType,
    manager: auth._id,
    managerName: auth.name || auth.email,
    employee: targetId,
    employeeName: empName,
    newValues: newVals,
    oldValues,
    status: 'Pending',
    note: req.body?.note || '',
  });

  notifyAdmins(`New Employee ${reqType} Request`, `Submitted by ${auth.name || auth.email}`, { requestId: doc._id }).catch(() => {});
  res.json({ success: true, request: doc });
}

export async function addEmployeeDirectAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canSubmitEmployeeChanges(auth)) {
    return sendPbError(res, 403, 'Permission denied.');
  }
  try {
    const user = await directAddEmployee(auth, req.body || {});
    res.json({ success: true, user });
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function editEmployeeDirectAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canSubmitEmployeeChanges(auth)) return sendPbError(res, 403, 'Permission denied.');

  const { employeeId } = req.body || {};
  if (!employeeId) return sendPbError(res, 400, 'employeeId is required.');
  const target = await UsersModel.findById(employeeId);
  if (!target) return sendPbError(res, 404, 'Employee not found.');
  if (auth.role !== 'admin' && target.manager !== auth._id) {
    return sendPbError(res, 403, 'This employee is not assigned to you.');
  }

  const newVals = buildNewValues(req.body || {}, auth.department);
  const updated = await applyApprovedValues(employeeId, newVals);
  res.json({ success: true, user: updated });
}

export async function getManagerChangeRequests(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const list = await EmployeeChangeRequestsModel.find({ manager: auth._id }).sort({ created: -1 }).lean();
  res.json({ success: true, requests: list });
}

export async function getAdminChangeRequests(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth || (auth.role !== 'admin' && !auth.isSuperuser)) {
    return sendPbError(res, 403, 'Only administrators can view all change requests.');
  }
  const list = await EmployeeChangeRequestsModel.find().sort({ created: -1 }).lean();
  res.json({ success: true, requests: list });
}
