import { Request, Response } from 'express';
import { sendPbError } from '../../views/error.view.js';
import {
  getAllocatableLeads,
  allocateSingleLead,
  bulkAllocateLeads,
  getAdminAllocationRequests,
  reviewAllocationRequest,
} from '../../services/crm/allocation.service.js';

function checkManager(auth: any): boolean {
  if (auth.role === 'admin' || auth.isSuperuser) return true;
  return !!(auth.permissions && auth.permissions.manageTeam);
}

export async function getAllocatableLeadsAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!checkManager(auth)) return sendPbError(res, 403, 'Permission denied.');

  try {
    const list = await getAllocatableLeads(auth);
    res.json(list);
  } catch (err: any) {
    sendPbError(res, 500, err.message);
  }
}

export async function allocationRequestAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!checkManager(auth)) return sendPbError(res, 403, 'Permission denied.');

  const { leadId, assignToId, remarks } = req.body || {};
  if (!leadId) return sendPbError(res, 400, 'leadId is required.');
  if (!assignToId) return sendPbError(res, 400, 'assignToId is required.');

  try {
    const result = await allocateSingleLead(auth, leadId, assignToId, remarks);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function bulkAllocateAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!checkManager(auth)) return sendPbError(res, 403, 'Permission denied.');

  const { leadIds, assignToId, remarks } = req.body || {};
  if (!Array.isArray(leadIds) || leadIds.length === 0) return sendPbError(res, 400, 'leadIds is required.');
  if (!assignToId) return sendPbError(res, 400, 'assignToId is required.');

  try {
    const result = await bulkAllocateLeads(auth, leadIds, assignToId, remarks);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function getAdminAllocationRequestsAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (auth.role !== 'admin' && !auth.isSuperuser) return sendPbError(res, 403, 'Admin access only.');

  try {
    const list = await getAdminAllocationRequests();
    res.json({ success: true, requests: list });
  } catch (err: any) {
    sendPbError(res, 500, err.message);
  }
}

export async function reviewAllocationRequestAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (auth.role !== 'admin' && !auth.isSuperuser) return sendPbError(res, 403, 'Admin access only.');

  const { requestId, action = 'approve', remarks } = req.body || {};
  if (!requestId) return sendPbError(res, 400, 'requestId is required.');

  try {
    const result = await reviewAllocationRequest(auth, requestId, action, remarks);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

