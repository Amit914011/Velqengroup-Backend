import { Request, Response } from 'express';
import { sendPbError } from '../../views/error.view.js';
import {
  manualCandidate,
  bulkAllocateCandidates,
  diagnoseConnection,
} from '../../services/recruitment/recruitment.service.js';

export async function manualCandidateAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  try {
    const result = await manualCandidate(auth, req.body || {});
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 422, err.message);
  }
}

export async function bulkAllocateAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const { candidateIds, managerId } = req.body || {};
  if (!Array.isArray(candidateIds) || candidateIds.length === 0 || !managerId) {
    return sendPbError(res, 422, 'candidateIds and managerId are required.');
  }

  try {
    const result = await bulkAllocateCandidates(auth, candidateIds, managerId);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function diagnoseAction(req: Request, res: Response): Promise<void> {
  const token = req.query.token as string | undefined;
  const connectionId = req.query.connectionId as string | undefined;
  try {
    const result = await diagnoseConnection(token, connectionId);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 404, err.message);
  }
}

