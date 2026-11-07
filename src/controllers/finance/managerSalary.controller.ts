import { Request, Response } from 'express';
import { ManagerSalaryRequestsModel } from '../../models/manager_salary_requests.js';
import { SalarySlipsModel } from '../../models/salary_slips.js';
import { SalarySlipRequestsModel } from '../../models/salary_slip_requests.js';
import { UsersModel } from '../../models/users.js';
import { sendPbError } from '../../views/error.view.js';
import {
  submitSalaryRequest,
  approveSalaryRequest,
  rejectSalaryRequest,
  requestChanges,
} from '../../services/finance/salaryApproval.service.js';

export async function createSalaryRequestAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  try {
    const doc = await submitSalaryRequest(auth, req.body);
    res.json({ success: true, request: doc });
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function getManagerSalaryRequests(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const list = await ManagerSalaryRequestsModel.find({ manager: auth._id || auth.id }).sort({ created: -1 }).lean();
  res.json({ success: true, requests: list });
}

export async function getTeamSalarySlips(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  const teamQuery: any = { role: 'employee' };
  if (!isAdmin) teamQuery.manager = auth._id || auth.id;

  const team = await UsersModel.find(teamQuery, { _id: 1 }).lean();
  const teamIds = team.map((u) => u._id);
  const slips = await SalarySlipsModel.find({ employee: { $in: teamIds } }).sort({ created: -1 }).lean();
  res.json({ success: true, slips });
}

export async function getAdminSalaryRequests(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth || (auth.role !== 'admin' && !auth.isSuperuser)) {
    return sendPbError(res, 403, 'Admin access only.');
  }
  const list = await ManagerSalaryRequestsModel.find().sort({ created: -1 }).lean();
  res.json({ success: true, requests: list });
}

export async function approveSalaryRequestAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth || (auth.role !== 'admin' && !auth.isSuperuser)) {
    return sendPbError(res, 403, 'Admin access only.');
  }
  const { requestId } = req.body || {};
  if (!requestId) return sendPbError(res, 400, 'requestId is required.');
  try {
    const out = await approveSalaryRequest(auth, requestId);
    res.json({ success: true, ...out });
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function rejectSalaryRequestAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth || (auth.role !== 'admin' && !auth.isSuperuser)) {
    return sendPbError(res, 403, 'Admin access only.');
  }
  const { requestId, reason } = req.body || {};
  if (!requestId) return sendPbError(res, 400, 'requestId is required.');
  try {
    await rejectSalaryRequest(auth, requestId, reason);
    res.json({ success: true });
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function requestChangesAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth || (auth.role !== 'admin' && !auth.isSuperuser)) {
    return sendPbError(res, 403, 'Admin access only.');
  }
  const { requestId, reason } = req.body || {};
  if (!requestId) return sendPbError(res, 400, 'requestId is required.');
  try {
    await requestChanges(auth, requestId, reason);
    res.json({ success: true });
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function getSlipRequests(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const team = await UsersModel.find({ manager: auth._id || auth.id }, { _id: 1 }).lean();
  const teamIds = team.map((u) => u._id);
  const list = await SalarySlipRequestsModel.find({ employee: { $in: teamIds } }).sort({ created: -1 }).lean();
  res.json({ success: true, requests: list });
}

export async function reviewSlipRequest(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const id = req.params.id;
  const { status, adminNote } = req.body || {};
  const doc = await SalarySlipRequestsModel.findById(id);
  if (!doc) return sendPbError(res, 404, 'Slip request not found.');

  doc.status = status || 'Reviewed';
  doc.adminNote = adminNote || '';
  doc.reviewedBy = auth._id || auth.id;
  doc.reviewedByName = auth.name || auth.email || 'Manager';
  doc.reviewedAt = new Date().toISOString();
  await doc.save();

  res.json({ success: true, request: doc.toObject() });
}

