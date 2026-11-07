import { Request, Response } from 'express';
import { sendPbError } from '../../views/error.view.js';
import { bulkStatus, bulkDelete, bulkAssign, bulkNote } from '../../services/crm/bulkLeads.service.js';

function requireAdmin(req: Request, res: Response): any {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (auth.role !== 'admin' && !auth.isSuperuser) {
    return sendPbError(res, 403, 'Admin access required.');
  }
  return auth;
}

export async function bulkStatusAction(req: Request, res: Response): Promise<void> {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  const { leadIds, leadStatus } = req.body || {};
  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return sendPbError(res, 400, 'Select at least one lead.');
  }
  if (!leadStatus) return sendPbError(res, 400, 'A valid lead status is required.');

  try {
    const result = await bulkStatus(auth, leadIds, leadStatus);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function bulkDeleteAction(req: Request, res: Response): Promise<void> {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  const { leadIds, mode = 'trash', confirmPhrase = '' } = req.body || {};
  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return sendPbError(res, 400, 'Select at least one lead.');
  }

  try {
    const result = await bulkDelete(auth, leadIds, mode, confirmPhrase);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function bulkAssignAction(req: Request, res: Response): Promise<void> {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  const { leadIds, employeeId } = req.body || {};
  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return sendPbError(res, 400, 'Select at least one lead.');
  }
  if (!employeeId) return sendPbError(res, 400, 'employeeId is required.');

  try {
    const result = await bulkAssign(auth, leadIds, employeeId);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function bulkNoteAction(req: Request, res: Response): Promise<void> {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  const { leadIds, content } = req.body || {};
  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return sendPbError(res, 400, 'Select at least one lead.');
  }
  if (!content) return sendPbError(res, 400, 'Note text is required.');

  try {
    const result = await bulkNote(auth, leadIds, content);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

