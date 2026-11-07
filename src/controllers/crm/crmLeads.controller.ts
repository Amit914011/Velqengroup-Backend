import { Request, Response } from 'express';
import { sendPbError } from '../../views/error.view.js';
import { enrollLead, editLead } from '../../services/crm/leads.service.js';

export async function enrollLeadAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  const { leadId, amount } = req.body || {};
  if (!leadId) return sendPbError(res, 400, 'leadId is required.');

  try {
    const result = await enrollLead(auth, leadId, Number(amount) || 0);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message || 'Could not enroll lead.');
  }
}

export async function editLeadAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  const hasPerm = auth.permissions && auth.permissions.manageTeam;
  if (!isAdmin && !hasPerm) {
    return sendPbError(res, 403, 'You do not have permission to edit leads.');
  }

  const { leadId } = req.body || {};
  if (!leadId) return sendPbError(res, 400, 'leadId is required.');

  try {
    const result = await editLead(auth, leadId, req.body);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message || 'Could not edit lead.');
  }
}

