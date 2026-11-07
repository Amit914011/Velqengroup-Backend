import { Request, Response } from 'express';
import { sendPbError } from '../../views/error.view.js';
import {
  directUpload,
  getManagerVisitors,
  getVisitorDetails,
  getVisitorFeedback,
  addVisitorFeedback,
  updateVisitorFeedback,
  deleteVisitorFeedback,
} from '../../services/crm/reception.service.js';

function checkManagerOrAdmin(auth: any): boolean {
  if (auth.role === 'admin' || auth.isSuperuser) return true;
  return !!(auth.permissions && auth.permissions.manageTeam);
}

export async function directUploadAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const isReception = auth.email === 'reception@velqengroup.com' || auth.email === 'receiption@velqengroup.com';
  if (auth.role !== 'admin' && !auth.isSuperuser && !isReception) {
    return sendPbError(res, 403, 'Only Reception can use Direct Upload.');
  }

  try {
    const result = await directUpload(auth, req.body);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function getVisitorsAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!checkManagerOrAdmin(auth)) return sendPbError(res, 403, 'Permission denied.');

  try {
    const data = await getManagerVisitors(auth);
    res.json(data);
  } catch (err: any) {
    sendPbError(res, 500, err.message);
  }
}

export async function getVisitorDetailsAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!checkManagerOrAdmin(auth)) return sendPbError(res, 403, 'Permission denied.');

  try {
    const data = await getVisitorDetails(auth, req.params.id);
    res.json(data);
  } catch (err: any) {
    sendPbError(res, 404, err.message);
  }
}

export async function getFeedbackAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!checkManagerOrAdmin(auth)) return sendPbError(res, 403, 'Permission denied.');

  try {
    const feedback = await getVisitorFeedback(auth, req.params.id);
    res.json({ feedback });
  } catch (err: any) {
    sendPbError(res, 500, err.message);
  }
}

export async function addFeedbackAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!checkManagerOrAdmin(auth)) return sendPbError(res, 403, 'Permission denied.');

  try {
    const feedback = await addVisitorFeedback(auth, req.params.id, req.body);
    res.json({ success: true, feedback });
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function updateFeedbackAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  try {
    const feedback = await updateVisitorFeedback(auth, req.params.fid, req.body);
    res.json({ success: true, feedback });
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function deleteFeedbackAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  try {
    const result = await deleteVisitorFeedback(auth, req.params.fid);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

